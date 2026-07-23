# Plan 003: Drug search UI components

**Priority:** P0 · **Effort:** M · **Risk:** MED · **Depends on:** 002

## Steps

1. Create `src/components/Toast.tsx` — global toast system via module-level `addFn` callback. `showToast(text, kind)` for imperative calls. Renders absolutely-positioned at bottom, auto-dismiss 3s. Kinds: success/error/info.
2. Create `src/components/Header.tsx` — row with app title "Medossier" on left, connection badge on right (green "Twin" when connected, orange "Offline" on error, gray "Connecting…" while loading). Reads connection state from `useApp()` context.
3. Create `src/components/SearchBar.tsx` — styled `TextInput` with placeholder "Search a drug (paracetamol, coartem…)", shows loading indicator while searching.
4. Create `src/components/DrugCard.tsx` — single search result card: drug name, concept code + vocabulary subtitle, **plain-language explanation** (looked up from `drug-info.ts` by RxNorm code), and "Add" button (shows "Added"/disabled when disabled prop true). Uses SDK's `SearchHit` type from `@ontomorph/holon-types`.
5. Create `src/components/DrugSearchPanel.tsx` — composes SearchBar + DrugCard list. Uses `useDrugSearch` hook. On add, calls `onAdd` prop with new `Medication` object. Shows error state if no results. Special-cases "agbo" search.
6. Update `HomeScreen.tsx` — reads twin/connection from `useApp()` context, shows Header + DrugSearchPanel. Wire `onAdd` to state. HomeScreen is the search hub.
7. Update `App.tsx` — add `<Toast />` above closing `</NavigationContainer>`.
8. `bun run tsc --noEmit` — must exit 0.
9. `git add -A && git commit -m "feat: drug search UI with Toast, Header, SearchBar, DrugCard, DrugSearchPanel"`.

## Verification

- Search bar shows, typing triggers debounced search
- Nigerian names (paracetamol, coartem) resolve via synonym → HOLON lookup
- Drug card shows plain-language explanation from drug-info.ts
- Add button works with disabled state
- Connection badge shows twin status from SDK
- `bun run tsc --noEmit` exits 0
