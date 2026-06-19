# StyleZone Admin Dashboard

A full-featured WooCommerce admin dashboard for a clothing store. Admins log in with a username/password and get full CRUD access to products, orders, categories, reviews, and coupons — all synced live with the WooCommerce REST API.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, serves `/api`)
- `pnpm --filter @workspace/woo-admin run dev` — run the frontend (port 20652, serves `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (wouter, TanStack Query, Recharts, shadcn/ui, next-themes)
- API: Express 5 + WooCommerce REST API SDK (`@woocommerce/woocommerce-rest-api`)
- Auth: JWT (jsonwebtoken) — username/password validated server-side against env secrets
- Styling: Tailwind CSS, dark/light mode via next-themes
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — Generated React Query hooks
- `lib/api-zod/src/generated/` — Generated Zod schemas (used by server)
- `artifacts/api-server/src/lib/woo.ts` — WooCommerce SDK singleton
- `artifacts/api-server/src/lib/auth.ts` — JWT sign/verify helpers
- `artifacts/api-server/src/routes/` — All API route handlers
- `artifacts/woo-admin/src/` — React frontend (pages, components, auth context)

## Architecture decisions

- **API-key proxy pattern**: Consumer key/secret never exposed to browser. All WooCommerce calls go through Express routes that add auth server-side.
- **JWT auth**: Admin logs in with env-configured username/password. Server issues a 7-day JWT stored in localStorage. `useGetMe` guards all dashboard routes.
- **No database**: This dashboard is stateless — all data lives in WooCommerce/WordPress. No local DB is needed.
- **Codegen-first**: OpenAPI spec gates all frontend/backend types. Run codegen after every spec change.

## Product

- Login screen → full dashboard with sidebar navigation
- Dashboard: real-time sales stats, orders-today count, active products, low-stock alert count, Recharts area chart, recent orders table
- Products: paginated table, search/filter, create/edit with full variant system (attributes + auto-generated variations with individual price/SKU/stock)
- Orders: table with colored status badges, detail view with customer info, line items, status updates
- Categories: hierarchy view, CRUD modals
- Reviews: table with star ratings, approve/reject/delete actions
- Coupons: CRUD with discount type, usage limits, expiry dates

## User preferences

- Dark-first admin aesthetic: high-contrast charcoal/near-black with orange accent
- No emojis in UI

## Gotchas

- The WooCommerce sales chart API (`reports/sales` with `interval: day`) requires WooCommerce Analytics to be enabled on the WordPress site.
- Media upload (`POST /api/media/upload`) uses WordPress Application Passwords. Set `WP_APP_PASSWORD` env secret with a WP Application Password for the admin user, otherwise it falls back to ADMIN_PASSWORD which may not work.
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
