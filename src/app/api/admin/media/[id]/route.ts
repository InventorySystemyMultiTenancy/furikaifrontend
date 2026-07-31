import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const media = await prisma.mediaFile.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(media.publicId, {
        resource_type: media.type === "VIDEO" ? "video" : media.type === "MODEL_3D" ? "raw" : "image",
      });
    } catch {
      // Se falhar no Cloudinary, ainda assim removemos o registro local.
    }
  }

  await prisma.mediaFile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
