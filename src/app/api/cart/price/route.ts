import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";

export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);
  const { status, body } = await backendFetch("/api/cart/price", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
  return NextResponse.json(body, { status });
}
