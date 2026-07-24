# Medossier — Frontend API Reference

---

## Hooks

---

### `useApp`

Global application state and actions. Requires `<AppProvider>` wrapper in `App.tsx`.

**Returns:**

| Name | Type | Description |
|---|---|---|
| `connectionState` | `"disconnected" \| "connecting" \| "connected" \| "error"` | Current DTP twin connection status |
| `twin` | `DTPTwin \| null` | Raw twin instance (null when disconnected) |
| `medications` | `Medication[]` | All persisted medications from AsyncStorage |
| `symptoms` | `Symptom[]` | All persisted symptoms from AsyncStorage |
| `isLoading` | `boolean` | True during AsyncStorage load or twin connect |
| `error` | `string \| null` | Non-null when an operation failed |
| `addMedication` | `(m: Medication) => Promise<void>` | Persist medication, emit flag |
| `removeMedication` | `(id: string) => Promise<void>` | Delete medication by ID, emit flag |
| `updateMedication` | `(m: Medication) => Promise<void>` | Overwrite persisted medication by ID |
| `addSymptom` | `(s: Symptom) => Promise<void>` | Persist symptom, emit flag |
| `clearError` | `() => void` | Reset error to null |
| `connect` | `() => Promise<void>` | Resume DTP twin session |
| `disconnect` | `() => Promise<void>` | Tear down DTP twin session |

---

### `useDrugSearch`

Debounced drug name lookup. Checks Nigerian synonym table → HOLON concept search → free-text fallback.

**Returns:**

| Name | Type | Description |
|---|---|---|
| `query` | `string` | Current search text |
| `results` | `SearchResult[]` | Matched drugs |
| `isSearching` | `boolean` | True during HOLON lookup |
| `error` | `string \| null` | HOLON error message, if any |
| `setQuery` | `(text: string) => void` | Update search text (triggers debounced lookup) |
| `searchDirect` | `(text: string) => Promise<SearchResult[]>` | Immediate lookup, bypasses debounce |

**`SearchResult`:**

| Field | Type | Values |
|---|---|---|
| `name` | `string` | Drug display name |
| `conceptId` | `number \| undefined` | HOLON concept ID when resolved |
| `rxNormCode` | `string \| undefined` | RxNorm code when available |
| `source` | `"synonym" \| "holon" \| "fallback"` | Which layer resolved the match |

---

### `useSymptomLog(medicationId: string)`

Per-medication symptom tracking and classification.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `medicationId` | `string` | UUID of the parent medication |

**Returns:**

| Name | Type | Description |
|---|---|---|
| `symptoms` | `Symptom[]` | Symptoms filtered to the given medicationId |
| `logSymptom` | `(desc: string, severity: "mild" \| "moderate" \| "severe") => Promise<void>` | Create, classify, persist, and flag a symptom |
| `removeSymptom` | `(id: string) => Promise<void>` | Delete symptom by ID |
| `classifySymptom` | `(symptomText: string) => Promise<string>` | Classify text into a body system (Groq + keyword fallback) |

---

### `usePatternAnalysis`

Groq-powered health pattern analysis. Sends medication + symptom data to LLM.

**Returns:**

| Name | Type | Description |
|---|---|---|
| `analysis` | `string \| null` | LLM response text |
| `isAnalyzing` | `boolean` | True during LLM call |
| `analyze` | `(medications: Medication[], symptoms: Symptom[]) => Promise<void>` | Trigger analysis (rate-limited to once per 30s) |
| `lastAnalyzedAt` | `Date \| null` | Timestamp of last successful analysis |

---

### `useLogging`

Direct access to DTP twin flagging for custom events.

**Returns:**

| Name | Type | Description |
|---|---|---|
| `logEvent` | `(event: string, data?: Record<string, unknown>) => Promise<void>` | Emit a custom flag event to the DTP twin |

---

## Data Functions

---

### `getDrugInfo(drugName: string): Promise<DrugInfo | null>`

Groq-generated drug information with 7-day AsyncStorage cache.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `drugName` | `string` | Drug name (generic or brand) |

**Returns:** `DrugInfo | null`

**`DrugInfo`:**

| Field | Type | Description |
|---|---|---|
| `description` | `string` | Mechanism of action (2–3 sentences) |
| `commonBrands` | `string[]` | Common brand names |
| `warnings` | `string[]` | Key warnings |
| `sideEffects` | `string[]` | Common side effects |

On cache miss: calls Groq → caches result → returns. On cache hit within 7d: returns immediately. Returns `null` if Groq call fails and no cache exists.

---

### `classifySymptom(symptomText: string): Promise<string>`

Classify a symptom description into a body system.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `symptomText` | `string` | Free-text symptom description |

**Returns:** One of:
- `"Cardiovascular"`
- `"Respiratory"`
- `"Nervous System"`
- `"Gastrointestinal"`
- `"Musculoskeletal"`
- `"Integumentary"`
- `"Renal/Urinary"`
- `"Endocrine"`
- `"Immune/Lymphatic"`
- `"Reproductive"`
- `"Auditory/Vestibular"`
- `"Visual/Ocular"`
- `"General/Unspecified"`

Attempts Groq classification first; falls back to keyword matching on failure.

---

## Types

---

### `Medication`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | UUID |
| `name` | `string` | yes | Drug name |
| `synonyms` | `string[]` | yes | Nigerian brand-name aliases |
| `dosage` | `string` | yes | e.g. "500mg" |
| `frequency` | `string` | yes | e.g. "twice daily" |
| `timeOfDay` | `string[]` | yes | e.g. ["08:00", "20:00"] |
| `startDate` | `string` | yes | ISO 8601 |
| `endDate` | `string` | no | ISO 8601 |
| `prescribedBy` | `string` | no | Doctor name |
| `notes` | `string` | no | Free text |
| `conceptId` | `number` | no | HOLON concept ID |
| `info` | `DrugInfo` | no | Cached drug info |

---

### `Symptom`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | yes | UUID |
| `medicationId` | `string` | yes | FK → Medication.id |
| `description` | `string` | yes | Symptom text |
| `severity` | `"mild" \| "moderate" \| "severe"` | yes | Severity level |
| `timestamp` | `string` | yes | ISO 8601 |
| `bodySystem` | `string` | no | Classified body system |
| `flagged` | `boolean` | no | True if twin flag succeeded |

---

### `DrugInfo`

| Field | Type | Description |
|---|---|---|
| `description` | `string` | How the drug works |
| `commonBrands` | `string[]` | Common brand names |
| `warnings` | `string[]` | Key warnings |
| `sideEffects` | `string[]` | Common side effects |

---

### `ConnectionState`

`"disconnected" | "connecting" | "connected" | "error"`

---

## Provider Setup

**Component:** `AppProvider`

**File:** `src/hooks/useApp`

Wrap entire application tree. Initializes DTP twin, loads AsyncStorage, sets up 24h idle timeout. Children access state via `useApp()`.

---

## Flag Events (DTP Twin Telemetry)

Automatically emitted by the hooks:

| Event | Triggered By | Payload |
|---|---|---|
| `medication.added` | `addMedication()` | `{ id, name, dosage, frequency }` |
| `medication.removed` | `removeMedication()` | `{ id, name }` |
| `symptom.reported` | `addSymptom()` | `{ id, medicationId, description, severity, bodySystem }` |

Custom events can be emitted via `useLogging().logEvent(event, data)`.

---

## Static Data

### `src/data/nigeria-synonyms`

Lookup table: `Record<string, { conceptCode: string; label: string }[]>`

19 Nigerian-specific drug name mappings. Consumed internally by `useDrugSearch` as the first lookup layer. Not intended for direct screen use.

Key pattern: lowercase generic name → array of `{ conceptCode, label }` entries.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `EXPO_PUBLIC_DTP_API_KEY` | yes | DTP twin authentication |
| `EXPO_PUBLIC_DTP_BASE_URL` | yes | DTP API base (sandbox: `https://sandbox-api.ontomorph.com`) |
| `EXPO_PUBLIC_HOLON_API_KEY` | yes | HOLON drug interaction authentication |
| `EXPO_PUBLIC_HOLON_API_URL` | yes | HOLON API base (`https://holon-api.ontomorph.com`) |
| `EXPO_PUBLIC_GROQ_API_KEY` | yes | Groq LLM authentication |
| `EXPO_PUBLIC_GROQ_MODEL` | yes | Model name (`llama-3.3-70b-versatile`) |

---

## Known Limitation: HOLON Sandbox Concept Index

The HOLON instance contains the full 1.7M drug-interaction universe (`streamAll()` returns data). However, the sandbox concept-index is sparse. `checkList()` and `check()` return empty arrays for drugs whose concept IDs are absent from the sandbox index (e.g. paracetamol, aspirin, ibuprofen). A full-production HOLON API key resolves this.

`useDrugSearch` handles search failures gracefully: Nigerian synonym table (instant) → HOLON (may time out) → free-text fallback.