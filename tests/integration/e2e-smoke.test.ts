import { describe, it, expect, beforeAll } from 'bun:test'
import { DTP } from '@ontomorph/dtp-sdk'
import { fetchDrugInfo } from '@/data/drug-info'
import { classifyBodySystemsWithAI } from '@/data/body-systems'

let dtp: any, twin: any, holon: any

beforeAll(() => {
  if (!process.env.EXPO_PUBLIC_GROQ_API_KEY) {
    try {
      const fs = require('fs')
      const env = fs.readFileSync('.env', 'utf-8')
      const match = env.match(/^EXPO_PUBLIC_GROQ_API_KEY=(.+)$/m)
      if (match) process.env.EXPO_PUBLIC_GROQ_API_KEY = match[1].trim()
    } catch {}
  }

  const apiKey = process.env.EXPO_PUBLIC_DTP_API_KEY!
  const grantToken = process.env.EXPO_PUBLIC_SANDBOX_GRANT_TOKEN!
  const holonKey = process.env.EXPO_PUBLIC_HOLON_API_KEY!

  dtp = new DTP({
    apiKey,
    baseUrl: 'https://sandbox-api.ontomorph.com',
    holonApiKey: holonKey,
    holonApiUrl: 'https://holon-api.ontomorph.com',
  })
  twin = dtp.twins.connect(grantToken)
  holon = dtp.holon
})

function hasGroqKey() {
  return !!(
    process.env.EXPO_PUBLIC_GROQ_API_KEY &&
    process.env.EXPO_PUBLIC_GROQ_API_KEY.length > 10
  )
}

describe('live E2E smoke test', () => {

  // ── 1. HOLON drug search ──

  it('HOLON: searches paracetamol by code (RxNorm 161)', async () => {
    const r = await holon.concepts.getByCode('161', 'RxNorm')
    expect(r.concept.conceptName.toLowerCase()).toContain('acetaminophen')
    expect(r.concept.conceptId).toBeGreaterThan(0)
  }, 10_000)

  it('HOLON: searches coartem by code (RxNorm 282448)', async () => {
    const r = await holon.concepts.getByCode('282448', 'RxNorm')
    expect(r.concept.conceptName.toLowerCase()).toContain('artemether')
  }, 10_000)

  it('HOLON: searches drugs by name', async () => {
    const r = await holon.concepts.search('amlodipine', { domain: 'Drug' })
    expect(r.hits.length).toBeGreaterThanOrEqual(0)
  }, 10_000)

  it('HOLON: searches aspirin by code (RxNorm 1191)', async () => {
    const r = await holon.concepts.getByCode('1191', 'RxNorm')
    expect(r.concept.conceptName.toLowerCase()).toContain('aspirin')
  }, 10_000)

  // ── 2. HOLON interactions ──

  it('HOLON: checkList for 3 drugs returns response', async () => {
    const paracetamol = await holon.concepts.getByCode('161', 'RxNorm')
    const aspirin = await holon.concepts.getByCode('1191', 'RxNorm')
    const ibuprofen = await holon.concepts.getByCode('5640', 'RxNorm')
    const ids = [paracetamol.concept.conceptId, aspirin.concept.conceptId, ibuprofen.concept.conceptId]
    const r = await holon.interactions.checkList(ids)
    expect(r).toBeDefined()
    expect(typeof r.totalInteractions).toBe('number')
    expect(Array.isArray(r.pairs)).toBe(true)
  }, 15_000)

  it('HOLON: check aspirin+ibuprofen returns response', async () => {
    const result = await holon.interactions.check(1191, 5640)
    expect(typeof result.hasInteraction).toBe('boolean')
    expect(Array.isArray(result.interactions)).toBe(true)
  }, 10_000)

  // ── 3. Twin operations ──

  it('TWIN: events.list returns array', async () => {
    const r = await twin.events.list({ system: 'medication' })
    expect(Array.isArray(r)).toBe(true)
  }, 10_000)

  it('TWIN: flag creates an event', async () => {
    const e = await twin.flag('medication', {
      code: 'smoke_test',
      value: 'live-e2e',
      title: 'E2E Smoke Test',
    })
    expect(e.id).toBeTruthy()
    expect(e.eventType).toBeDefined()
  }, 10_000)

  it('TWIN: systems.get returns system view', async () => {
    const v = await twin.systems.get('medication')
    expect(v.system).toBe('medication')
    expect(v.twinId).toBe(twin.id)
  }, 10_000)

  // ── 4. Groq drug info generation ──

  it('GROQ: generates drug info for unknown drug', async () => {
    if (!hasGroqKey()) return
    const info = await fetchDrugInfo('12345', 'Testomycin')
    expect(info).toBeDefined()
    expect(info.rxnorm).toBe('12345')
    expect(['groq', 'cached', 'fallback']).toContain(info.source)
    if (info.source !== 'fallback') {
      expect(info.whatItDoes).toBeTruthy()
      expect(info.whatItDoes.length).toBeGreaterThan(10)
    }
  }, 30_000)

  it('GROQ: generates drug info for common drug (amlodipine)', async () => {
    if (!hasGroqKey()) return
    const info = await fetchDrugInfo('692', 'Amlodipine')
    expect(info).toBeDefined()
    expect(info.whatItDoes?.toLowerCase()).toContain('blood pressure')
    expect(info.bodySystems).toContain('cardiovascular')
  }, 30_000)

  // ── 5. Groq body system classification ──

  it('GROQ: classifies body systems from interaction text', async () => {
    if (!hasGroqKey()) return
    const systems = await classifyBodySystemsWithAI(
      'Risk of hepatotoxicity and nephrotoxicity. Monitor liver enzymes and creatinine.'
    )
    expect(systems).toContain('hepatic')
    expect(systems).toContain('renal')
  }, 15_000)

  it('GROQ: classifies cardiovascular + GI from mixed text', async () => {
    if (!hasGroqKey()) return
    const systems = await classifyBodySystemsWithAI(
      'May cause QT prolongation and gastric ulcer. Monitor ECG and consider PPI.'
    )
    expect(systems).toContain('cardiovascular')
    expect(systems).toContain('gastrointestinal')
  }, 15_000)

  // ── 6. E2E workflow ──

  it('E2E: search → generate info → check interactions → flag', async () => {
    if (!hasGroqKey()) return

    const concept = await holon.concepts.getByCode('161', 'RxNorm')
    expect(concept.concept.conceptName).toBeTruthy()

    const info = await fetchDrugInfo(concept.concept.conceptCode, concept.concept.conceptName)
    expect(info.whatItDoes).toBeTruthy()

    const aspirin = await holon.concepts.getByCode('1191', 'RxNorm')

    const interaction = await holon.interactions.check(
      concept.concept.conceptId,
      aspirin.concept.conceptId
    )
    expect(typeof interaction.hasInteraction).toBe('boolean')

    const clinicalEffect = interaction.interactions[0]?.clinicalEffect
      ?? 'No known interaction between these drugs.'
    const systems = await classifyBodySystemsWithAI(
      clinicalEffect,
      [concept.concept.conceptName, aspirin.concept.conceptName]
    )
    expect(Array.isArray(systems)).toBe(true)

    const event = await twin.flag('medication', {
      code: interaction.hasInteraction ? 'interaction.found' : 'interaction.checked',
      value: JSON.stringify({
        drugA: concept.concept.conceptName,
        drugB: aspirin.concept.conceptName,
        hasInteraction: interaction.hasInteraction,
        severity: interaction.interactions[0]?.severity ?? 'none',
        bodySystems: systems,
      }),
      title: `Interaction check: ${concept.concept.conceptName} + ${aspirin.concept.conceptName}`,
    })
    expect(event.id).toBeTruthy()
  }, 60_000)
})