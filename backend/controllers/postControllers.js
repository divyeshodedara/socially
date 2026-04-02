import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import sharp from "sharp";
import { cloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import { createNotification } from "./notificationController.js";
import {
  sendNewPostToUser,
  broadcastPostLikeUpdate,
  broadcastNewComment,
  sendSavedPostUpdate,
  sendPostDeletedToUser,
} from "../utils/socket.js";
import redis from "../utils/redis.js";

const createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;
  const userId = req.user?._id;
  const image = req.file;

  if (!image) throw new AppError("Image is required for the post", 400);

  const optimizedImageBuffer = await sharp(image.buffer)
    .resize({
      height: 800,
      width: 800,
      fit: "inside",
    })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();

  const fileUrl = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;

  const cloudResponse = await uploadToCloudinary(fileUrl);

  let post = await Post.create({
    caption,
    image: {
      url: cloudResponse.secure_url,
      public_id: cloudResponse.public_id,
    },
    user: userId,
  });

  const user = await User.findById(userId);

  if (user) {
    user.posts.push(post.id);
    await user.save({ validateBeforeSave: false });
  }

  post = await post.populate({
    path: "user",
    select: "username email bio profilePicture",
  });

  // Emit new post to the creator and all followers via Socket.IO
  const creator = await User.findById(userId).select("followers");

  // Send to the creator themselves first
  sendNewPostToUser(userId.toString(), post);

  // Send to all followers
  if (creator && creator.followers && creator.followers.length > 0) {
    creator.followers.forEach((followerId) => {
      sendNewPostToUser(followerId.toString(), post);
    });
  }

  res.status(201).json({
    status: "Success",
    message: "Post Created",
  });
});

const getAllPosts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const cacheKey = `posts:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const [posts, total] = await Promise.all([
    Post.find()
      .populate({ path: "user", select: "username profilePicture" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(),
  ]);

  const hasMore = skip + posts.length < total;

  const responseData = {
    status: "Success",
    results: posts.length,
    data: {
      posts,
      hasMore,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    },
  };

  await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60); // 1 min TTL

  res.status(200).json(responseData);
});

const getUserPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "Success",
    results: posts.length,
    data: { posts },
  });
});

const saveOrUnsavePost = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;
  const postId = req.params.postId;

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const isSaved = user.savedPosts.includes(postId);

  if (isSaved) {
    user.savedPosts.pull(postId);
    await user.save({ validateBeforeSave: false });

    // Send socket update to user
    sendSavedPostUpdate(userId, postId, false);

    res.status(200).json({
      status: "Success",
      message: "Post unsaved Successfully",
    });
  } else {
    user.savedPosts.push(postId);
    await user.save({ validateBeforeSave: false });

    // Fetch the post details to send to user
    const post = await Post.findById(postId).populate({
      path: "user",
      select: "username profilePicture",
    });

    // Send socket update to user with post details
    sendSavedPostUpdate(userId, postId, true, post);

    res.status(200).json({
      status: "Success",
      message: "Post saved Successfully",
      // data: { user },
    });
  }
});

const deletePost = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post) throw new AppError("Post not found", 404);
  if (post.user.toString() !== userId.toString()) {
    throw new AppError("You are not authorized to delete this post", 403);
  }

  const creator = await User.findById(userId).select("followers");

  await User.updateOne({ _id: userId }, { $pull: { posts: postId } });

  await User.updateMany({ savedPosts: postId }, { $pull: { savedPosts: postId } });

  await Comment.deleteMany({ post: postId });

  if (post.image && post.image.public_id) {
    await cloudinary.uploader.destroy(post.image.public_id);
  }

  await Post.findByIdAndDelete(postId);

  sendPostDeletedToUser(userId.toString(), postId);

  if (creator?.followers?.length > 0) {
    creator.followers.forEach((followerId) => {
      sendPostDeletedToUser(followerId.toString(), postId);
    });
  }

  res.status(200).json({
    status: "Success",
    message: "Post deleted Successfully",
  });
});

const likeOrDislikePost = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;
  const postId = req.params.postId;

  const post = await Post.findById(postId).select("likes user");

  if (!post) throw new AppError("Post not found", 404);

  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.addToSet(userId);
  }

  await post.save();

  if (!alreadyLiked) {
    await createNotification({
      recipient: post.user,
      sender: userId,
      type: "like",
      post: postId,
    });
  }

  // Broadcast the like update to all connected users
  broadcastPostLikeUpdate(postId, post.likes.length, userId);

  res.status(200).json({
    status: "Success",
    message: alreadyLiked ? "Post disliked" : "Post liked",
  });
});

const addComment = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;
  const postId = req.params.postId;
  const { text } = req.body;
  if (!text) throw new AppError("Comment text is required", 400);

  const comment = await Comment.create({
    text,
    user: userId,
    post: postId,
  });

  const post = await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } }, { new: true });

  if (!post) throw new AppError("Post not found", 404);

  await comment.populate({
    path: "user",
    select: "username email bio profilePicture",
  });

  // Send notification for new comment
  await createNotification({
    recipient: post.user,
    sender: userId,
    type: "comment",
    post: postId,
    comment: text,
  });

  // Broadcast the new comment to all connected users
  broadcastNewComment(postId, comment, post.comments.length);

  res.status(201).json({
    status: "Success",
    message: "Comment added successfully",
    data: { comment },
  });
});

const getPostComments = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;

  const comments = await Comment.find({ post: postId })
    .populate({
      path: "user",
      select: "username profilePicture",
    })
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: "Success",
    results: comments.length,
    data: { comments },
  });
});

export {
  createPost,
  getAllPosts,
  getUserPosts,
  saveOrUnsavePost,
  deletePost,
  likeOrDislikePost,
  addComment,
  getPostComments,
};
