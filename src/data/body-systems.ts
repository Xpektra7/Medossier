interface BodySystemMatch {
  keywords: string[]
  system: string
}

const matches: BodySystemMatch[] = [
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

export function getBodySystems(clinicalEffect: string, drugNames?: string[]): string[] {
  const text = clinicalEffect.toLowerCase()
  const systems = new Set<string>()

  for (const match of matches) {
    for (const kw of match.keywords) {
      if (text.includes(kw.toLowerCase())) {
        systems.add(match.system)
        break
      }
    }
  }

  if (drugNames) {
    for (const name of drugNames) {
      const n = name.toLowerCase()
      if (n.includes('insulin') || n.includes('metformin') || n.includes('glibenclamide') || n.includes('glyburide')) systems.add('metabolic')
      if (n.includes('warfarin') || n.includes('aspirin') || n.includes('clopidogrel')) systems.add('hematologic')
      if (n.includes('amiodarone') || n.includes('digoxin')) systems.add('cardiovascular')
      if (n.includes('nsaid') || n.includes('ibuprofen') || n.includes('diclofenac') || n.includes('naproxen')) {
        systems.add('gastrointestinal')
        systems.add('renal')
      }
    }
  }

  return Array.from(systems)
}