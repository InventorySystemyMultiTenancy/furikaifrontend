import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";

export async function GET(req: NextRequest) {
  const { status, body } = await backendFetch(`/api/track?${req.nextUrl.searchParams.toString()}`);
  return NextResponse.json(body, { status });
}
