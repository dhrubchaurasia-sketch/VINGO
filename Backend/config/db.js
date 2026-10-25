
import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Database Connected Successfully.");
  } catch (error) {
    console.error("MongoDB Connection Error:");
    console.error(error);
  }
};

export default connectDb;