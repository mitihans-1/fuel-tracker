import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station"
  },
  fuelType: String,
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING"
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "CANCELED", "COMPLETED"],
    default: "PENDING"
  }
}, { timestamps: true });

export default mongoose.models.request ||
  mongoose.model("request", requestSchema);