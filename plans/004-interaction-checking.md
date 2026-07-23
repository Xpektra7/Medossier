# Plan 004: Medication list + interaction checking

**Priority:** P0 · **Effort:** M · **Risk:** LOW · **Depends on:** 003

## Steps

1. Create `src/components/MedRow.tsx` — card showing medication name, added date, last taken date (if set). Two buttons: green "Take" (sets lastTaken to now), red "X" (removes).
2. Create `src/components/MedicationList.tsx` — section titled "Your Medications (N)". Renders list of MedRow items. Returns null if empty.
3. Create `src/components/SeverityBadge.tsx` — pill badge: contraindicated (red), major (deep orange), moderate (amber), minor (green), unknown (gray). Covers all 5 SDK severity levels (`contraindicated | major | moderate | minor | unknown`).
4. Create `src/components/InteractionCard.tsx` — card with drug pair name, severity badge, clinical effect, **body system tags** (from `body-systems.ts` — row of emoji/icon pills like "🫀 Cardiovascular" below the effect text), management text, source + evidence grade. Uses SDK's interaction entry type from `@ontomorph/holon-types`.
5. Create `src/components/InteractionPanel.tsx` — section showing interaction results. If <2 meds, shows prompt. Header row with title + count. Summary row with severity counts. Sort contraindicated first. Shows green "No known interactions" if empty.
6. Create `src/hooks/useInteractions.ts` — takes `Medication[]`. For each med, calls `holon.concepts.search(med.name)` to find HOLON concept IDs (the SDK's `SearchHit` carries `conceptId` and `vocabularyId`). Then calls `holon.interactions.checkList([...conceptIds])` using the `holon` client from `useApp()` context. The SDK's `checkList()` screens the entire list at once against 1.7M known interactions. The response shape is `{ totalDrugs, totalInteractions, pairs }` where each pair has its own `interactions: InteractionEntry[]` array — flatten with `pairs.flatMap(p => p.interactions)`. Caches results by sorted drug ID key. Returns interactions, loading, error.
7. Update `HomeScreen.tsx` — add `medications` state. Wire DrugSearchPanel `onAdd` to append. Add MedicationList + InteractionPanel below search. Wire remove/take handlers (take sets lastTaken to ISO now).
8. `bun run tsc --noEmit` — must exit 0.
9. `git add -A && git commit -m "feat: medication list + interaction checking with severity badges"`.

## Verification

- Search + add drugs, see them in list
- Take button logs timestamp, Remove deletes
- 2+ meds: `holon.interactions.checkList()` called, results displayed with severity + body system tags
- <2 meds: prompt shown
- `bun run tsc --noEmit` exits 0
