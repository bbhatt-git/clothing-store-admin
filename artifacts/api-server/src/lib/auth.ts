import jwt from "jsonwebtoken";
import { logger } from "./logger";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

const JWT_SECRET = requireEnv("SESSION_SECRET");
const ADMIN_USERNAME = requireEnv("ADMIN_USERNAME");
const ADMIN_PASSWORD = requireEnv("ADMIN_PASSWORD");

export interface AdminPayload {
  username: string;
  email: string | null;
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (err) {
    logger.debug({ err }, "Token verification failed");
    return null;
  }
}

export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
