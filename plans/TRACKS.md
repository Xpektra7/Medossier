# Tracks — Division of Labour

Two parallel tracks for two people, **target: Friday 24 July, 11pm WAT**.

## Dependency map

```
001 (scaffold) ─┬─ 002 (data files + hooks) ── 005 (persistence/logging)
                │
                └─ 003 (UI components) ── 004 (interactions UI)
```

Plans 001 → 002 → 005 is a chain. Plans 003 → 004 is a chain. They converge because 003/004 import from 002.

## The split

| Track | Person | Plans | Delivers |
|-------|--------|-------|----------|
| **Backend** | Backend dev | 001 → 002 → 005 | Project scaffold, SDK connection, data files, hooks, persistence, logging, README |
| **Frontend** | Frontend dev | 003 → 004 | All UI components, interaction checking hook |

## How they run in parallel

### Step 0: Agree on interfaces (15 min, both together)

Backend dev writes `src/types.ts` and the hook signatures. Frontend dev builds against these contracts.

**Shared types** (`src/types.ts`):

```typescript
// Written by Backend dev in Plan 001 step 8

interface Medication {
  id: string; conceptId: number; rxnormCode: string
  name: string; addedAt: string; lastTaken?: string
}

type ConnectionState = 'connecting' | 'connected' | 'error'

// Exposed by useApp() context
interface AppContext {
  twin: Twin | null
  holon: HolonClient | null
  connectionState: ConnectionState
  error: string | null
}

// Exposed by useDrugSearch()
interface DrugSearchResult {
  query: string
  results: SearchHit[]   // from @ontomorph/holon-types
  loading: boolean
  error: string | null
  resolvedFromSynonym: boolean
}

// Exposed by useInteractions()
interface InteractionResult {
  interactions: InteractionEntry[]  // from @ontomorph/holon-types
  loading: boolean
  error: string | null
}
```

### Track Backend (Backend dev)

| Step | Plan | What to build |
|------|------|---------------|
| 1 | 001 | `package.json`, `tsconfig.json`, `app.json`, `.env`, `src/theme/colors.ts`, `src/api/dtp.ts`, `src/types.ts`, `src/hooks/useApp.ts`, screen shells, `AppNavigator.tsx`, `App.tsx`, git init |
| 2 | 002 | `src/data/nigeria-synonyms.ts` + test, `src/data/drug-info.ts`, `src/data/body-systems.ts`, `src/hooks/useDrugSearch.ts` |
| 3 | 005 | `src/data/storage.ts`, `src/hooks/useLogging.ts`, TimelineScreen finalization, `README.md` |
| **Sync** | — | Tag `backend-done` commit. Hand over: working `useApp()` context, `useDrugSearch()` hook, all data files |

### Track Frontend (Frontend dev)

Works using stubs until Backend delivers the real hooks, then swaps them in.

| Step | Plan | What to build |
|------|------|---------------|
| 1 | 003 (stub) | `Toast.tsx`, `Header.tsx`, `SearchBar.tsx`, `DrugCard.tsx`, `DrugSearchPanel.tsx` — uses a local stub `useDrugSearch` that returns mock data matching the agreed interface |
| 2 | 004 (stub) | `MedRow.tsx`, `MedicationList.tsx`, `SeverityBadge.tsx`, `InteractionCard.tsx`, `InteractionPanel.tsx`, `useInteractions.ts` — uses stub `useApp()` returning a mock `{ holon }` |
| **Sync** | — | Receive real `useApp()` + `useDrugSearch()` from Backend dev |
| 3 | Swap stubs | Delete stub hooks, import real ones from `src/hooks/`. Verify everything still compiles. |

### Integration

| Who | What |
|-----|------|
| Both | `bun run tsc --noEmit` — must exit 0 |
| Both | Wire HomeScreen: import real components from 003/004, real hooks from 002, wrap in `AppProvider` from 001 |
| Backend dev | `git add -A && git commit -m "feat: all plans complete"` |

## Risk mitigation

| Risk | Mitigation |
|------|------------|
| Frontend blocked waiting for hooks | Build with stubs that return mock `SearchHit[]` and `InteractionEntry[]`. The import path stays the same; only the implementation swaps. |
| Backend slow on scaffold | Frontend can start building components in a separate Expo project with mock data, then copy `src/components/` over once scaffold is ready. |
| Types mismatch | The `src/types.ts` interface is agreed in Step 0 — both import from the same file. No drift. |
| Deadline pressure | P0 features (search + interaction check) ship first. P1 (persistence, timeline, logging) are nice-to-haves if time runs short. |

## Timeline

```
Day 1 (Fri):
  09:00 — Both: agree interfaces (Step 0)
  10:00 — Backend: 001 scaffold  |  Frontend: 003 components (stubs)
  14:00 — Backend: 002 data+hooks |  Frontend: 004 interactions (stubs)
  18:00 — Backend: 005 wrap up    |  Frontend: integrate real hooks
  20:00 — Both: wire HomeScreen, typecheck, commit
  22:00 — Buffer / polish
  23:00 — DEADLINE
```
