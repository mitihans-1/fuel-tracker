import mongoose from "mongoose";

const FuelRequestSchema = new mongoose.Schema({

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true
  },

  fuelType: {
    type: String,
    enum: ["petrol", "diesel"],
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

export default mongoose.models.FuelRequest ||
mongoose.model("FuelRequest", FuelRequestSchema);