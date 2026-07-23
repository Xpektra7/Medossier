# Plan 006: Symptom ledger + AI pattern analysis

**Priority:** P1 · **Effort:** M · **Risk:** LOW · **Depends on:** 002, 005

## Steps

1. Add `SymptomLogModal.tsx` component:
   - Modal triggered by a "Log Symptom" FAB button on the Timeline screen
   - Inputs: symptom description (TextInput), severity (3 buttons: Mild / Moderate / Severe)
   - Submit calls `logSymptom()` from `useSymptomLog()`
   - Dismiss on submit

2. Update `TimelineScreen.tsx`:
   - Merge twin medication events (`twin.events.list({ system: 'medication' })`)
     and local symptom log (`symptoms` from `useSymptomLog()`) into one unified timeline
   - Sort all entries by timestamp descending
   - Render medication events with pill icon, symptom entries with warning icon
   - Add "Log Symptom" FAB (bottom-right, always visible)
   - Add "Analyze Pattern" button at top — visible only when symptoms.length >= 2
   - On "Analyze Pattern": calls `analyze()` from `usePatternAnalysis()`
   - Shows loading state while Groq responds
   - Renders `insight` in a card below the button with a "⚠️ Not a diagnosis" disclaimer

3. Wire `useSymptomLog()` and `usePatternAnalysis()` into `TimelineScreen.tsx`
   Pass `medications` from `HomeScreen` state via shared `AppContext` or prop

4. Add `medications` to `AppContext` so both screens share state:
   - Move `medications` state from `HomeScreen` into `useApp()` context
   - Expose `{ medications, addMedication, removeMedication, takeMedication }`
   - Update `HomeScreen` to use context instead of local state
   - Update `useLogging` to pull from context

5. `bun run tsc --noEmit` — must exit 0
6. `git add -A && git commit -m "feat: symptom ledger + AI pattern analysis via Groq"`

## Verification

- Log 2+ symptoms → "Analyze Pattern" button appears
- Tapping it calls Groq and returns a plain-language insight
- Insight card shows with "Not a diagnosis" disclaimer
- Symptom + medication events appear merged in timeline, sorted by date
- Symptoms persist across app restarts (AsyncStorage)
- `bun run tsc --noEmit` exits 0
