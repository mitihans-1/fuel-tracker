import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  role: {
    type: String,
    enum: ["ADMIN", "DRIVER", "STATION"],
    default: "DRIVER",
  },
});

export default mongoose.models.user || mongoose.model("user", userSchema);