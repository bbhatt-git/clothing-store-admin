import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";
import { wooFetch } from "../../_lib/woo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const res = await wooFetch("orders?per_page=10&orderby=date&order=desc");
    const data = res.ok ? await res.json() : [];
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch { return NextResponse.json([]); }
}
