import { describe, it, expect, afterAll, afterEach, mock } from 'bun:test'

const mockFetch = mock()
const originalFetch = globalThis.fetch
globalThis.fetch = mockFetch

import { analyzeHealthPattern } from '@/api/groq'

describe('groq API wrapper', () => {
  afterAll(() => {
    globalThis.fetch = originalFetch
  })

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY
    mockFetch.mockClear()
  })

  it('returns fallback string when GROQ_API_KEY is not set', async () => {
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY
    const result = await analyzeHealthPattern([], [])
    expect(result).toBe('AI analysis is not available. Set your Groq API key in .env to enable it.')
  })

  it('returns fallback string on network error', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    mockFetch.mockRejectedValue(new Error('Network error'))

    const result = await analyzeHealthPattern(
      [{ id: '1', description: 'Headache', severity: 'mild', loggedAt: new Date().toISOString() }],
      [{ name: 'Paracetamol' }]
    )
    expect(result).toBe('Unable to analyze patterns right now. Please try again later.')
  })

  it('returns fallback on non-200 response', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    } as Response)

    const result = await analyzeHealthPattern(
      [{ id: '1', description: 'Headache', severity: 'mild', loggedAt: new Date().toISOString() }],
      [{ name: 'Paracetamol' }]
    )
    expect(result).toBe('Unable to analyze patterns right now. Please try again later.')
  })

  it('returns content from successful API call', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'Your headache may be related to dehydration or eye strain. Please see a doctor to confirm.',
            },
          },
        ],
      }),
    } as Response)

    const result = await analyzeHealthPattern(
      [{ id: '1', description: 'Headache', severity: 'mild', loggedAt: new Date().toISOString() }],
      [{ name: 'Paracetamol' }]
    )
    expect(result).toContain('headache')
    expect(result).toContain('Please see a doctor')
  })

  it('returns fallback when choices array is empty', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    } as Response)

    const result = await analyzeHealthPattern(
      [{ id: '1', description: 'Fever', severity: 'moderate', loggedAt: new Date().toISOString() }],
      [{ name: 'Coartem' }]
    )
    expect(result).toBe('No analysis available.')
  })

  it('sends correct request body to Groq API', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    let requestBody: any = null
    mockFetch.mockImplementation(async (url: string, opts: RequestInit) => {
      requestBody = JSON.parse(opts.body as string)
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Analysis result' } }],
        }),
      } as Response
    })

    await analyzeHealthPattern(
      [
        { id: '1', description: 'Cough', severity: 'moderate', loggedAt: '2025-07-22T10:00:00Z' },
      ],
      [{ name: 'Amoxicillin' }]
    )

    expect(requestBody.model).toBe('llama-3.3-70b-versatile')
    expect(requestBody.max_tokens).toBe(300)
    expect(requestBody.temperature).toBe(0.3)
    expect(requestBody.messages[0].role).toBe('system')
    expect(requestBody.messages[1].role).toBe('user')
    expect(requestBody.messages[1].content).toContain('Cough')
    expect(requestBody.messages[1].content).toContain('Amoxicillin')
    expect(requestBody.messages[1].content).toContain('severity: moderate')
  })
})