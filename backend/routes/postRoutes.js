import express from "express";
import upload from "../middleware/multer.js";
import authMiddleware from "../middleware/authMiddleware.js";
import * as postController from "../controllers/postControllers.js";
import { postCreationLimiter, commentLimiter, interactionLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/all-posts", postController.getAllPosts);
router.get("/user-posts/:id", postController.getUserPosts);
router.get("/:postId/comments", postController.getPostComments);
router.post("/create-post", postCreationLimiter, upload.single("image"), postController.createPost);
router.post("/save/:postId", postController.saveOrUnsavePost);
router.post("/like-dislike/:postId", interactionLimiter, postController.likeOrDislikePost);
router.post("/comment/:postId", commentLimiter, postController.addComment);
router.delete("/delete/:postId", postController.deletePost);

export default router;
