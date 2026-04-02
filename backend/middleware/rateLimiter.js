import { ipKeyGenerator, rateLimit } from "express-rate-limit";

// Reusable rate limiter factory function
const createRateLimiter = (windowMs, max, message = "Too many attempts. Please try again later.") => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const forwarded = req.headers["x-forwarded-for"];

      const ip = forwarded?.split(",")[0] || req.ip;
      // console.log("DEBUG IP FIXED:", {
      //   forwarded,
      //   reqIp: req.ip,
      //   finalIp: ip,
      // });

      if (req.user?._id) {
        return `user:${req.user._id}`;
      }

      return `ip:${ipKeyGenerator(ip)}`;
    },

    handler: (req, res) => {
      res.status(429).json({
        status: "fail",
        message,
      });
    },
  });
};

// General API rate limiter - 500 requests per 15 minutes
export const apiLimiter = createRateLimiter(15 * 60 * 1000, 500, "Too many requests. Please try again later.");

// Strict limiter for auth routes - 5 requests per 15 minutes
export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  "Too many authentication attempts. Please try again later.",
);

// Login limiter - 5 requests per 15 minutes
export const loginLimiter = createRateLimiter(15 * 60 * 1000, 5, "Too many login attempts. Please try again later.");

// Password reset limiter - 3 requests per hour
export const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  "Too many password reset attempts. Please try again later.",
);

// Post creation limiter - 10 posts per hour
export const postCreationLimiter = createRateLimiter(
  60 * 60 * 1000,
  10,
  "Too many posts created. Please try again later.",
);

// Message limiter - 50 messages per 15 minutes
export const messageLimiter = createRateLimiter(15 * 60 * 1000, 50, "Too many messages. Please try again later.");

// Email verification limiter - 3 requests per hour
export const emailVerificationLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  "Too many verification attempts. Please try again later.",
);

// Interaction limiter - 100 interactions (likes/comments) per hour
export const interactionLimiter = createRateLimiter(60 * 60 * 1000, 100, "Too many interactions. Please slow down.");

// Comment limiter - 30 comments per hour
export const commentLimiter = createRateLimiter(60 * 60 * 1000, 30, "Too many comments. Please slow down.");
