import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: status ? { status: status as never } : {},
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = ["Número", "Cliente", "E-mail", "Status", "Total", "Data"].join(";");
  const rows = orders.map((o) =>
    [
      o.number,
      o.user.name,
      o.user.email,
      ORDER_STATUS_LABEL[o.status],
      Number(o.total).toFixed(2).replace(".", ","),
      o.createdAt.toISOString().slice(0, 10),
    ].join(";")
  );

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="furikai-pedidos.csv"`,
    },
  });
}
