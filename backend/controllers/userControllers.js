import AppError from "../utils/appError.js";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import getDataUri from "../utils/dataUri.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { createNotification } from "./notificationController.js";
import redis from "../utils/redis.js";

const getProfile = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId)
    .select("-password -otp -otpExpiry -resetPasswordOtp -resetPasswordOtpExpiry")
    .populate({
      path: "posts",
      options: { sort: { createdAt: -1 }, limit: 12 },
    })
    .populate({
      path: "savedPosts",
      options: { sort: { createdAt: -1 }, limit: 12 },
    })
    .lean();

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

const editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { bio } = req.body;
  const profilePicture = req.file;

  let cloudResponse;

  if (profilePicture) {
    const fileUrl = getDataUri(profilePicture);
    cloudResponse = await uploadToCloudinary(fileUrl);
  }

  const user = await User.findById(userId).select("-password");

  if (!user) throw new AppError("user does not found", 404);

  if (bio) user.bio = bio;
  if (profilePicture) user.profilePicture = cloudResponse.secure_url;

  await user.save({ validateBeforeSave: false });

  await redis.del(`user:${userId}`); // Invalidate cache after profile update

  res.status(200).json({
    message: "profile updated",
    status: "success",
    data: { user },
  });
});

const suggestedUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const currentUser = await User.findById(userId).select("following");

  const users = await User.find({
    _id: { $ne: userId, $nin: currentUser.following },
  })
    .select("_id username bio profilePicture followers")
    .limit(20)
    .lean();

  res.status(200).json({
    status: "success",
    data: { users },
  });
});

const followUser = catchAsync(async (req, res, next) => {
  const idToFollow = req.params.id; // ID of the user to follow
  const currentUserId = req.user?._id; // ID of the current logged-in user

  if (idToFollow === currentUserId) {
    return next(new AppError("You cannot follow yourself", 400));
  }

  const userToFollow = await User.findById(idToFollow);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow) {
    return next(new AppError("User to follow not found", 404));
  }

  if (currentUser.following.includes(idToFollow)) {
    return next(new AppError("You are already following this user", 400));
  }

  // Add to following list of current user
  currentUser.following.push(idToFollow);
  // Add to followers list of the user to follow
  userToFollow.followers.push(currentUserId);

  await currentUser.save({ validateBeforeSave: false });
  await userToFollow.save({ validateBeforeSave: false });

  // Send follow notification
  await createNotification({
    recipient: idToFollow,
    sender: currentUserId,
    type: "follow",
  });

  res.status(200).json({
    status: "success",
    message: "User followed successfully",
  });
});

const unfollowUser = catchAsync(async (req, res, next) => {
  const idToUnfollow = req.params.id; // ID of the user to unfollow
  const currentUserId = req.user?._id; // ID of the current logged-in user

  if (idToUnfollow === currentUserId) {
    return next(new AppError("You cannot unfollow yourself", 400));
  }

  const userToUnfollow = await User.findById(idToUnfollow);
  const currentUser = await User.findById(currentUserId);

  if (!userToUnfollow) {
    return next(new AppError("User to unfollow not found", 404));
  }

  if (!currentUser.following.includes(idToUnfollow)) {
    return next(new AppError("You are not following this user", 400));
  }

  // Remove from following list of current user
  currentUser.following = currentUser.following.filter((followId) => followId.toString() !== idToUnfollow.toString());
  // Remove from followers list of the user to unfollow
  userToUnfollow.followers = userToUnfollow.followers.filter(
    (followerId) => followerId.toString() !== currentUserId.toString(),
  );

  await currentUser.save({ validateBeforeSave: false });
  await userToUnfollow.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "User unfollowed successfully",
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!user) throw new AppError("User nor authenticated", 404);

  res.status(200).json({
    status: "success",
    message: "User is Authenticated",
    data: { user },
  });
});

const searchUsers = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  const currentUserId = req.user?._id;

  if (!query || query.trim().length === 0) {
    return res.status(200).json({
      status: "success",
      data: { users: [] },
    });
  }

  // Search users by username or bio (case-insensitive)
  const users = await User.find({
    _id: { $ne: currentUserId },
    $or: [{ username: { $regex: query, $options: "i" } }, { bio: { $regex: query, $options: "i" } }],
  })
    .select("_id username bio profilePicture")
    .limit(10);

  res.status(200).json({
    status: "success",
    data: { users },
  });
});

const getFollowing = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select("following")
    .populate("following", "_id username bio profilePicture followers")
    .lean();

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: { following: user.following },
  });
});

export { getProfile, editProfile, suggestedUser, followUser, unfollowUser, getMe, searchUsers, getFollowing };
