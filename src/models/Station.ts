import mongoose from "mongoose";

const StationSchema = new mongoose.Schema({
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

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Station ||
  mongoose.model("Station", StationSchema);