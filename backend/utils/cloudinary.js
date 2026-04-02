import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

const uploadToCloudinary = async (fileUrl) => {
  try {
    const response = await cloudinary.uploader.upload(fileUrl, {
      resource_type: "auto",
      folder: "social_media_app",
      upload_preset: undefined,
    });
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "Failed to upload image to cloudinary");
  }
};

export { uploadToCloudinary, cloudinary };
