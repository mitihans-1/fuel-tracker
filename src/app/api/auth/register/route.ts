import { connectDB } from "@/lib/db";
import UserModel from "@/models/user";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectDB();
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    role, // "DRIVER", "STATION", "ADMIN"
  });

  return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
}