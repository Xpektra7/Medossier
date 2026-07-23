# Medossier

> *Your health, documented + understood.*

A mobile health dossier for Nigerian patients — search drugs, check interactions, log symptoms, and get AI-powered pattern insights. Built for people who manage multiple medications across multiple clinics, with no single professional reviewing the full picture.

## The problem

Nigerian patients routinely take 3–5+ drugs simultaneously, prescribed at different clinics. **79.7% of prescriptions contain potential drug-drug interactions.** The doctor-to-patient ratio is 1:9,083 — 1000% below WHO recommendation. Most patients have no way to check if their medications are safe together. Until now.

## What Medossier does

- **Search** any drug by name (brand, generic, Nigerian local) — plain-language explanation of what it does
- **Check** 1.7M known drug interactions — sees which organs are at risk, severity alerts
- **Log** symptoms and medications — unified timeline of your health
- **Analyze** patterns with Groq AI — plain-English insights linking symptoms to medications (never a diagnosis)
- **Persist** everything locally — your data stays on your device

## Built with

- **Expo** (React Native, Android)
- **Ontomorph DTP SDK** — digital twin connection + event logging
- **HOLON** — clinical knowledge graph (5.3M concepts, 1.7M interactions, 19 vocabularies)
- **Groq** — LLM for pattern intelligence (llama-3.3-70b-versatile)

## Product spec

See [`spec.md`](spec.md) for full product specification.

## Execution plans

See [`plans/`](plans/) for the phased build plan used during the hackathon.

## Hackathon scope (24-25 Jul 2026)

**In scope:** drug search, interaction checking, symptom ledger, merged timeline, AI insights, twin logging.

**Deferred:** multi-doctor coordination, caregiver sharing, push notifications, real patient twin grants.

The identity of Medossier — a personal health dossier bridging patients and doctors — is fully intact in the in-scope features.

---

*Built for the Ontomorph hackathon · Team [Your Team Name]*
