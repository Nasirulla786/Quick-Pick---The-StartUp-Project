import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_ClOUD_SECRET,
});

const uploadOnCloudinary = async (file) => {
  try {
    const upload = await cloudinary.uploader.upload(file.path);
    fs.unlinkSync(file.path);
    return upload.secure_url;
  } catch (error) {
    console.log("Cloudinary error:", error);
    console.log("Cloudinary message:", error.message);
    console.log("Cloudinary response:", error.error);
  }
};

export default uploadOnCloudinary;
