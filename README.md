# Medossier

> *Your health, documented + understood.*

A health diary and safety net for every Nigerian patient. Search drugs, check interactions, log symptoms and ailments, and get AI-powered pattern insights. Whether you see a doctor regularly or only when things get bad — Medossier keeps your health story in one place.

## The problem

The doctor-to-patient ratio in Nigeria is 1:9,083 — 1000% below WHO recommendation. Most people don't go to a hospital for every symptom or ailment. Health history is scattered across memory, paper scraps, and multiple clinic files that no one connects. **79.7% of prescriptions contain potential drug-drug interactions.** When you finally see a doctor, there's no complete record of what's been happening.

## What Medossier does

- **Log** every symptom, ailment, and medication — no matter how minor — in one unified timeline
- **Search** any drug by name (brand, generic, Nigerian local) — plain-language explanation of what it does
- **Check** 1.7M known drug interactions — see which organs are at risk, severity alerts
- **Analyze** patterns with Groq AI — plain-English insights linking symptoms to medications (never a diagnosis)
- **Persist** everything locally on your device — you own your data

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

The identity of Medossier — a personal health dossier for every Nigerian patient — is fully intact in the in-scope features.

---

*Built for the Ontomorph hackathon · Team [Your Team Name]*
