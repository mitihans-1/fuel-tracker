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

  diesel: {
    type: Boolean,
    default: false,
  },

  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false,
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