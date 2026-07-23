import { describe, it, expect } from 'bun:test'
import { getAllDrugInfo, getDrugInfo } from '@/data/drug-info'
import { getAllSynonyms } from '@/data/nigeria-synonyms'

describe('drug-info', () => {
  it('every synonym drug has a drug-info entry', () => {
    const synonyms = getAllSynonyms()
    const drugInfo = getAllDrugInfo()
    const seen = new Set<string>()

    for (const entry of Object.values(synonyms)) {
      if (seen.has(entry.rxnorm)) continue
      seen.add(entry.rxnorm)
      expect(drugInfo[entry.rxnorm]).toBeDefined()
    }
  })

  it('every drug-info entry has whatItDoes', () => {
    const info = getAllDrugInfo()
    for (const [code, entry] of Object.entries(info)) {
      expect(entry.whatItDoes).toBeTruthy()
      expect(entry.genericName).toBeTruthy()
      expect(Array.isArray(entry.bodySystems)).toBe(true)
    }
  })

  it('paracetamol info is correct', () => {
    const info = getDrugInfo('161')
    expect(info).toBeDefined()
    expect(info!.genericName).toContain('Paracetamol')
    expect(info!.whatItDoes).toBeTruthy()
    expect(info!.bodySystems).toContain('hepatic')
  })

  it('coartem info is correct', () => {
    const info = getDrugInfo('282448')
    expect(info).toBeDefined()
    expect(info!.genericName).toContain('Artemether')
    expect(info!.whatItDoes).toContain('malaria')
  })

  it('aspirin info includes cardiovascular and GI', () => {
    const info = getDrugInfo('1191')
    expect(info).toBeDefined()
    expect(info!.bodySystems).toContain('cardiovascular')
    expect(info!.bodySystems).toContain('gastrointestinal')
  })

  it('has at least 40 unique RxNorm entries', () => {
    const info = getAllDrugInfo()
    expect(Object.keys(info).length).toBeGreaterThanOrEqual(40)
  })

  it('returns undefined for unknown code', () => {
    expect(getDrugInfo('999999')).toBeUndefined()
  })

  it('all info entries have warnings or empty string', () => {
    const info = getAllDrugInfo()
    for (const entry of Object.values(info)) {
      expect(entry.warnings).toBeDefined()
    }
  })
})