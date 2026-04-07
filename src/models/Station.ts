import mongoose, { Document, Model } from "mongoose";

export interface IStation extends Document {
  name: string;
  location: string;
  petrol: boolean;
  petrolQty: number;
  petrolPrice: number;
  diesel: boolean;
  dieselQty: number;
  dieselPrice: number;
  ownerUserId?: mongoose.Types.ObjectId;
  avgRating: number;
  ratingCount: number;
  latitude?: number;
  longitude?: number;
  zone?: string;
  woreda?: string;
  kebele?: string;
  updatedAt: Date;
  isSetupComplete: boolean;
}

const StationSchema = new mongoose.Schema<IStation>({
  name: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },

  petrol: {
    type: Boolean,
    default: false,
  },
  petrolQty: {
    type: Number,
    default: 0,
  },
  petrolPrice: {
    type: Number,
    default: 80, // Default price in ETB
  },

  diesel: {
    type: Boolean,
    default: false,
  },
  dieselQty: {
    type: Number,
    default: 0,
  },
  dieselPrice: {
    type: Number,
    default: 75, // Default price in ETB
  },

  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,
  },

  avgRating: {
    type: Number,
    default: 0,
  },

  ratingCount: {
    type: Number,
    default: 0,
  },

  latitude: {
    type: Number,
    required: false,
  },

  longitude: {
    type: Number,
    required: false,
  },

  zone: {
    type: String,
    required: false,
  },
  woreda: {
    type: String,
    required: false,
  },
  kebele: {
    type: String,
    required: false,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isSetupComplete: {
    type: Boolean,
    default: false,
  },
});

export default (mongoose.models.Station as Model<IStation>) ||
  mongoose.model<IStation>("Station", StationSchema);