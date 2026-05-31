import WooCommerceRestApiModule from "@woocommerce/woocommerce-rest-api";

if (!process.env.WOOCOMMERCE_URL) {
  throw new Error("WOOCOMMERCE_URL environment variable is required");
}
if (!process.env.WOOCOMMERCE_CONSUMER_KEY) {
  throw new Error("WOOCOMMERCE_CONSUMER_KEY environment variable is required");
}
if (!process.env.WOOCOMMERCE_CONSUMER_SECRET) {
  throw new Error("WOOCOMMERCE_CONSUMER_SECRET environment variable is required");
}

// The package ships as CJS with a default export nested inside the module
const WooCommerceRestApi =
  (WooCommerceRestApiModule as unknown as { default: typeof WooCommerceRestApiModule }).default ??
  WooCommerceRestApiModule;

const WooCommerce = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  version: "wc/v3",
  queryStringAuth: true,
});

export default WooCommerce;
