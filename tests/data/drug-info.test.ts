import { describe, it, expect, afterAll, afterEach, mock } from 'bun:test'

const mockFetch = mock()
const originalFetch = globalThis.fetch
globalThis.fetch = mockFetch

const mockGetItem = mock()
const mockSetItem = mock()

mock.module('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: mockGetItem,
    setItem: mockSetItem,
  },
}))

import { fetchDrugInfo } from '@/data/drug-info'

const originalKey = process.env.EXPO_PUBLIC_GROQ_API_KEY

describe('drug-info (fully dynamic)', () => {
  afterAll(() => {
    globalThis.fetch = originalFetch
    if (originalKey) process.env.EXPO_PUBLIC_GROQ_API_KEY = originalKey
    else delete process.env.EXPO_PUBLIC_GROQ_API_KEY
  })

  afterEach(() => {
    mockFetch.mockClear()
    mockGetItem.mockClear()
    mockSetItem.mockClear()
  })

  it('returns fallback when GROQ key is not set and no cache', async () => {
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY
    mockGetItem.mockResolvedValue(null)

    const result = await fetchDrugInfo('5640', 'Ibuprofen')
    expect(result.source).toBe('fallback')
    expect(result.rxnorm).toBe('5640')
    expect(result.whatItDoes).toContain('not yet available')
  })

  it('returns generated info from Groq', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    mockGetItem.mockResolvedValue(null)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              whatItDoes: 'Lowers blood pressure by relaxing blood vessels.',
              warnings: 'Do not take with grapefruit juice.',
              bodySystems: ['cardiovascular'],
            }),
          },
        }],
      }),
    } as Response)

    const result = await fetchDrugInfo('692', 'Amlodipine')
    expect(result.source).toBe('groq')
    expect(result.whatItDoes).toContain('blood pressure')
    expect(result.bodySystems).toContain('cardiovascular')
    expect(mockSetItem).toHaveBeenCalled()
  })

  it('uses cached value when available', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    const cachedEntry = JSON.stringify({
      info: {
        rxnorm: '161',
        genericName: 'Paracetamol',
        whatItDoes: 'Cached description.',
        bodySystems: ['hepatic'],
        source: 'groq',
      },
      cachedAt: Date.now(),
    })
    mockGetItem.mockResolvedValue(cachedEntry)

    const result = await fetchDrugInfo('161', 'Paracetamol')
    expect(result.source).toBe('cached')
    expect(result.whatItDoes).toBe('Cached description.')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('expires cache after TTL', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    const staleEntry = JSON.stringify({
      info: {
        rxnorm: '161',
        genericName: 'Paracetamol',
        whatItDoes: 'Stale description.',
        bodySystems: [],
        source: 'groq',
      },
      cachedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    })
    mockGetItem.mockResolvedValue(staleEntry)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify({
              whatItDoes: 'Fresh description.',
              warnings: 'Take with food.',
              bodySystems: ['hepatic'],
            }),
          },
        }],
      }),
    } as Response)

    const result = await fetchDrugInfo('161', 'Paracetamol')
    expect(result.source).toBe('groq')
    expect(result.whatItDoes).toBe('Fresh description.')
  })

  it('passes drugName + code in the generation prompt', async () => {
    process.env.EXPO_PUBLIC_GROQ_API_KEY = 'test-key'
    mockGetItem.mockResolvedValue(null)
    let requestBody: any = null
    mockFetch.mockImplementation(async (_url: string, opts: RequestInit) => {
      requestBody = JSON.parse(opts.body as string)
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ whatItDoes: 'OK', bodySystems: [] }) } }],
        }),
      } as Response
    })

    await fetchDrugInfo('282448', 'Coartem')
    const systemMsg = requestBody.messages[0].content
    expect(systemMsg).toContain('Coartem')
    expect(systemMsg).toContain('282448')
  })
})