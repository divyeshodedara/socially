import { Server } from "socket.io";
import Message from "../models/messageModel.js";
import Notification from "../models/notificationModel.js";

let io;
const userSockets = new Map(); // Map userId to socketId

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Store user's socket connection and emit initial counts
    socket.on("user-connected", async (userId) => {
      userSockets.set(userId, socket.id);
      
      try {
        const [unreadMessageCount, unreadNotificationCount] = await Promise.all([
          Message.countDocuments({ receiver: userId, seen: false }),
          Notification.countDocuments({ recipient: userId, read: false }),
        ]);

        socket.emit("initial-counts", {
          unreadMessageCount,
          unreadNotificationCount,
        });
      } catch (error) {
        console.error("Error fetching initial counts:", error);
      }
    });

    // Handle typing indicator
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { userId: senderId });
      }
    });

    // Handle stop typing
    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { userId: senderId });
      }
    });

    // Handle marking messages as seen via WebSocket
    socket.on("markMessagesSeen", async ({ senderId, receiverId }) => {
      try {
        await Message.updateMany(
          { sender: senderId, receiver: receiverId, seen: false },
          { seen: true, seenAt: new Date() }
        );

        // Notify the sender that their messages were seen
        const senderSocketId = userSockets.get(senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("message", {
            type: "messagesSeen",
            seenBy: receiverId,
          });
        }
      } catch (error) {
        console.error("Error marking messages as seen via socket:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Remove user from map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Send notification to a specific user
export const sendNotificationToUser = (userId, notification) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("new-notification", notification);
  }
};

// Send new post to a specific user
export const sendNewPostToUser = (userId, post) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("newPost", post);
  }
};

// Broadcast new post to ALL connected users
export const broadcastNewPost = (post) => {
  if (io) {
    io.emit("newPost", post);
  }
};

export const sendPostDeletedToUser = (userId, postId) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("postDeleted", { postId });
  }
};

// Send message to a specific user
export const sendMessageToUser = (userId, data) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("message", data);
  }
};

// Broadcast post like update to all connected users
export const broadcastPostLikeUpdate = (postId, likesCount, userId) => {
  if (io) {
    io.emit("postLikeUpdated", { postId, likesCount, userId });
  }
};

// Broadcast new comment to all connected users
export const broadcastNewComment = (postId, comment, commentsCount) => {
  if (io) {
    io.emit("newComment", { postId, comment, commentsCount });
  }
};

// Send saved post update to a specific user
export const sendSavedPostUpdate = (userId, postId, isSaved, post = null) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("postSavedUpdated", { postId, isSaved, post });
  }
};

// Send follow/unfollow update to the affected user
export const sendFollowUpdateToUser = (userId, data) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("follow-update", data);
  }
};

export default {
  initializeSocket,
  getIO,
  sendNotificationToUser,
  sendNewPostToUser,
  broadcastNewPost,
  sendMessageToUser,
  broadcastPostLikeUpdate,
  broadcastNewComment,
  sendSavedPostUpdate,
  sendPostDeletedToUser,
  sendFollowUpdateToUser,
};
