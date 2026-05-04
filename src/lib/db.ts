import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    console.log("DB: Connecting to MongoDB...");
    
    // Add connection options for better stability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(MONGODB_URI, options);
    console.log("✅ Database connected successfully");
    return conn;
  } catch (err) {
    console.error("❌ Database connection error:", err);
    // Log more specific error info if available
    if (err instanceof Error) {
      console.error("Error Name:", err.name);
      console.error("Error Message:", err.message);
    }
    throw err;
  }
}

export default connectDB;