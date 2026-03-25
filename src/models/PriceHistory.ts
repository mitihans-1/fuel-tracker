import mongoose from "mongoose";

const priceHistorySchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
  },
  { timestamps: true }
);

priceHistorySchema.index({ stationId: 1, fuelType: 1, createdAt: -1 });

export default mongoose.models.PriceHistory ||
  mongoose.model("PriceHistory", priceHistorySchema);
