import { connectDB } from "@/lib/db";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET || "secretkey";

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    SECRET,
    { expiresIn: "1d" }
  );

  const response = NextResponse.json({
    message: "Login successful",
    role: user.role,
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return response;
}