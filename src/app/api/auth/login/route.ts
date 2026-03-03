import { connectDB } from "@/lib/db";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();
  const user = await User.findOne({ email });
  if (!user)
    return Response.json({ message: "User not found" });
  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch)
    return Response.json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user._id },
    "SECRET_KEY",
    { expiresIn: "1d" }
  );

  return Response.json({ token });
}