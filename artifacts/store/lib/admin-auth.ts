import { SignJWT, jwtVerify } from "jose";

function getSecret(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("Missing required environment variable: ADMIN_JWT_SECRET");
  return new TextEncoder().encode(s);
}

function getAdminUsername(): string {
  const u = process.env.ADMIN_USERNAME;
  if (!u) throw new Error("Missing required environment variable: ADMIN_USERNAME");
  return u;
}

function getAdminPassword(): string {
  const p = process.env.ADMIN_PASSWORD;
  if (!p) throw new Error("Missing required environment variable: ADMIN_PASSWORD");
  return p;
}

export interface AdminPayload {
  username: string;
  email: string | null;
}

export function validateCredentials(username: string, password: string) {
  return username === getAdminUsername() && password === getAdminPassword();
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { username: payload.username as string, email: payload.email as string | null };
  } catch {
    return null;
  }
}

export function extractToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7) || null;
}

export async function verifyRequest(req: Request): Promise<AdminPayload | null> {
  const token = extractToken(req.headers.get("Authorization") ?? undefined);
  if (!token) return null;
  return verifyToken(token);
}
