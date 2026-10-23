import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer)) {
      return reject(
        new Error("Invalid image buffer. Check Multer req.file.buffer.")
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "vingo-food-items",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("CLOUDINARY UPLOAD ERROR:", error);
          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(new Error("Cloudinary did not return an image URL."));
        }

        resolve(result.secure_url);
      }
    );

    Readable.from([buffer]).pipe(uploadStream);
  });
};

export default uploadOnCloudinary;


