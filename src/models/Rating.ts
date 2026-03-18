import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    score: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

ratingSchema.index({ stationId: 1, driverId: 1 }, { unique: true });

export default mongoose.models.Rating ||
  mongoose.model("Rating", ratingSchema);

