import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, signToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    if (!validateCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const payload = { username, email: null };
    const token = await signToken(payload);
    return NextResponse.json({ token, user: payload });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
