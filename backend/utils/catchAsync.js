// utils/catchAsync.js
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync
// This utility function wraps asynchronous route handlers to catch errors and pass them to the next middleware.
// It helps in avoiding repetitive try-catch blocks in each route handler.