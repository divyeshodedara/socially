import express from "express";
import upload from "../middleware/multer.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
import * as messageController from "../controllers/messageController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/conversations", messageController.getConversations);
router.get("/unread/count", messageController.getUnreadCount);
router.post("/send", messageLimiter, upload.single("image"), messageController.sendMessage);
router.patch("/:userId/seen", messageController.markAsSeen);
router.get("/:userId", messageController.getMessages);

export default router;
