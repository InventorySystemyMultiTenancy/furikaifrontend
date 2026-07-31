import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return { session: null, error: NextResponse.json({ error: "Acesso negado." }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function logAdminAction(params: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: unknown;
}) {
  await prisma.adminLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details ? JSON.stringify(params.details) : undefined,
    },
  });
}
