---
name: Auth token wiring
description: How to wire the JWT stored in localStorage into the generated API client for StyleZone
---

`setAuthTokenGetter` is exported from `@workspace/api-client-react` (the package root, not a deep sub-path like `/src/custom-fetch`). Call it once at module level in `auth.tsx` — before any React hooks — so it is registered immediately when the module loads:

```ts
import { setAuthTokenGetter } from "@workspace/api-client-react"
const TOKEN_KEY = "admin_token"
setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY))
```

**Why:** `customFetch` checks `_authTokenGetter` on every request. If it's never set, all requests go out without `Authorization` headers and every protected endpoint returns 401 — even after a successful login.

**How to apply:** Any time auth stops working (all API calls returning 401 after login), check that this line exists near the top of `auth.tsx` and that the import path is the package root (`@workspace/api-client-react`), not a deep internal path.
