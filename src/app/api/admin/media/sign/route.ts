import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { isCloudinaryConfigured, signUploadParams } from "@/lib/cloudinary";

export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no .env." },
      { status: 400 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "furikai";
  const signature = signUploadParams({ timestamp, folder });

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
