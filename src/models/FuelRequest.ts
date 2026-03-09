import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "station"
  },
  fuelType: String,
  status: {
    type: String,
    default: "PENDING"
  }
});

export default mongoose.models.request ||
  mongoose.model("request", requestSchema);