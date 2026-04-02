import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import * as authController from "../controllers/authControllers.js";
import * as rateLimiter from "../middleware/rateLimiter.js";

const router = express.Router();

//public routes
router.post("/signup", rateLimiter.authLimiter, authController.signup);
router.post("/login", rateLimiter.loginLimiter, authController.login);
router.post("/verify", rateLimiter.emailVerificationLimiter, authController.verifyOtp);
router.post("/resend-otp", rateLimiter.emailVerificationLimiter, authController.resendOtp);
router.post("/forget-password", rateLimiter.passwordResetLimiter, authController.forgetPassword);
router.post("/reset-password", rateLimiter.passwordResetLimiter, authController.resetPassword);

//protected routes
router.post("/logout", authMiddleware, authController.logout);

export default router;
