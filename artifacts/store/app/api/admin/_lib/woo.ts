export function getWooUrl(): string {
  return (process.env.WOOCOMMERCE_URL || "").replace(/\/$/, "");
}

export function wooAuth(): string {
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
  return `Basic ${Buffer.from(`${ck}:${cs}`).toString("base64")}`;
}

export function wooHeaders(): HeadersInit {
  return { Authorization: wooAuth(), "Content-Type": "application/json" };
}

export async function wooFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${getWooUrl()}/wp-json/wc/v3/${path}`, {
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
