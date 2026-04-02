import "./utils/env.js";
import mongoose from "mongoose";
import app from "./app.js";
import redis from "./utils/redis.js";
import { initializeSocket } from "./utils/socket.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB connected successfully!");

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    initializeSocket(server);
    console.log("Socket.IO initialized");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
