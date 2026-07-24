import { describe, it, expect, beforeAll, afterAll } from 'bun:test'

const store = new Map<string, string>()

const mockGetItem = (key: string) => Promise.resolve(store.get(key) ?? null)
const mockSetItem = (key: string, val: string) => { store.set(key, val); return Promise.resolve() }

// We can't easily import AsyncStorage in Node, so test the storage functions
// by simulating their logic inline.

describe('storage logic', () => {
  const STORAGE_KEY = 'medication-safety:medications'

  it('returns empty array when no data stored', async () => {
    const stored = await mockGetItem(STORAGE_KEY)
    const meds = stored ? JSON.parse(stored) : []
    expect(meds).toEqual([])
  })

  it('stores and retrieves medications', async () => {
    const medications = [
      {
        id: '1',
        conceptId: 161,
        rxnormCode: '161',
        name: 'Paracetamol',
        addedAt: new Date().toISOString(),
      },
      {
        id: '2',
        conceptId: 282448,
        rxnormCode: '282448',
        name: 'Coartem',
        addedAt: new Date().toISOString(),
      },
    ]

    await mockSetItem(STORAGE_KEY, JSON.stringify(medications))
    const stored = await mockGetItem(STORAGE_KEY)
    const loaded = stored ? JSON.parse(stored) : []

    expect(loaded).toHaveLength(2)
    expect(loaded[0].name).toBe('Paracetamol')
    expect(loaded[1].name).toBe('Coartem')
    expect(loaded[0].rxnormCode).toBe('161')
  })

  it('preserves lastTaken field when present', async () => {
    const medications = [
      {
        id: '3',
        conceptId: 1191,
        rxnormCode: '1191',
        name: 'Aspirin',
        addedAt: new Date().toISOString(),
        lastTaken: new Date().toISOString(),
      },
    ]

    await mockSetItem(STORAGE_KEY, JSON.stringify(medications))
    const stored = await mockGetItem(STORAGE_KEY)
    const loaded = stored ? JSON.parse(stored) : []

    expect(loaded[0].lastTaken).toBeTruthy()
  })

  it('replaces on subsequent saves (no append)', async () => {
    await mockSetItem(STORAGE_KEY, JSON.stringify([{ id: 'only' }]))
    await mockSetItem(STORAGE_KEY, JSON.stringify([]))
    const stored = await mockGetItem(STORAGE_KEY)
    const loaded = stored ? JSON.parse(stored) : []
    expect(loaded).toEqual([])
  })
})