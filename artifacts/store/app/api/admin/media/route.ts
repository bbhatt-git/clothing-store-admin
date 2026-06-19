import { NextRequest, NextResponse } from "next/server";
import { verifyRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const WOO_URL = (process.env.WOOCOMMERCE_URL || "").replace(/\/$/, "");
  const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
  const auth = `Basic ${Buffer.from(`${CK}:${CS}`).toString("base64")}`;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const uploadForm = new FormData();
    uploadForm.append("file", file, file.name);

    const res = await fetch(`${WOO_URL}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: { Authorization: auth },
      body: uploadForm,
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data?.message || "Upload failed" }, { status: 500 });
    return NextResponse.json({ id: data.id, src: data.source_url, alt: data.alt_text || "" });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
