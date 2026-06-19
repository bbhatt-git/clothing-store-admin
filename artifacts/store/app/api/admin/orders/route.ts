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
    orderby: "date", order: "desc",
  };
  if (searchParams.get("search")) params.search = searchParams.get("search");
  if (searchParams.get("status")) params.status = searchParams.get("status");
  const res = await wooFetch(`orders?${buildWooQuery(params)}`);
  const data = await res.json();
  const total = parseInt(res.headers.get("X-WP-Total") || "0", 10);
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1", 10);
  if (!res.ok) return NextResponse.json({ error: "Error" }, { status: 500 });
  return NextResponse.json({ orders: data, total, totalPages });
}
