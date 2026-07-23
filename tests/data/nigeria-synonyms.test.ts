import { describe, it, expect } from 'bun:test'
import { lookupSynonym, getAllSynonyms } from '@/data/nigeria-synonyms'

describe('nigeria-synonyms', () => {
  it('looks up paracetamol → RxNorm 161', () => {
    const result = lookupSynonym('paracetamol')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('161')
    expect(result!.name).toBe('Paracetamol')
  })

  it('looks up emzor paracetamol → RxNorm 161', () => {
    const result = lookupSynonym('emzor paracetamol')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('161')
  })

  it('looks up coartem → RxNorm 282448', () => {
    const result = lookupSynonym('coartem')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('282448')
    expect(result!.name).toBe('Artemether / Lumefantrine')
  })

  it('looks up gp → RxNorm 1191 (aspirin)', () => {
    const result = lookupSynonym('gp')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('1191')
    expect(result!.name).toBe('Aspirin')
  })

  it('looks up amoxyl → RxNorm 723 (amoxicillin)', () => {
    const result = lookupSynonym('amoxyl')
    expect(result).not.toBeNull()
    expect(result!.rxnorm).toBe('723')
    expect(result!.name).toBe('Amoxicillin')
  })

  it('returns null for unknown drug (agbo)', () => {
    const result = lookupSynonym('agbo')
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

  it('has at least 50 synonym entries', () => {
    const all = getAllSynonyms()
    const keys = Object.keys(all)
    expect(keys.length).toBeGreaterThanOrEqual(50)
  })

  it('every synonym maps to a non-empty rxnorm code', () => {
    const all = getAllSynonyms()
    for (const [key, entry] of Object.entries(all)) {
      expect(entry.rxnorm).toBeTruthy()
      expect(entry.name).toBeTruthy()
    }
  })

  it('covers major drug categories', () => {
    const all = getAllSynonyms()
    const keys = Object.keys(all)
    expect(keys).toContain('paracetamol')
    expect(keys).toContain('coartem')
    expect(keys).toContain('amoxicillin')
    expect(keys).toContain('metronidazole')
    expect(keys).toContain('amlodipine')
    expect(keys).toContain('metformin')
    expect(keys).toContain('salbutamol')
    expect(keys).toContain('piriton')
    expect(keys).toContain('omeprazole')
    expect(keys).toContain('insulin')
  })
})