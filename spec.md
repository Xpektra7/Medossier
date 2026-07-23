# Medossier — Product Spec

> **Tagline:** *"Your health, documented + understood."*
> **Build target:** 2 days · **Platform:** Android (Expo) · **Audience:** Nigerian patients & caregivers

---

## 1. Problem

Nigeria has one of the highest polypharmacy rates in Africa. Patients routinely take 3–5+ drugs simultaneously — often prescribed at different clinics, with no single professional reviewing the full picture. Common scenarios:

- A malaria patient on Coartem also takes paracetamol + ibuprofen + an antibiotic
- A hypertensive on amlodipine + metoprolol also takes NSAIDs for joint pain
- An HIV patient on ART adds herbal supplements + OTC painkillers

The result: **silent dangerous drug interactions** going undetected until hospitalization.

## 2. Solution

A mobile app where patients/caregivers:

1. **Search and log their medications** using any name (brand, generic, Nigerian local)
2. **See a plain-language explanation** of what each drug does
3. **Get interaction checks** against 1.7M drug pairs (HOLON)
4. **See which body systems are affected** by each interaction
5. **Get clear severity alerts** — contraindicated combos flagged immediately
6. **Log symptoms** — track what they feel, when, and which drugs were active
7. **Get AI-powered pattern insights** — plain-language explanations linking symptoms to medications
8. **See a unified timeline** — medications + symptoms, all in one place

## 3. Core features (priority order)

### P0 — Ship day 1
- Sandbox twin connection (static grant token from dashboard, `dtp.twins.connect()`)
- Drug search with Nigerian name support (synonym map → RxNorm → HOLON `concepts.getByCode()`)
- Drug explanation in plain language (built-in drug info map)
- Medication list (add, remove, mark taken)
- Interaction checking via HOLON (`interactions.checkList()`)
- Severity display (contraindicated / moderate / minor) with clinical effect + management text
- Body system mapping for interactions (stored on twin via `twin.flag()`)

### P1 — Ship day 2
- Persistence (AsyncStorage, single device)
- Interaction-to-body-system event logging on twin via `twin.flag()`
- Timeline screen (reads from `twin.events.list()`)
- Toast notifications
- Connection badge

### P2 — Polish
- Plain language for all common Nigerian drugs (50+)
- Push notifications for dangerous interactions (future)
- Real patient grant flow (future production upgrade)
- Caregiver sharing (future)

## 4. Body system mapping

Each drug interaction affects one or more body systems. When an interaction is found, it's logged to the twin as an event with body system tags.

| System | Examples |
|--------|----------|
| Cardiovascular | BP changes, arrhythmia risk, QT prolongation |
| Gastrointestinal | Ulcer risk, bleeding, nausea |
| Hepatic | Liver toxicity, enzyme competition |
| Renal | Nephrotoxicity, electrolyte imbalance |
| CNS | Sedation, serotonin syndrome, seizures |
| Metabolic | Hypo/hyperglycemia, electrolyte shifts |
| Hematologic | Bleeding risk, bone marrow suppression |
| Dermatologic | Rash, photosensitivity |
| Endocrine | Thyroid, adrenal effects |

These are static mappings defined in the app, keyed to interaction pairs. Stored on the twin as events for OntoMorph platform analytics.

## 5. Architecture

```
App.tsx
  → AppProvider (useApp context)
    → NavigationContainer
      → BottomTabNavigator
          ├── Home (search + list + interactions + body systems)
          ├── Medications (full list view)
          └── Timeline (event log from twin)
```

### Data flow

```
App start → DTP({ apiKey, holonApiKey })
  → dtp.twins.connect(EXPO_PUBLIC_SANDBOX_GRANT_TOKEN) → { twin, holon }

User types drug name
  → lookupSynonym() checks Nigerian map
  → holon.concepts.getByCode() or holon.concepts.search() on HOLON (via SDK)
  → DrugCard shown with plain-language explanation (from static drug-info.ts)
  → User adds to list (local state + AsyncStorage)
  → holon.interactions.checkList() on all med concept IDs (via SDK)
  → Results displayed with severity + body system tags
  → twin.flag() events logged to sandbox twin: medication.added, interaction.found
```

### API surfaces used (via `@ontomorph/dtp-sdk` + `@ontomorph/holon-client`)

**Twin Core (via SDK):**
- `dtp.twins.connect(grantToken)` — connect to sandbox twin using token from dashboard
- `twin.flag(system, { code, value, title, description })` — write events (medication.added, interaction.found)
- `twin.events.list({ system })` — read events for timeline

**HOLON (via SDK's `dtp.holon`):**
- `holon.concepts.search(query, { domain })` — search drugs across vocabularies
- `holon.concepts.getByCode(code, vocabulary)` — exact RxNorm lookup (used after synonym match)
- `holon.interactions.checkList([...conceptIds])` — whole-list interaction screening

## 6. Plain language drug info

Local static map in `src/data/drug-info.ts` keyed to RxNorm codes. Each entry has:

```typescript
interface DrugInfo {
  rxnorm: string
  genericName: string
  whatItDoes: string          // "Lowers blood pressure by relaxing your blood vessels"
  commonBrands?: string[]     // ["Norvasc", "Amlocor"]
  warnings?: string           // "Don't take with grapefruit juice"
  bodySystems: string[]       // ["cardiovascular"]
}
```

Cover all 50+ entries from the synonym map. This makes the app educational, not just a checker.

## 7. Screen map

| Screen | Content |
|--------|---------|
| Home (tab) | Search bar → results → medication list → interaction panel with body system tags |
| Medications (tab) | Full scrollable list of all medications with take/remove |
| Timeline (tab) | Activity feed from `twin.events.list()` — medication adds, takes, interaction alerts |


---

## 8. Hackathon scope

### In scope (ship by Friday 23:00 WAT)
- Drug search with Nigerian name support + plain-language explanations
- Medication list (add, remove, mark taken) with AsyncStorage persistence
- Interaction checking via HOLON (1.7M pairs) with severity + body system tags
- Symptom ledger (log symptoms, severity, related meds) with persistence
- Merged timeline (medication events + symptom entries, sorted by date)
- AI pattern analysis via Groq (symptom + medication patterns, plain-language insight)
- Twin event logging (`twin.flag()` for medication.added, interaction.found, symptom.logged)
- Toast notifications + connection badge

### Deferred (post-hackathon roadmap)
- Multi-doctor / pharmacist coordination and shared access
- Real patient grant flow (production twin grants instead of sandbox)
- Caregiver sharing (family member monitoring)
- Push notifications for dangerous interactions
- Full 50+ Nigerian drug info (ship with ~20, expand later)
- Clinic/hospital dashboard integration
- Prescription scanning (OCR)

The identity of **Medossier** — a personal health dossier that bridges patients and doctors — is fully intact with the in-scope features. The deferred features expand the network, not the core value.

---

*Spec v2.0 — Build target: 2 days (hackathon) · Medossier*
