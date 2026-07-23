import { describe, it, expect, afterAll, mock } from 'bun:test'
import { getBodySystems, classifyBodySystemsWithAI } from '@/data/body-systems'

describe('body-systems (keyword fallback)', () => {
  it('detects cardiovascular from BP keywords', () => {
    const systems = getBodySystems('May cause increased blood pressure and palpitations')
    expect(systems).toContain('cardiovascular')
  })

  it('detects gastrointestinal from ulcer keywords', () => {
    const systems = getBodySystems('Can cause gastric ulcer and stomach bleeding')
    expect(systems).toContain('gastrointestinal')
  })

  it('detects hepatic from liver keywords', () => {
    const systems = getBodySystems('Hepatotoxicity — may cause liver enzyme elevation')
    expect(systems).toContain('hepatic')
  })

  it('detects renal from kidney keywords', () => {
    const systems = getBodySystems('Nephrotoxicity — monitor creatinine levels')
    expect(systems).toContain('renal')
  })

  it('detects CNS from sedation keywords', () => {
    const systems = getBodySystems('Causes drowsiness and dizziness. Risk of serotonin syndrome.')
    expect(systems).toContain('CNS')
  })

  it('detects multiple systems from mixed text', () => {
    const systems = getBodySystems('Risk of liver damage and stomach bleeding. Monitor blood pressure.')
    expect(systems).toContain('hepatic')
    expect(systems).toContain('gastrointestinal')
    expect(systems).toContain('hematologic')
  })

  it('detects hematologic from blood keywords', () => {
    const systems = getBodySystems('Increases risk of bleeding and coagulation abnormalities')
    expect(systems).toContain('hematologic')
  })

  it('detects dermatologic from rash keywords', () => {
    const systems = getBodySystems('May cause skin rash and photosensitivity')
    expect(systems).toContain('dermatologic')
  })

  it('detects metabolic from glucose keywords', () => {
    const systems = getBodySystems('Risk of hypoglycemia in diabetic patients')
    expect(systems).toContain('metabolic')
  })

  it('detects endocrine from hormone keywords', () => {
    const systems = getBodySystems('Affects thyroid hormone levels and cortisol production')
    expect(systems).toContain('endocrine')
  })

  it('adds drug-name hints for NSAIDs', () => {
    const systems = getBodySystems('Common side effects', ['Ibuprofen'])
    expect(systems).toContain('gastrointestinal')
    expect(systems).toContain('renal')
  })

  it('returns empty array for non-medical text', () => {
    const systems = getBodySystems('Take with food. Store at room temperature.')
    expect(systems).toEqual([])
  })

  it('handles case-insensitive matching', () => {
    const systems = getBodySystems('LIVER toxicity and KIDNEY failure')
    expect(systems).toContain('hepatic')
    expect(systems).toContain('renal')
  })
})

describe('body-systems (AI classification)', () => {
  const originalFetch = globalThis.fetch
  const mockFetch = mock()
  const originalKey = process.env.EXPO_PUBLIC_GROQ_API_KEY

  afterAll(() => {
    globalThis.fetch = originalFetch
    if (originalKey) process.env.EXPO_PUBLIC_GROQ_API_KEY = originalKey
    else delete process.env.EXPO_PUBLIC_GROQ_API_KEY
  })

  it('falls back to keyword matching when GROQ key not set', async () => {
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY
    const systems = await classifyBodySystemsWithAI('Risk of liver damage and bleeding')
    expect(systems).toContain('hepatic')
    expect(systems).toContain('hematologic')
  })

  it('falls back to keyword matching on network error', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    globalThis.fetch = mockFetch
    mockFetch.mockRejectedValue(new Error('Network error'))

    const systems = await classifyBodySystemsWithAI('Risk of kidney failure')
    expect(systems).toContain('renal')
  })

  it('uses AI result when available', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    globalThis.fetch = mockFetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '["cardiovascular", "renal"]' } }],
      }),
    } as Response)

    const systems = await classifyBodySystemsWithAI('Increases BP and affects kidneys')
    expect(systems).toEqual(['cardiovascular', 'renal'])
  })

  it('falls back on invalid AI response', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    globalThis.fetch = mockFetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'not valid json' } }],
      }),
    } as Response)

    const systems = await classifyBodySystemsWithAI('Liver toxicity expected')
    expect(systems).toContain('hepatic')
  })
})