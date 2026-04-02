import express from "express";
import upload from "../middleware/multer.js";
import authMiddleware from "../middleware/authMiddleware.js";
import * as userController from "../controllers/userControllers.js";
import { interactionLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

//protect routes after this middleware
router.use(authMiddleware);

router.get("/me", userController.getMe);
router.get("/search", userController.searchUsers);
router.get("/profile/:id", userController.getProfile);
router.get("/suggested-users", userController.suggestedUser);
router.get("/following/:id", userController.getFollowing);
router.post("/follow/:id", interactionLimiter, userController.followUser);
router.post("/unfollow/:id", interactionLimiter, userController.unfollowUser);
router.post("/edit-profile", upload.single("profilePicture"), userController.editProfile);

export default router;
