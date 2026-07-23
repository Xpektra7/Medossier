# Plan 005: Persistence + event logging via twin.flag + polish + README

**Priority:** P1 · **Effort:** M · **Risk:** LOW · **Depends on:** 004

## Steps

1. Create `src/data/storage.ts` — `loadMedications()` and `saveMedications(meds)` using AsyncStorage under key `medication-safety:medications` (single device, sandbox twin).
2. Update `HomeScreen.tsx` — load medications from storage on mount. Save to storage whenever list changes (after initial load completes).
3. Create `src/hooks/useLogging.ts` — `useMedicationLogger(twin, medications, interactions)`. Detects:
   - Newly added medications → calls `twin.flag('medication', { code: 'medication.added', value: JSON.stringify({ name, conceptId }), title: 'Medication Added' })` — `twin.flag()` is the SDK method for writing findings back onto the twin
   - Newly discovered interactions → calls `twin.flag('medication', { code: 'interaction.found', value: JSON.stringify({ drugA, drugB, severity, bodySystems }), title: 'Interaction Found' })` — this logs the interaction with body system mappings to the twin for platform analytics
   - Silent on failure. `twin.flag()` is fire-and-forget in this context.
4. Wire `useMedicationLogger` into HomeScreen — pass the `Twin` instance from `useApp()`, plus `medications` and `interactions`.
5. Update `TimelineScreen.tsx` — reads events from the twin via `twin.events.list({ system: 'medication' })` (from `useApp()` context). Shows a timeline of medication events. Falls back to placeholder if not connected or no events yet.
6. `bun run tsc --noEmit` — must exit 0.
7. Create `README.md` — project name, architecture overview (SDK-based), setup instructions (bun install, cp .env with DTP API key + sandbox grant token + HOLON key), feature list (Nigerian name support, plain-language drug info, interaction checking with body system mapping, twin event logging), tech stack (Expo, React Navigation, `@ontomorph/dtp-sdk`, `@ontomorph/holon-client`, AsyncStorage).
8. `git add -A && git commit -m "feat: persistence, twin event logging, timeline, polish"`.

## Verification

- Add medications, close app, reopen — list persists
- New medications fire `twin.flag()` on the sandbox twin (verify by checking twin events)
- New interactions fire `twin.flag()` with body system data
- Timeline screen shows events from `twin.events.list()`
- `bun run tsc --noEmit` exits 0
- README is accurate
