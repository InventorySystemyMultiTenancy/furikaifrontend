import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";
import { toDecimal } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const from = sp.get("from") ? new Date(sp.get("from")!) : undefined;
  const to = sp.get("to") ? new Date(sp.get("to")!) : undefined;

  const expenses = await prisma.expense.findMany({
    where: from && to ? { date: { gte: from, lte: to } } : {},
    orderBy: { date: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json({
    expenses: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
  });
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      description: parsed.data.description,
      amount: toDecimal(parsed.data.amount),
      category: parsed.data.category,
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      paymentMethod: parsed.data.paymentMethod,
      supplier: parsed.data.supplier,
      recurring: parsed.data.type === "recorrente",
      receiptUrl: parsed.data.receiptUrl,
      notes: parsed.data.notes,
      createdById: session!.user.id,
    },
  });

  await prisma.financialMovement.create({
    data: {
      type: "EXPENSE",
      amount: -parsed.data.amount,
      date: expense.date,
      description: expense.description,
      expenseId: expense.id,
      createdById: session!.user.id,
    },
  });

  return NextResponse.json({ expense });
}
