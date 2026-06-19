export const WOO_URL = (process.env.WOOCOMMERCE_URL || "").replace(/\/$/, "");
const CK = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
const CS = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

export function wooAuth(): string {
  return `Basic ${Buffer.from(`${CK}:${CS}`).toString("base64")}`;
}

export function wooHeaders(): HeadersInit {
  return { Authorization: wooAuth(), "Content-Type": "application/json" };
}

export async function wooFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${WOO_URL}/wp-json/wc/v3/${path}`, {
    ...options,
    headers: { ...wooHeaders(), ...options?.headers },
    cache: "no-store",
  });
  return res;
}

export function buildWooQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  return q.toString();
}
