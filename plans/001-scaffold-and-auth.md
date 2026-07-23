# Plan 001: Scaffold Expo + SDK init + sandbox twin connection

**Priority:** P0 · **Effort:** M · **Risk:** MED · **Depends on:** none

## Steps

1. Create `package.json` with Expo ~52.0, React Navigation (bottom tabs), AsyncStorage, `@ontomorph/dtp-sdk`, `@ontomorph/holon-client`, `@ontomorph/holon-types`. Install via `bun install`. Android only — no iOS config needed.
2. Create `tsconfig.json` (strict, bundler module resolution, `@/` alias to `src/`).
3. Create `app.json` (Expo config, Android package `com.ontomorph.medsafety`, portrait, light UI). No iOS fields.
4. Create `.gitignore`, placeholder `assets/icon.png`, `src/` subdirs.
5. Create `.env` with:
   - `EXPO_PUBLIC_DTP_API_KEY` — `dtp_live_…` or `dtp_test_…` from `/dashboard/keys`
   - `EXPO_PUBLIC_SANDBOX_GRANT_TOKEN` — grant token copied from the Sandbox page on developer dashboard
   - `EXPO_PUBLIC_HOLON_API_KEY` — `holon_…` key for clinical knowledge API
   - `EXPO_PUBLIC_HOLON_API_URL` — defaults to `https://holon-api.ontomorph.com`
   - `EXPO_PUBLIC_GROQ_API_KEY` — Groq API key for LLM pattern analysis
6. Create `src/theme/colors.ts` with semantic color tokens.
7. **No hand-rolled REST wrappers.** Create `src/api/dtp.ts` that:
   - Exports `getDTP()` — singleton factory that creates a `DTP` instance from `@ontomorph/dtp-sdk` with `apiKey`, `holonApiUrl`, `holonApiKey` from env vars
   - Exports `connectSandboxTwin()` — reads `EXPO_PUBLIC_SANDBOX_GRANT_TOKEN` from env, calls `dtp.twins.connect(grantToken)` and returns `{ twin, holon }`
   - `Twin` exposes `twin.systems.get()`, `twin.events.list()`, `twin.flag()`, `twin.events.stream()`
   - `holon` exposes `concepts.search()`, `concepts.getByCode()`, `interactions.check()`, `interactions.checkList()`
7b. Create `src/api/groq.ts` — Groq free-tier LLM wrapper for pattern intelligence:
   - Exports `async function analyzeHealthPattern(symptoms: Symptom[], medications: Medication[], systemPrompt: string): Promise<string>`
   - Builds a structured prompt from symptom history + active medications
   - POSTs to `https://api.groq.com/openai/v1/chat/completions` with `Authorization: Bearer $GROQ_KEY`
   - Uses model `llama-3.3-70b-versatile`, `max_tokens: 300`, `temperature: 0.3`
   - Returns `choices[0].message.content` as plain string
   - Returns a safe fallback string on any error (never throws to UI)
   - Default system prompt: `You are a health assistant helping Nigerian patients understand patterns in their symptoms and medications. You do NOT diagnose. You surface 2-3 possible explanations and always end with "Please see a doctor to confirm." Be brief, plain, and direct. No medical jargon.`
8. Create `src/types.ts` — `Medication` interface (id, conceptId, rxnormCode, name, addedAt, lastTaken?), `Symptom` interface (id, description, severity: 'mild'|'moderate'|'severe', loggedAt, relatedDrugs?: string[]), `ConnectionState` enum (`connecting`/`connected`/`error`), `AppState` (twin, holon, connectionState, error, symptoms), `RootTabParamList` (Home, Medications, Timeline).
9. Create `src/hooks/useApp.ts` — shared React context/hook that:
   - On mount, calls `connectSandboxTwin()` to get `{ twin, holon }` using the static grant token from `.env`
   - Stores both in state
   - Exposes `{ twin, holon, connectionState, error }` to all screens
   - **Session idle management:** tracks `lastActivity` timestamp from app-wide touch/scroll events. If `now - lastActivity > 24 hours`, sets state to `disconnected` and shows a reconnect prompt. The user gets a fresh grant token from the Sandbox page when this happens.
10. Create three screen shells: `HomeScreen.tsx` (welcome text + connection status), `MedicationsScreen.tsx` (placeholder), `TimelineScreen.tsx` (placeholder).
11. Create `src/navigation/AppNavigator.tsx` — `BottomTabNavigator` with three tabs (Home/Medications/Timeline with Ionicons). Connection happens auto on mount, no auth screen.
12. Create `App.tsx` — wraps `AppProvider` around `NavigationContainer` + `AppNavigator`.
13. Run `bun run tsc --noEmit` — must exit 0.
14. `git init && git add -A && git commit -m "feat: scaffold Expo + SDK init + sandbox twin connection"`.

## Key flow

```
App start → DTP({ apiKey, holonApiKey })
  → dtp.twins.connect(EXPO_PUBLIC_SANDBOX_GRANT_TOKEN) → { twin, holon }
  → twin + holon available globally via useApp() hook
```

The grant token is a static credential from the OntoMorph developer dashboard Sandbox page — paste it into `.env`. If it expires, get a fresh one from the dashboard.

## Notes

- Sandbox twins are synthetic demo data, isolated from real patient records
- Grant token comes from the developer dashboard Sandbox page, not from `dtp.sandbox.grants()`
- 24h idle timer disconnects the session; user grabs a fresh token from the dashboard to reconnect

## Verification

- `bun run tsc --noEmit` exits 0
- `DTP` instance constructs without error
- Sandbox grant token is minted, twin connects
- Tab navigator renders 3 screens
- Connection status visible in HomeScreen
