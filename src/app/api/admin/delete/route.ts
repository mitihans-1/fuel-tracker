import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import Station from "@/models/Station";

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete associated stations
    await Station.deleteMany({ ownerUserId: id });

    return NextResponse.json({ message: "User and associated stations deleted successfully" });
  } catch (err) {
    console.error("Admin delete error:", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
