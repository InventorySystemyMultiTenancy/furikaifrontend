import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const media = await prisma.mediaFile.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ media });
}

const schema = z.object({
  url: z.string().min(1),
  publicId: z.string().min(1),
  type: z.enum(["IMAGE", "VIDEO", "MODEL_3D"]),
  tag: z.string().optional(),
  originalName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const media = await prisma.mediaFile.create({
    data: { ...parsed.data, uploadedById: session!.user.id },
  });

  return NextResponse.json({ media });
}
