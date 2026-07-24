import { describe, it, expect } from 'bun:test'
import { lookupSynonym, getAllSynonyms } from '@/data/nigeria-synonyms'

describe('nigeria-synonyms', () => {
  it('looks up Nigerian-specific brand name (emzor paracetamol) → 161', () => {
    const result = lookupSynonym('emzor paracetamol')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('161')
  })

  it('looks up coartem → RxNorm 282448', () => {
    const result = lookupSynonym('coartem')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('282448')
  })

  it('looks up gp → RxNorm 1191 (aspirin)', () => {
    const result = lookupSynonym('gp')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('1191')
  })

  it('looks up amoxyl → RxNorm 723 (amoxicillin)', () => {
    const result = lookupSynonym('amoxyl')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('723')
  })

  it('looks up flagyl → RxNorm 6960', () => {
    const result = lookupSynonym('flagyl')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('6960')
  })

  it('looks up piriton → RxNorm 2462', () => {
    const result = lookupSynonym('piriton')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('2462')
  })

  it('looks up ventolin → RxNorm 7480', () => {
    const result = lookupSynonym('ventolin')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('7480')
  })

  it('looks up septrin → RxNorm 6856', () => {
    const result = lookupSynonym('septrin')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('6856')
  })

  it('returns null for unknown drug (agbo)', () => {
    const result = lookupSynonym('agbo')
    expect(result).toBeNull()
  })

  it('returns null for standard drug names (paracetamol) — falls through to HOLON search', () => {
    const result = lookupSynonym('paracetamol')
    expect(result).toBeNull()
  })

  it('returns null for standard drug names (ibuprofen)', () => {
    const result = lookupSynonym('ibuprofen')
    expect(result).toBeNull()
  })

  it('returns null for standard drug names (metformin)', () => {
    const result = lookupSynonym('metformin')
    expect(result).toBeNull()
  })

  it('handles case-insensitive lookup (PANADOL)', () => {
    const result = lookupSynonym('PANADOL')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('161')
  })

  it('handles case-insensitive lookup (FLAGYL)', () => {
    const result = lookupSynonym('FLAGYL')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('6960')
  })

  it('contains only Nigerian-specific brand names (19 entries)', () => {
    const all = getAllSynonyms()
    expect(Object.keys(all).length).toBe(19)
  })

  it('every synonym maps to a non-empty rxnorm code', () => {
    const all = getAllSynonyms()
    for (const entry of Object.values(all)) {
      expect(entry.rxnorm).toBeTruthy()
      expect(entry.name).toBeTruthy()
    }
  })
})