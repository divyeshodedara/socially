import sharp from "sharp";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendMessageToUser } from "../utils/socket.js";

// Send a new message
export const sendMessage = catchAsync(async (req, res, next) => {
  const { receiverId, message } = req.body;
  const senderId = req.user._id;
  const image = req.file;
  if (!receiverId) {
    return next(new AppError("Receiver ID is required", 400));
  }

  if (!message && !image) {
    return next(new AppError("Message or image is required", 400));
  }

  let imageData = null;

  // Handle image upload if present
  if (image) {
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
    imageData = {
      url: cloudResponse.secure_url,
      public_id: cloudResponse.public_id,
    };
  }

  // Create message
  let newMessage = await Message.create({
    sender: senderId,
    receiver: receiverId,
    message: message || "",
    image: imageData,
  });

  // Populate sender details
  newMessage = await newMessage.populate({
    path: "sender",
    select: "username profilePicture",
  });

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      lastMessage: newMessage._id,
    });
  } else {
    conversation.lastMessage = newMessage._id;
    await conversation.save();
  }

  // Send message via socket to receiver
  sendMessageToUser(receiverId, {
    type: "newMessage",
    message: newMessage,
  });

  res.status(201).json({
    status: "success",
    data: {
      message: newMessage,
    },
  });
});

// Get all messages between two users
export const getMessages = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: userId },
      { sender: userId, receiver: currentUserId },
    ],
  })
    .populate({
      path: "sender",
      select: "username profilePicture",
    })
    .populate({
      path: "receiver",
      select: "username profilePicture",
    })
    .sort({ createdAt: 1 });

  res.status(200).json({
    status: "success",
    data: {
      messages,
    },
  });
});

// Get all conversations for current user
export const getConversations = catchAsync(async (req, res, next) => {
  const userId = req.user?._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate({
      path: "participants",
      select: "username profilePicture",
    })
    .populate({
      path: "lastMessage",
      select: "message image seen createdAt sender receiver",
      populate: [
        { path: "sender", select: "_id username" },
        { path: "receiver", select: "_id username" },
      ],
    })
    .sort({ updatedAt: -1 });
  res.status(200).json({
    status: "success",
    data: {
      conversations,
    },
  });
});

// Mark messages as seen
export const markAsSeen = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;
  await Message.updateMany(
    {
      sender: userId,
      receiver: currentUserId,
      seen: false,
    },
    {
      seen: true,
      seenAt: new Date(),
    },
  );

  // Notify sender via socket that messages were seen
  sendMessageToUser(userId, {
    type: "messagesSeen",
    seenBy: currentUserId,
  });

  res.status(200).json({
    status: "success",
    message: "Messages marked as seen",
  });
});

export const getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const unreadCount = await Message.countDocuments({
    receiver: userId,
    seen: false,
  });

  res.status(200).json({
    status: "success",
    data: {
      unreadCount,
    },
  });
});
