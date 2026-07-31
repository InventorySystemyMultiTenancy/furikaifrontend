import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const from = sp.get("from") ? new Date(sp.get("from")!) : startOfMonth();
  const to = sp.get("to") ? new Date(sp.get("to")!) : new Date();

  const [ordersInRange, refundedInRange, expensesInRange, newCustomers, pendingOrders, lowStock, allTimePaid] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: from, lte: to }, status: { in: [...PAID_STATUSES] } },
        include: { items: true, payments: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: from, lte: to }, status: "REFUNDED" },
      }),
      prisma.expense.findMany({ where: { date: { gte: from, lte: to } } }),
      prisma.user.count({ where: { createdAt: { gte: from, lte: to }, role: "CUSTOMER" } }),
      prisma.order.count({ where: { status: "AWAITING_PAYMENT" } }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        include: { product: { select: { name: true, active: true } } },
        orderBy: { stock: "asc" },
        take: 20,
      }),
      prisma.order.aggregate({
        where: { status: { in: [...PAID_STATUSES] } },
        _sum: { total: true },
        _count: true,
      }),
    ]);

  const receitaBruta = ordersInRange.reduce((s, o) => s + Number(o.subtotal), 0);
  const descontos = ordersInRange.reduce((s, o) => s + Number(o.discount), 0);
  const reembolsos = refundedInRange.reduce((s, o) => s + Number(o.total), 0);
  const taxasPagamento = ordersInRange.reduce(
    (s, o) => s + o.payments.reduce((sp2, p) => sp2 + Number(p.feeAmount), 0),
    0
  );
  const receitaLiquida = receitaBruta - descontos - reembolsos - taxasPagamento;

  const custoProdutos = ordersInRange.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + Number(i.unitCost) * i.quantity, 0),
    0
  );
  const lucroBruto = receitaLiquida - custoProdutos;

  const despesas = expensesInRange.reduce((s, e) => s + Number(e.amount), 0);
  const lucroLiquido = lucroBruto - despesas;
  const margemLucro = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

  const numeroPedidos = ordersInRange.length;
  const ticketMedio = numeroPedidos > 0 ? receitaBruta / numeroPedidos : 0;

  // produtos mais vendidos
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const order of ordersInRange) {
    for (const item of order.items) {
      const entry = productSales.get(item.productId) ?? { name: item.productName, quantity: 0, revenue: 0 };
      entry.quantity += item.quantity;
      entry.revenue += Number(item.unitPrice) * item.quantity;
      productSales.set(item.productId, entry);
    }
  }
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // vendas por dia
  const byDay = new Map<string, number>();
  for (const order of ordersInRange) {
    const key = order.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + Number(order.total));
  }
  const salesByDay = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, total]) => ({ date, total }));

  // vendas por categoria
  const productIds = Array.from(productSales.keys());
  const productsWithCategory = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, category: { select: { name: true } } },
  });
  const categoryById = new Map(productsWithCategory.map((p) => [p.id, p.category?.name ?? "Sem categoria"]));
  const byCategory = new Map<string, number>();
  for (const order of ordersInRange) {
    for (const item of order.items) {
      const cat = categoryById.get(item.productId) ?? "Sem categoria";
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(item.unitPrice) * item.quantity);
    }
  }
  const salesByCategory = Array.from(byCategory.entries()).map(([category, total]) => ({ category, total }));

  return NextResponse.json({
    period: { from: from.toISOString(), to: to.toISOString() },
    kpis: {
      faturamentoTotal: Number(allTimePaid._sum.total ?? 0),
      faturamentoMes: receitaBruta,
      lucro: lucroLiquido,
      gastos: despesas,
      ticketMedio,
      numeroPedidos,
      pedidosPendentes: pendingOrders,
      clientesNovos: newCustomers,
    },
    financeiro: {
      receitaBruta,
      descontos,
      reembolsos,
      taxasPagamento,
      receitaLiquida,
      custoProdutos,
      lucroBruto,
      despesas,
      lucroLiquido,
      margemLucro,
    },
    topProducts,
    salesByDay,
    salesByCategory,
    lowStock: lowStock.map((v) => ({
      id: v.id,
      productName: v.product.name,
      size: v.size,
      color: v.color,
      stock: v.stock,
      active: v.product.active,
    })),
  });
}
