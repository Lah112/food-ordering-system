import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const connectDB = async () => {
  try {
    // Make sure to use MONGO_URI instead of MONGO_URL
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (error) {
    console.error("DB connection failed", error);
    process.exit(1);  // Exit process with failure
  }
};
