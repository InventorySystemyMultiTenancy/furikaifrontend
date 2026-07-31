import { NextRequest, NextResponse } from "next/server";
import { calculateShipping, DEFAULT_ITEM_WEIGHT_KG } from "@/lib/shipping";

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip") ?? "";
  const itemCount = Number(req.nextUrl.searchParams.get("items") ?? "1");

  try {
    const quotes = calculateShipping(zip, itemCount * DEFAULT_ITEM_WEIGHT_KG);
    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }
}
