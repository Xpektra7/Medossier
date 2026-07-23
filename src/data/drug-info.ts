import AsyncStorage from '@react-native-async-storage/async-storage'
import { getDrugInfo as getStaticDrugInfo } from '@/data/drug-info-static'
import { analyzeHealthPattern } from '@/api/groq'

const CACHE_PREFIX = 'medication-safety:drug-info:'
const GROQ_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000

interface DrugInfoResult {
  rxnorm: string
  genericName: string
  whatItDoes: string
  commonBrands?: string[]
  warnings?: string
  bodySystems: string[]
  source: 'static' | 'groq' | 'cached'
}

async function getCached(rxnorm: string): Promise<DrugInfoResult | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${rxnorm}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.cachedAt > GROQ_CACHE_TTL_MS) return null
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

export async function fetchDrugInfo(
  rxnorm: string,
  drugName?: string
): Promise<DrugInfoResult> {
  const staticEntry = getStaticDrugInfo(rxnorm)
  if (staticEntry) {
    return { ...staticEntry, source: 'static' }
  }

  const cached = await getCached(rxnorm)
  if (cached) return cached

  const generated = await generateDrugInfo(rxnorm, drugName)
  if (generated) {
    await setCache(rxnorm, generated)
    return generated
  }

  return {
    rxnorm,
    genericName: drugName ?? `Drug ${rxnorm}`,
    whatItDoes: 'Information about this drug is not yet available.',
    warnings: 'Consult your doctor or pharmacist for more information.',
    bodySystems: [],
    source: 'static',
  }
}

async function generateDrugInfo(
  rxnorm: string,
  drugName?: string
): Promise<DrugInfoResult | null> {
  const prompt = [
    `You are a health education writer creating plain-language drug descriptions for Nigerian patients.`,
    `For the drug below, respond with valid JSON only (no markdown, no extra text):`,
    `{ "whatItDoes": "2-sentence plain English", "warnings": "1-2 safety sentences", "bodySystems": ["array of affected systems"] }`,
    ``,
    `Possible body systems: cardiovascular, gastrointestinal, hepatic, renal, CNS, metabolic, hematologic, dermatologic, endocrine`,
    ``,
    `Drug: ${drugName ?? 'unknown'} (RxNorm: ${rxnorm})`,
  ].join('\n')

  try {
    const content = await analyzeHealthPattern(
      [],
      [{ name: drugName ?? `RxNorm:${rxnorm}` }],
      prompt
    )

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