import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { wooFetch, buildWooQuery } from "../_lib/woo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const params: Record<string, unknown> = {
    page: searchParams.get("page") || "1",
    per_page: searchParams.get("per_page") || "20",
  };
  if (searchParams.get("search")) params.search = searchParams.get("search");
  const res = await wooFetch(`coupons?${buildWooQuery(params)}`);
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(req: NextRequest) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const res = await wooFetch("coupons", { method: "POST", body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data?.message || "Error" }, { status: 500 });
  return NextResponse.json(data);
}
