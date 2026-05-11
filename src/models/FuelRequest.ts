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
  stationEarning: {
    type: Number,
    required: true,
    default: 0
  },
  platformCommission: {
    type: Number,
    required: true,
    default: 0
  },
  commissionRate: {
    type: Number,
    required: true,
    default: 0
  },
  payoutStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING"
  },
  payoutAt: {
    type: Date,
    required: false
  },
  refundStatus: {
    type: String,
    enum: ["NONE", "PROCESSED"],
    default: "NONE"
  },
  refundAt: {
    type: Date,
    required: false
  },
  refundAmount: {
    type: Number,
    required: true,
    default: 0
  },
  stationReversal: {
    type: Number,
    required: true,
    default: 0
  },
  commissionReversal: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
    default: "PENDING"
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "CANCELED", "COMPLETED"],
    default: "PENDING"
  },
  meta: {
    tx_ref: { type: String, unique: true, sparse: true, index: true },
    paymentProvider: { type: String, default: "CHAPA" }
  },

  reservationExpiresAt: {
    type: Date,
    required: false,
  },
  qrToken: {
    type: String,
    required: false,
  },
}, { timestamps: true });

export default mongoose.models.request ||
  mongoose.model("request", requestSchema);