export interface SynonymEntry {
  name: string
  rxnorm: string
}

const localFallback: Record<string, SynonymEntry> = {
  // Nigerian-specific brand names HOLON won't resolve via search
  'emzor paracetamol': { name: 'Paracetamol', rxnorm: '161' },
  panadol: { name: 'Paracetamol', rxnorm: '161' },
  'aspirin gp': { name: 'Aspirin', rxnorm: '1191' },
  'gp': { name: 'Aspirin', rxnorm: '1191' },
  coartem: { name: 'Artemether / Lumefantrine', rxnorm: '282448' },
  maloxine: { name: 'Artemether / Lumefantrine', rxnorm: '282448' },
  lonart: { name: 'Artemether / Lumefantrine', rxnorm: '282448' },
  fansidar: { name: 'Sulfadoxine / Pyrimethamine', rxnorm: '6498' },
  amoxyl: { name: 'Amoxicillin', rxnorm: '723' },
  ciprotab: { name: 'Ciprofloxacin', rxnorm: '2551' },
  brufen: { name: 'Ibuprofen', rxnorm: '5640' },
  voltaren: { name: 'Diclofenac', rxnorm: '3033' },
  tramol: { name: 'Tramadol', rxnorm: '8357' },
  piriton: { name: 'Chlorpheniramine', rxnorm: '2462' },
  norvasc: { name: 'Amlodipine', rxnorm: '692' },
  ventolin: { name: 'Salbutamol', rxnorm: '7480' },
  flagyl: { name: 'Metronidazole', rxnorm: '6960' },
  septrin: { name: 'Cotrimoxazole', rxnorm: '6856' },
  zithromax: { name: 'Azithromycin', rxnorm: '447' },
}

export function lookupSynonym(term: string): SynonymEntry | null {
  const normalized = term.toLowerCase().trim()
  return localFallback[normalized] ?? null
}

export function getAllSynonyms(): Record<string, SynonymEntry> {
  return localFallback
}