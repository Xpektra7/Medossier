const keywordMatches: Array<{ keywords: string[]; system: string }> = [
  { keywords: ['bp', 'blood pressure', 'qt', 'arrhythmia', 'heart', 'cardiac', 'palpitation', 'tachycardia', 'bradycardia', 'ecg'], system: 'cardiovascular' },
  { keywords: ['ulcer', 'bleeding', 'nausea', 'vomiting', 'diarrhoea', 'diarrhea', 'gastric', 'stomach', 'gi bleed', 'gastrointestinal', 'heartburn'], system: 'gastrointestinal' },
  { keywords: ['liver', 'hepatic', 'hepatitis', 'jaundice', 'transaminase', 'hepatotoxic', 'cirrhosis'], system: 'hepatic' },
  { keywords: ['kidney', 'renal', 'nephro', 'creatinine', 'dialysis', 'urine', 'nephritis'], system: 'renal' },
  { keywords: ['sedation', 'drowsiness', 'dizziness', 'seizure', 'serotonin', 'headache', 'confusion', 'cns', 'tremor', 'ataxia'], system: 'CNS' },
  { keywords: ['hypoglycemia', 'hypoglycaemia', 'hyperglycemia', 'hyperglycaemia', 'glucose', 'diabetic', 'electrolyte', 'sugar', 'insulin'], system: 'metabolic' },
  { keywords: ['blood', 'bleeding', 'coagulation', 'platelet', 'wbc', 'neutropenia', 'anaemia', 'anemia', 'marrow'], system: 'hematologic' },
  { keywords: ['rash', 'photosensitivity', 'itching', 'pruritus', 'urticaria', 'dermatitis', 'skin', 'hives', 'swelling'], system: 'dermatologic' },
  { keywords: ['thyroid', 'adrenal', 'cortisol', 'endocrine', 'hormone', 'estrogen', 'testosterone'], system: 'endocrine' },
]

const drugSystemHints: Record<string, string[]> = {
  warfarin: ['hematologic'],
  aspirin: ['hematologic'],
  clopidogrel: ['hematologic'],
  insulin: ['metabolic'],
  metformin: ['metabolic'],
  glibenclamide: ['metabolic'],
  glyburide: ['metabolic'],
  amiodarone: ['cardiovascular'],
  digoxin: ['cardiovascular'],
  ibuprofen: ['gastrointestinal', 'renal'],
  diclofenac: ['gastrointestinal', 'renal'],
  naproxen: ['gastrointestinal', 'renal'],
}

export function getBodySystems(clinicalEffect: string, drugNames?: string[]): string[] {
  const text = clinicalEffect.toLowerCase()
  const systems = new Set<string>()

  for (const { keywords, system } of keywordMatches) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        systems.add(system)
        break
      }
    }
  }

  if (drugNames) {
    for (const name of drugNames) {
      const hints = drugSystemHints[name.toLowerCase()]
      if (hints) hints.forEach((s) => systems.add(s))
    }
  }

  return Array.from(systems)
}

/**
 * Classifies body systems using Groq LLM for more accurate parsing.
 * Falls back to keyword matching if LLM unavailable.
 */
export async function classifyBodySystemsWithAI(
  clinicalEffect: string,
  drugNames?: string[]
): Promise<string[]> {
  const fallback = getBodySystems(clinicalEffect, drugNames)

  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY
  if (!apiKey) return fallback

  const prompt = [
    `From the drug interaction description below, identify which body systems are affected.`,
    `Respond with only a JSON array of strings from this list:`,
    `cardiovascular, gastrointestinal, hepatic, renal, CNS, metabolic, hematologic, dermatologic, endocrine`,
    `If unsure, match what fits best. Return [] if none match.`,
    ``,
    `Description: ${clinicalEffect}`,
  ].join('\n')

  const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You classify medical text into body systems. Reply with JSON arrays only.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
    })

    if (!res.ok) return fallback

    const json = await res.json()
    const content = json.choices?.[0]?.message?.content
    if (!content) return fallback

    const parsed = JSON.parse(content)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed

    return fallback
  } catch {
    return fallback
  }
}