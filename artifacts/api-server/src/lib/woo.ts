import WooCommerceRestApiModule from "@woocommerce/woocommerce-rest-api";

const WOO_URL = process.env.WOOCOMMERCE_URL ?? "https://placeholder.local";
const WOO_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY ?? "placeholder";
const WOO_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "placeholder";

export const isWooConfigured =
  !!process.env.WOOCOMMERCE_URL &&
  !!process.env.WOOCOMMERCE_CONSUMER_KEY &&
  !!process.env.WOOCOMMERCE_CONSUMER_SECRET;

// The package ships as CJS with a default export nested inside the module
const WooCommerceRestApi =
  (WooCommerceRestApiModule as unknown as { default: typeof WooCommerceRestApiModule }).default ??
  WooCommerceRestApiModule;

const WooCommerce = new WooCommerceRestApi({
  url: WOO_URL,
  consumerKey: WOO_KEY,
  consumerSecret: WOO_SECRET,
  version: "wc/v3",
  queryStringAuth: true,
});

export default WooCommerce;
