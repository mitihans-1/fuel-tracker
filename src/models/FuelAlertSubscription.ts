import mongoose from "mongoose";

const fuelAlertSubscriptionSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: false,
    },
    fuelType: {
      type: String,
      enum: ["petrol", "diesel"],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

fuelAlertSubscriptionSchema.index(
  { driverId: 1, stationId: 1, fuelType: 1 },
  { unique: true }
);

export default mongoose.models.FuelAlertSubscription ||
  mongoose.model("FuelAlertSubscription", fuelAlertSubscriptionSchema);

