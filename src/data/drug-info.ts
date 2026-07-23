import AsyncStorage from '@react-native-async-storage/async-storage'
import { analyzeHealthPattern } from '@/api/groq'

const CACHE_PREFIX = 'medication-safety:drug-info:'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface DrugInfoResult {
  rxnorm: string
  genericName: string
  whatItDoes: string
  commonBrands?: string[]
  warnings?: string
  bodySystems: string[]
  source: 'groq' | 'cached' | 'fallback'
}

async function getCached(rxnorm: string): Promise<DrugInfoResult | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${rxnorm}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null
    return { ...parsed.info, source: 'cached' }
  } catch {
    return null
  }
}

async function setCache(rxnorm: string, info: DrugInfoResult) {
  try {
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${rxnorm}`,
      JSON.stringify({ info, cachedAt: Date.now() })
    )
  } catch {
    // silent
  }
}

const GENERATION_PROMPT = [
  'You are a health education writer creating plain-language drug descriptions for Nigerian patients.',
  'For the drug below, respond with valid JSON only (no markdown, no extra text):',
  '{ "whatItDoes": "2-sentence plain English explanation", "warnings": "1-2 safety sentences", "bodySystems": ["array of affected body systems"] }',
  '',
  'Possible body systems: cardiovascular, gastrointestinal, hepatic, renal, CNS, metabolic, hematologic, dermatologic, endocrine',
  '',
  'Drug: {name} (RxNorm: {code})',
].join('\n')

async function generate(rxnorm: string, drugName?: string): Promise<DrugInfoResult | null> {
  const prompt = GENERATION_PROMPT.replace('{code}', rxnorm).replace('{name}', drugName ?? `Drug ${rxnorm}`)

  try {
    const content = await analyzeHealthPattern([], [{ name: drugName ?? `RxNorm:${rxnorm}` }], prompt)
    if (content.includes('not available') || content.includes('try again')) return null

    const jsonStart = content.indexOf('{')
    const jsonEnd = content.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) return null

    const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1))

    return {
      rxnorm,
      genericName: drugName ?? `Drug ${rxnorm}`,
      whatItDoes: parsed.whatItDoes ?? 'No description available.',
      warnings: parsed.warnings ?? undefined,
      bodySystems: Array.isArray(parsed.bodySystems) ? parsed.bodySystems : [],
      source: 'groq',
    }
  } catch {
    return null
  }
}

export async function fetchDrugInfo(rxnorm: string, drugName?: string): Promise<DrugInfoResult> {
  const cached = await getCached(rxnorm)
  if (cached) return cached

  const generated = await generate(rxnorm, drugName)
  if (generated) {
    await setCache(rxnorm, generated)
    return generated
  }

  return {
    rxnorm,
    genericName: drugName ?? `Drug ${rxnorm}`,
    whatItDoes: 'Information about this drug is not yet available. Search online or consult your pharmacist.',
    warnings: 'Always consult your doctor or pharmacist before taking any new medication.',
    bodySystems: [],
    source: 'fallback',
  }
}