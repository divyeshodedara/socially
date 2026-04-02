import crypto from "crypto";

const generateOTP = (length = 6) => {
  const otp = crypto.randomInt(0, 10 ** length);
  return otp.toString().padStart(length, "0");
};

export default generateOTP;
