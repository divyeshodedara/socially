import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file, folder = "posts") => {
  try {
    const ext = file.originalname.split(".").pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return {
      url: `${process.env.S3_PUBLIC_URL}/${key}`,
      key, 
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error(error.message || "Failed to upload image to S3");
  }
};

const deleteFromS3 = async (key) => {
  try {
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    }));
  } catch (error) {
    console.error("S3 delete error:", error);
    throw new Error(error.message || "Failed to delete image from S3");
  }
};

export { uploadToS3, deleteFromS3 };