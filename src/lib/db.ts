import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect("mongodb://127.0.0.1:27017/fueltracker");
  console.log("database connected");
}