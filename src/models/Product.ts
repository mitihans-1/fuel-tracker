import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["petrol", "diesel"],
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    default: [],
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
