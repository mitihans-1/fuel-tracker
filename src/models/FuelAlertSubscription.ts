import mongoose, { Document, Model } from "mongoose";

export interface IFuelAlertSubscription extends Document {
  driverId: mongoose.Types.ObjectId;
  stationId?: mongoose.Types.ObjectId;
  fuelType: "petrol" | "diesel";
  active: boolean;
}

const fuelAlertSubscriptionSchema = new mongoose.Schema<IFuelAlertSubscription>(
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

export default (mongoose.models.FuelAlertSubscription as Model<IFuelAlertSubscription>) ||
  mongoose.model<IFuelAlertSubscription>("FuelAlertSubscription", fuelAlertSubscriptionSchema);

