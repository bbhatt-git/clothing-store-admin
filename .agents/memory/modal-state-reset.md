---
name: Modal state reset pattern
description: Safe way to reset modal form state when the editing target changes
---

Never call `setState` during render to reset form state when props change — this causes "Too many re-renders" (infinite loop):

```ts
// BAD — calling setState during render body
if (editing?.id !== lastId) {
  setLastId(editing?.id)
  setName(editing?.name ?? "")
}
```

Use `useEffect` with the ID as a dependency instead:

```ts
useEffect(() => {
  setName(editing?.name ?? "")
  setSlug(editing?.slug ?? "")
}, [editing?.id])
```

**Why:** React batches state updates but calling setState unconditionally during render triggers an immediate re-render loop.

**How to apply:** Any modal or form that accepts an `editing` prop and needs to reset its local state when the target changes.
