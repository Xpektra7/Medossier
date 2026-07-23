# Execution Plans — Medication Safety Companion

Full product spec: [`spec.md`](../spec.md)
Division of labour: [`TRACKS.md`](TRACKS.md)

## Status

| Plan | Status |
|------|--------|
| [001 — Scaffold + SDK + sandbox](001-scaffold-and-auth.md) | ▢ Not started |
| [002 — Synonym map + hooks](002-api-wrappers.md) | ▢ Not started |
| [003 — Drug search UI](003-drug-search-and-synonyms.md) | ▢ Not started |
| [004 — Medication list + interactions](004-interaction-checking.md) | ▢ Not started |
| [005 — Persistence + logging + polish](005-event-logging-and-polish.md) | ▢ Not started |

## Execution

Backend track: 001 → 002 → 005 (sequential). Frontend track: 003 → 004 (sequential). See [`TRACKS.md`](TRACKS.md) for parallel execution plan.

## Architecture

```
App.tsx
  → AppProvider (useApp context)
    → NavigationContainer
      → BottomTabNavigator
          ├── Home (search + list + interactions)
          ├── Medications (placeholder)
          └── Timeline (twin event log)
```

**Twin connection (sandbox):**
1. `DTP({ apiKey, holonApiKey })` — SDK instance on startup
2. `dtp.twins.connect(EXPO_PUBLIC_SANDBOX_GRANT_TOKEN)` — connects using grant token from dashboard Sandbox page
3. `holon = dtp.holon` — configured HOLON client
4. Twin + HOLON available app-wide via `useApp()` context

Grant token is a static credential from the OntoMorph developer dashboard Sandbox page. If it expires, get a fresh one.

**SDK packages:**
- `@ontomorph/dtp-sdk` — `DTP`, `twins.connect()`, `sandbox.grants()`, `twin.flag()`, `twin.events.list()`
- `@ontomorph/holon-client` — accessed via `dtp.holon`: `concepts.search()`, `concepts.getByCode()`, `interactions.checkList()`
- `@ontomorph/holon-types` — TypeScript types for all response shapes

## Credentials

Stored in `.env` (gitignored):

- `EXPO_PUBLIC_DTP_API_KEY` — `dtp_live_…` or `dtp_test_…` (from `/dashboard/keys`)
- `EXPO_PUBLIC_SANDBOX_GRANT_TOKEN` — grant token from dashboard Sandbox page
- `EXPO_PUBLIC_HOLON_API_KEY` — `holon_…` key
- `EXPO_PUBLIC_HOLON_API_URL` — defaults to `https://holon.ontomorph.com`
