# Demo Script — Medossier

**Slot:** 15 minutes · **Audience:** OAUTHC CMD, Iyiola Medical Director, Cowrywise engineer, CDR.fyi engineer, Ontomorph cofounder

## Pre-seeded demo patient

Manually create this account and populate before demo day:

**Patient:** Iya Bisi, 58F
**Pre-loaded medications:** Amlodipine, Metformin
**Pre-loaded symptom history:**
- "Fever" (moderate) — 10 Jul
- "Chills" (mild) — 11 Jul
  *(both logged while Coartem was active — Coartem since removed)*

## Live demo sequence (15 min)

**0:00 — Problem (1 min)**
> "47% of Nigerian patients on multiple drugs have dangerous interactions they don't know about.
> Iya Bisi takes drugs from 3 different clinics. Nobody has reviewed her full list."

**1:00 — Open app, show her medication list (1 min)**
Pre-seeded: Amlodipine + Metformin. Connection badge shows "Twin ✓".

**2:00 — She adds Ibuprofen for joint pain (2 min)**
Search "ibuprofen" → synonym resolves → DrugCard shows plain English explanation.
She adds it. Interaction panel fires:
🔴 **Ibuprofen + Amlodipine** — "NSAIDs can reduce blood pressure medication effectiveness and stress the kidneys."
🟡 **Ibuprofen + Metformin** — "May affect kidney function, increasing Metformin buildup risk."
Body system tags: 🫀 Cardiovascular · 🫘 Renal

**4:00 — Swap Ibuprofen for Paracetamol (1 min)**
Remove Ibuprofen. Add Paracetamol. Interaction panel goes green: "No known interactions."
> "This is what a pharmacist should tell you. Now anyone can know."

**5:00 — Switch to Timeline (ledger) (3 min)**
Show pre-seeded symptom history. Explain:
> "Iya Bisi had fever and chills in early July while on Coartem — malaria treatment.
> It's now July 23. Fever is back."
Live: log new symptom — "Fever", Severe.

**8:00 — Tap Analyze Pattern (3 min)**
Groq returns insight (live call):
> "You completed malaria treatment about 2 weeks ago. Recurring fever this soon could mean:
> 1. Treatment didn't fully clear the infection (resistance or incomplete dose)
> 2. A different illness — typhoid shares these symptoms and is common in Nigeria
> 3. Reinfection — malaria can return quickly in endemic areas.
> Please see a doctor to confirm."
Show disclaimer: ⚠️ Not a diagnosis.

**11:00 — Platform depth (1 min)**
Quick slide: HOLON 1.7M interactions, twin event logging, real-time safety checks.

**12:00 — Vision (2 min)**
> "This works for every Nigerian on 2+ drugs. No pharmacist needed. Scales to React Native.
> Next: caregiver sharing, push alerts, real patient twin grants."

**14:00 — Q&A**

## Roles on demo day

| Who | Role |
|-----|------|
| Xpektra | Drives the app live on screen |
| Backend dev | Handles any technical questions |
| ML person | Presents the problem slide + vision slide, handles Q&A |
