import { describe, it, expect } from 'bun:test'
import { getBodySystems } from '@/data/body-systems'

describe('body-systems', () => {
  it('detects cardiovascular from BP keywords', () => {
    const systems = getBodySystems('May cause increased blood pressure and palpitations')
    expect(systems).toContain('cardiovascular')
  })

  it('detects cardiovascular from QT keywords', () => {
    const systems = getBodySystems('Risk of QT prolongation and arrhythmia')
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

  it('detects hematologic from bleeding keywords', () => {
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

  it('returns empty array for non-medical text', () => {
    const systems = getBodySystems('Take with food. Store at room temperature.')
    expect(systems).toEqual([])
  })

  it('detects additional systems from drug names (NSAID → GI + renal)', () => {
    const systems = getBodySystems('Common side effects', ['Ibuprofen'])
    expect(systems).toContain('gastrointestinal')
    expect(systems).toContain('renal')
  })

  it('detects hematologic from warfarin drug name', () => {
    const systems = getBodySystems('Monitor INR', ['Warfarin'])
    expect(systems).toContain('hematologic')
  })

  it('detects metabolic from insulin drug name', () => {
    const systems = getBodySystems('Take before meals', ['Insulin'])
    expect(systems).toContain('metabolic')
  })

  it('detects endocrine from hormone keywords', () => {
    const systems = getBodySystems('Affects thyroid hormone levels and cortisol production')
    expect(systems).toContain('endocrine')
  })

  it('handles empty strings gracefully', () => {
    const systems = getBodySystems('')
    expect(systems).toEqual([])
  })

  it('handles case-insensitive matching', () => {
    const systems = getBodySystems('LIVER toxicity and KIDNEY failure')
    expect(systems).toContain('hepatic')
    expect(systems).toContain('renal')
  })
})