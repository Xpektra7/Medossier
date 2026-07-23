import { describe, it, expect } from 'bun:test'
import { getDrugInfo, getAllStaticDrugInfo } from '@/data/drug-info-static'

describe('drug-info-static (offline fallback)', () => {
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

  it('metformin info includes metabolic and renal', () => {
    const info = getDrugInfo('6809')
    expect(info).toBeDefined()
    expect(info!.bodySystems).toContain('metabolic')
    expect(info!.bodySystems).toContain('renal')
  })

  it('has at least 5 static entries for offline coverage', () => {
    const info = getAllStaticDrugInfo()
    expect(Object.keys(info).length).toBeGreaterThanOrEqual(5)
  })

  it('returns undefined for unknown code', () => {
    expect(getDrugInfo('999999')).toBeUndefined()
  })

  it('all static entries have whatItDoes and warnings', () => {
    const info = getAllStaticDrugInfo()
    for (const entry of Object.values(info)) {
      expect(entry.whatItDoes).toBeTruthy()
      expect(entry.warnings).toBeDefined()
    }
  })
})