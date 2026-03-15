import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "ETB",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Wallet ||
  mongoose.model("Wallet", walletSchema);

