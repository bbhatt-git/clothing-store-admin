import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

// ── Token management ────────────────────────────────────────────────────────

type AuthTokenGetter = () => string | null;
let _tokenGetter: AuthTokenGetter | null = null;

export function setAuthTokenGetter(getter: AuthTokenGetter | null) {
  _tokenGetter = getter;
}

// ── Base fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = _tokenGetter?.();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.headers) {
    new Headers(options.headers as HeadersInit).forEach((v, k) =>
      headers.set(k, v),
    );
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* empty */
    }
    const msg =
      (data as Record<string, string>)?.error ||
      (data as Record<string, string>)?.message ||
      `HTTP ${res.status}`;
    const err = Object.assign(new Error(msg), { status: res.status, data });
    throw err;
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  display_name?: string;
  roles?: string[];
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  type: string;
  price: string;
  regular_price: string;
  sale_price: string;
  sku: string;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  description: string;
  short_description: string;
  images: Array<{ id: number; src: string; alt?: string }>;
  categories: Array<{ id: number; name: string; slug?: string }>;
  tags: Array<{ id: number; name: string; slug?: string }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
    variation?: boolean;
    visible?: boolean;
  }>;
  date_created?: string;
  date_modified?: string;
  featured?: boolean;
  tax_status?: string;
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
}

export interface ProductVariation {
  id: number;
  status: string;
  price: string;
  regular_price: string;
  sale_price: string;
  sku: string;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  image?: { id: number; src: string; alt?: string };
  attributes: Array<{ id: number; name: string; option: string }>;
  description?: string;
}

export interface WooOrder {
  id: number;
  number: string;
  status: string;
  currency_symbol: string;
  total: string;
  date_created?: string;
  date_modified?: string;
  customer_note?: string;
  billing?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  shipping?: {
    first_name: string;
    last_name: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  line_items?: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    total: string;
    product_id?: number;
    image?: { src: string };
  }>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number;
  count?: number;
  image?: { id?: number; src: string; alt?: string } | null;
}

export interface WooReview {
  id: number;
  status: string;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating?: number;
  product_id?: number;
  product_name?: string;
  date_created?: string;
}

export interface WooTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  amount: string;
  date_expires?: string | null;
  usage_count?: number;
  usage_limit?: number | null;
  individual_use?: boolean;
  free_shipping?: boolean;
  minimum_amount?: string;
  maximum_amount?: string;
  description?: string;
}

export interface DashboardStats {
  totalSales: string;
  ordersToday: number;
  activeProducts: number;
  lowStockCount: number;
  totalOrders: number;
  totalCustomers: number;
}

export interface SalesChartPoint {
  date: string;
  sales: number;
  orders: number;
}

// ── Query key factories ───────────────────────────────────────────────────────

export const getGetMeQueryKey = () => ["/api/auth/me"] as const;
export const getListProductsQueryKey = (params?: object) =>
  ["/api/products", params] as const;
export const getGetProductQueryKey = (id: number) =>
  ["/api/products", id] as const;
export const getListProductVariationsQueryKey = (productId: number) =>
  ["/api/products", productId, "variations"] as const;
export const getListOrdersQueryKey = (params?: object) =>
  ["/api/orders", params] as const;
export const getGetOrderQueryKey = (id: number) => ["/api/orders", id] as const;
export const getListCategoriesQueryKey = (params?: object) =>
  ["/api/categories", params] as const;
export const getListTagsQueryKey = (params?: object) =>
  ["/api/tags", params] as const;
export const getListCouponsQueryKey = (params?: object) =>
  ["/api/coupons", params] as const;
export const getListReviewsQueryKey = (params?: object) =>
  ["/api/reviews", params] as const;

// ── Pagination helper ────────────────────────────────────────────────────────

function buildQuery(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  return q.toString();
}

// ── Auth hooks ────────────────────────────────────────────────────────────────

export function useGetMe(options?: {
  query?: Partial<UseQueryOptions<AdminUser>>;
}) {
  return useQuery<AdminUser>({
    queryKey: getGetMeQueryKey(),
    queryFn: () => apiFetch("/api/auth/me"),
    ...options?.query,
  });
}

export function useLogin(
  options?: UseMutationOptions<
    { token: string; user: AdminUser },
    Error,
    { data: { username: string; password: string } }
  >,
) {
  return useMutation<
    { token: string; user: AdminUser },
    Error,
    { data: { username: string; password: string } }
  >({
    mutationFn: ({ data }) =>
      apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useLogout(options?: UseMutationOptions<void, Error, void>) {
  return useMutation<void, Error, void>({
    mutationFn: () =>
      apiFetch("/api/auth/logout", { method: "POST" }),
    ...options,
  });
}

// ── Dashboard hooks ───────────────────────────────────────────────────────────

export function useGetDashboardStats(options?: {
  query?: Partial<UseQueryOptions<DashboardStats>>;
}) {
  return useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => apiFetch("/api/dashboard/stats"),
    ...options?.query,
  });
}

export function useGetSalesChart(
  params?: { period?: string },
  options?: { query?: Partial<UseQueryOptions<SalesChartPoint[]>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery<SalesChartPoint[]>({
    queryKey: ["/api/dashboard/sales-chart", params],
    queryFn: () => apiFetch(`/api/dashboard/sales-chart${qs ? `?${qs}` : ""}`),
    ...options?.query,
  });
}

export function useGetRecentOrders(options?: {
  query?: Partial<UseQueryOptions<WooOrder[]>>;
}) {
  return useQuery<WooOrder[]>({
    queryKey: ["/api/dashboard/recent-orders"],
    queryFn: () => apiFetch("/api/dashboard/recent-orders"),
    ...options?.query,
  });
}

export function useGetLowStockProducts(options?: {
  query?: Partial<UseQueryOptions<WooProduct[]>>;
}) {
  return useQuery<WooProduct[]>({
    queryKey: ["/api/dashboard/low-stock"],
    queryFn: () => apiFetch("/api/dashboard/low-stock"),
    ...options?.query,
  });
}

// ── Product hooks ─────────────────────────────────────────────────────────────

interface ListProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  category?: number;
  tag?: number;
}

export function useListProducts(
  params?: ListProductsParams,
  options?: { query?: Partial<UseQueryOptions<{ products: WooProduct[]; total: number; totalPages: number }>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery({
    queryKey: getListProductsQueryKey(params),
    queryFn: () =>
      apiFetch<{ products: WooProduct[]; total: number; totalPages: number }>(
        `/api/products${qs ? `?${qs}` : ""}`,
      ),
    ...options?.query,
  });
}

export function useGetProduct(
  id: number,
  options?: { query?: Partial<UseQueryOptions<WooProduct>> },
) {
  return useQuery<WooProduct>({
    queryKey: getGetProductQueryKey(id),
    queryFn: () => apiFetch(`/api/products/${id}`),
    enabled: !!id,
    ...options?.query,
  });
}

export function useCreateProduct(
  options?: UseMutationOptions<WooProduct, Error, { data: Partial<WooProduct> }>,
) {
  return useMutation<WooProduct, Error, { data: Partial<WooProduct> }>({
    mutationFn: ({ data }) =>
      apiFetch("/api/products", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useUpdateProduct(
  options?: UseMutationOptions<
    WooProduct,
    Error,
    { id: number; data: Partial<WooProduct> }
  >,
) {
  return useMutation<WooProduct, Error, { id: number; data: Partial<WooProduct> }>({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useDeleteProduct(
  options?: UseMutationOptions<void, Error, { id: number }>,
) {
  return useMutation<void, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch(`/api/products/${id}`, { method: "DELETE" }),
    ...options,
  });
}

// ── Variation hooks ───────────────────────────────────────────────────────────

export function useListProductVariations(
  productId: number,
  params?: { per_page?: number },
  options?: { query?: Partial<UseQueryOptions<ProductVariation[]>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery<ProductVariation[]>({
    queryKey: getListProductVariationsQueryKey(productId),
    queryFn: () =>
      apiFetch(`/api/products/${productId}/variations${qs ? `?${qs}` : ""}`),
    enabled: !!productId,
    ...options?.query,
  });
}

export function useCreateProductVariation(
  options?: UseMutationOptions<
    ProductVariation,
    Error,
    { productId: number; data: Partial<ProductVariation> }
  >,
) {
  return useMutation<
    ProductVariation,
    Error,
    { productId: number; data: Partial<ProductVariation> }
  >({
    mutationFn: ({ productId, data }) =>
      apiFetch(`/api/products/${productId}/variations`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useUpdateProductVariation(
  options?: UseMutationOptions<
    ProductVariation,
    Error,
    { productId: number; variationId: number; data: Partial<ProductVariation> }
  >,
) {
  return useMutation<
    ProductVariation,
    Error,
    { productId: number; variationId: number; data: Partial<ProductVariation> }
  >({
    mutationFn: ({ productId, variationId, data }) =>
      apiFetch(`/api/products/${productId}/variations/${variationId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useDeleteProductVariation(
  options?: UseMutationOptions<
    void,
    Error,
    { productId: number; variationId: number }
  >,
) {
  return useMutation<void, Error, { productId: number; variationId: number }>({
    mutationFn: ({ productId, variationId }) =>
      apiFetch(`/api/products/${productId}/variations/${variationId}`, {
        method: "DELETE",
      }),
    ...options,
  });
}

// ── Order hooks ────────────────────────────────────────────────────────────────

interface ListOrdersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
}

export function useListOrders(
  params?: ListOrdersParams,
  options?: { query?: Partial<UseQueryOptions<{ orders: WooOrder[]; total: number; totalPages: number }>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery({
    queryKey: getListOrdersQueryKey(params),
    queryFn: () =>
      apiFetch<{ orders: WooOrder[]; total: number; totalPages: number }>(
        `/api/orders${qs ? `?${qs}` : ""}`,
      ),
    ...options?.query,
  });
}

export function useGetOrder(
  id: number,
  options?: { query?: Partial<UseQueryOptions<WooOrder>> },
) {
  return useQuery<WooOrder>({
    queryKey: getGetOrderQueryKey(id),
    queryFn: () => apiFetch(`/api/orders/${id}`),
    enabled: !!id,
    ...options?.query,
  });
}

export function useUpdateOrder(
  options?: UseMutationOptions<
    WooOrder,
    Error,
    { id: number; data: Partial<WooOrder> }
  >,
) {
  return useMutation<WooOrder, Error, { id: number; data: Partial<WooOrder> }>({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

// ── Category hooks ────────────────────────────────────────────────────────────

interface ListCategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  hide_empty?: boolean;
}

export function useListCategories(
  params?: ListCategoriesParams,
  options?: { query?: Partial<UseQueryOptions<{ categories: Category[]; total: number; totalPages: number }>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery({
    queryKey: getListCategoriesQueryKey(params),
    queryFn: () =>
      apiFetch<{ categories: Category[]; total: number; totalPages: number }>(
        `/api/categories${qs ? `?${qs}` : ""}`,
      ),
    ...options?.query,
  });
}

export function useCreateCategory(
  options?: UseMutationOptions<Category, Error, { data: Partial<Category> }>,
) {
  return useMutation<Category, Error, { data: Partial<Category> }>({
    mutationFn: ({ data }) =>
      apiFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useUpdateCategory(
  options?: UseMutationOptions<
    Category,
    Error,
    { id: number; data: Partial<Category> }
  >,
) {
  return useMutation<Category, Error, { id: number; data: Partial<Category> }>({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useDeleteCategory(
  options?: UseMutationOptions<void, Error, { id: number }>,
) {
  return useMutation<void, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch(`/api/categories/${id}`, { method: "DELETE" }),
    ...options,
  });
}

// ── Tag hooks ─────────────────────────────────────────────────────────────────

interface ListTagsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export function useListTags(
  params?: ListTagsParams,
  options?: { query?: Partial<UseQueryOptions<{ tags: WooTag[]; total: number; totalPages: number }>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery({
    queryKey: getListTagsQueryKey(params),
    queryFn: () =>
      apiFetch<{ tags: WooTag[]; total: number; totalPages: number }>(
        `/api/tags${qs ? `?${qs}` : ""}`,
      ),
    ...options?.query,
  });
}

export function useCreateTag(
  options?: UseMutationOptions<WooTag, Error, { data: Partial<WooTag> }>,
) {
  return useMutation<WooTag, Error, { data: Partial<WooTag> }>({
    mutationFn: ({ data }) =>
      apiFetch("/api/tags", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useUpdateTag(
  options?: UseMutationOptions<
    WooTag,
    Error,
    { id: number; data: Partial<WooTag> }
  >,
) {
  return useMutation<WooTag, Error, { id: number; data: Partial<WooTag> }>({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/tags/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useDeleteTag(
  options?: UseMutationOptions<void, Error, { id: number }>,
) {
  return useMutation<void, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch(`/api/tags/${id}`, { method: "DELETE" }),
    ...options,
  });
}

// ── Coupon hooks ──────────────────────────────────────────────────────────────

interface ListCouponsParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export function useListCoupons(
  params?: ListCouponsParams,
  options?: { query?: Partial<UseQueryOptions<Coupon[]>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery<Coupon[]>({
    queryKey: getListCouponsQueryKey(params),
    queryFn: () => apiFetch(`/api/coupons${qs ? `?${qs}` : ""}`),
    ...options?.query,
  });
}

export function useCreateCoupon(
  options?: UseMutationOptions<Coupon, Error, { data: Partial<Coupon> }>,
) {
  return useMutation<Coupon, Error, { data: Partial<Coupon> }>({
    mutationFn: ({ data }) =>
      apiFetch("/api/coupons", { method: "POST", body: JSON.stringify(data) }),
    ...options,
  });
}

export function useUpdateCoupon(
  options?: UseMutationOptions<
    Coupon,
    Error,
    { id: number; data: Partial<Coupon> }
  >,
) {
  return useMutation<Coupon, Error, { id: number; data: Partial<Coupon> }>({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useDeleteCoupon(
  options?: UseMutationOptions<void, Error, { id: number }>,
) {
  return useMutation<void, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch(`/api/coupons/${id}`, { method: "DELETE" }),
    ...options,
  });
}

// ── Review hooks ──────────────────────────────────────────────────────────────

interface ListReviewsParams {
  page?: number;
  per_page?: number;
  status?: string;
}

export function useListReviews(
  params?: ListReviewsParams,
  options?: { query?: Partial<UseQueryOptions<WooReview[]>> },
) {
  const qs = params ? buildQuery(params as Record<string, unknown>) : "";
  return useQuery<WooReview[]>({
    queryKey: getListReviewsQueryKey(params),
    queryFn: () => apiFetch(`/api/reviews${qs ? `?${qs}` : ""}`),
    ...options?.query,
  });
}

export function useUpdateReview(
  options?: UseMutationOptions<
    WooReview,
    Error,
    { id: number; data: Partial<WooReview> }
  >,
) {
  return useMutation<WooReview, Error, { id: number; data: Partial<WooReview> }>({
    mutationFn: ({ id, data }) =>
      apiFetch(`/api/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useDeleteReview(
  options?: UseMutationOptions<void, Error, { id: number }>,
) {
  return useMutation<void, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch(`/api/reviews/${id}`, { method: "DELETE" }),
    ...options,
  });
}

export type { UseQueryOptions };
export { useQueryClient };
