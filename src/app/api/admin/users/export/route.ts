import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const users = await prisma.user.findMany({
    include: { orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
  });

  const header = ["Nome", "E-mail", "Papel", "Bloqueado", "Pedidos", "Total gasto"].join(";");
  const rows = users.map((u) =>
    [
      u.name,
      u.email,
      u.role,
      u.blocked ? "Sim" : "Não",
      u.orders.length,
      u.orders.reduce((s, o) => s + Number(o.total), 0).toFixed(2).replace(".", ","),
    ].join(";")
  );

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="furikai-usuarios.csv"`,
    },
  });
}
