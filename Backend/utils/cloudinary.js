import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadOnCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    
  });
  // console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
// console.log("SECRET EXISTS:", !!process.env.CLOUDINARY_API_SECRET);
  try {
    // console.log("FILE PATH:", file);
    const result = await cloudinary.uploader.upload(file)
    // console.log("UPLOAD SUCCESS:", result.secure_url);
    //   folder: "your_folder_name", // Optional: specify a folder in Cloudinary
    fs.unlinkSync(file); // Delete the local file after successful upload
    return result.secure_url; // Return the secure URL of the uploaded file
}catch (error) { 
    // console.log("========== CLOUDINARY ERROR ==========");
    // console.log("STATUS:", error.http_code);
    // console.log("MESSAGE:", error.message);
    // console.log("ERROR:", error.error);
    // console.log("RESPONSE:", error.response?.body);
    // console.log("======================================");

    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }

    throw new Error("Failed to upload file to Cloudinary");
}
};

export default uploadOnCloudinary;