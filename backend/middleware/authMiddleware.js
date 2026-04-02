import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import redis from "../utils/redis.js";

const authMiddleware = catchAsync(async (req, res, next) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const cachekey = `user:${decoded.id}`;

  const cachedUser = await redis.get(cachekey);
  if (cachedUser) {
    req.user = JSON.parse(cachedUser);
    return next();
  }

  const currentUser = await User.findById(decoded.id).select("-password -otp -otpExpiry");

  if (!currentUser) {
    return next(new AppError("The user belonging to this token does no longer exist.", 401));
  }

  await redis.set(cachekey, JSON.stringify(currentUser), "EX", 60 * 60); // Cache for 1 hour
  req.user = currentUser;
  next();
});

export default authMiddleware;
