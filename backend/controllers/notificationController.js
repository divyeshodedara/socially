import Notification from "../models/notificationModel.js";
import { sendNotificationToUser } from "../utils/socket.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

// Create a notification and send it via socket
export const createNotification = async ({ recipient, sender, type, post, comment }) => {
  try {
    // Don't create notification if user is notifying themselves
    if (recipient.toString() === sender.toString()) {
      return null;
    }

    // Create notification in database
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      comment,
    });

    // Populate sender info
    await notification.populate("sender", "username profilePicture");
    if (post) {
      await notification.populate("post", "image");
    }

    // Send real-time notification via socket
    sendNotificationToUser(recipient, notification);

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Get all notifications for the logged-in user
export const getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate("sender", "username profilePicture")
    .populate("post", "image")
    .sort("-createdAt")
    .limit(20);

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: {
      notifications,
    },
  });
});

// Mark notification as read
export const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true },
  );

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});

// Mark all notifications as read
export const markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read",
  });
});

// Delete a notification
export const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get unread notification count
export const getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.status(200).json({
    status: "success",
    data: {
      count,
    },
  });
});
