# Plan 002: Nigerian synonym map + drug info + SDK HOLON hooks

**Priority:** P0 · **Effort:** S · **Risk:** LOW · **Depends on:** 001

## Steps

1. Create `src/data/nigeria-synonyms.ts` with a `Record<string, SynonymEntry>` map (50+ entries) covering common Nigerian drug names → RxNorm codes. Export `lookupSynonym(term): SynonymEntry | null`. Includes: paracetamol/panadol/emzor, aspirin/gp, ibuprofen/brufen, diclofenac/voltaren, naproxen, coartem/maloxine/lonart, artemether/lumefantrine, artesunate, amodiaquine, fansidar, chloroquine, quinine, amoxicillin/amoxyl/augmentin, metronidazole/flagyl, ciprofloxacin/ciprotab, azithromycin/zithromax, doxycycline, septrin/cotrimoxazole, amlodipine/norvasc, lisinopril, enalapril, atenolol, metoprolol, losartan, metformin, glibenclamide, insulin, salbutamol/ventolin, piriton, cetirizine, loratadine, omeprazole, vitamin C, ferrous sulfate, folic acid, multivitamin.
2. Quick test: verify 7 lookups (paracetamol→161, emzor paracetamol→161, coartem→282448, gp→1191, amoxyl→3081, agbo→null, PANADOL→161). Delete test script after.
3. Create `src/data/drug-info.ts` — plain-language explanations for all 50+ drugs in the synonym map. Keyed by RxNorm code. Each entry has: generic name, `whatItDoes` (2-sentence plain English), `commonBrands`, `warnings`, `bodySystems` array. This is what users see when they search.
4. Create `src/data/body-systems.ts` — mapping of interaction descriptions to affected body systems. Export `getBodySystems(interaction): string[]` using keyword matching on the interaction's `clinicalEffect` and drug names (keywords like "bleeding" → hematologic, "QT" → cardiovascular, "sedation" → CNS, "nephro" → renal, "hepatic" → liver, etc.). Covers 9 systems: cardiovascular, gastrointestinal, hepatic, renal, CNS, metabolic, hematologic, dermatologic, endocrine.
5. Create `src/hooks/useDrugSearch.ts` — debounced search hook (400ms). Uses `holon` from the `useApp()` context (the configured `HolonClient` from `@ontomorph/holon-client`). On query change:
   - First checks `lookupSynonym(query)` — if found, calls `holon.concepts.getByCode(synonym.rxnorm, 'RxNorm')` for direct lookup
   - Otherwise calls `holon.concepts.search(query, { domain: 'Drug' })` for full-text search across all vocabularies
   - Returns query, results (`SearchHit[]` from the SDK), loading, error, `resolvedFromSynonym` flag
   - The SDK's `SearchHit` carries `conceptId`, `conceptCode`, `conceptName`, `vocabularyId`, `domainId`
6. `bun run tsc --noEmit` — must exit 0.

## Verification

- `bun run tsc --noEmit` exits 0
- Synonym test: all 7 PASS
- `useDrugSearch` resolves "paracetamol" via synonym → RxNorm `getByCode` lookup
- Non-synonym queries fall through to `holon.concepts.search()`
- Drug info lookup works for each synonym entry
- Body system tagging works via `getBodySystems()`
