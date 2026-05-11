import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: {
      type: String,
      enum: ["TOP_UP", "DEBIT", "REFUND"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    relatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "request",
      required: false,
    },
    txRef: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WalletTransaction ||
  mongoose.model("WalletTransaction", walletTransactionSchema);

