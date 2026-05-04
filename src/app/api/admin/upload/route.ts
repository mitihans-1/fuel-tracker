import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  [key: string]: unknown;
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;
  if (!decoded || decoded.role !== "ADMIN") return null;
  return decoded;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Configure Cloudinary inside the handler to ensure env vars are fresh
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Check Cloudinary Config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ Missing Cloudinary credentials in environment");
      return NextResponse.json({ error: "Cloudinary is not configured on the server" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file uploaded or invalid file format" }, { status: 400 });
    }

    console.log(`📦 Received file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: "products",
          resource_type: "auto",
          transformation: [
            { width: 800, height: 600, crop: "fill", gravity: "auto", quality: "auto" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload stream error:", error);
            reject(error);
          }
          else if (result) {
            console.log("✅ Cloudinary upload successful:", result.secure_url);
            resolve(result as CloudinaryUploadResult);
          } else {
            reject(new Error("Empty result from Cloudinary"));
          }
        }
      );
      uploadStream.end(buffer);
    });

    const result = await uploadPromise;

    if (!result || !result.secure_url) {
      throw new Error("Cloudinary upload failed to return a secure URL");
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (error: unknown) {
    console.error("🚨 Detailed upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Upload failed", 
      details: errorMessage
    }, { status: 500 });
  }
}
