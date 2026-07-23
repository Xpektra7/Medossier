export interface SynonymEntry {
  name: string
  rxnorm: string
}

const synonyms: Record<string, SynonymEntry> = {
  // Pain & fever
  paracetamol: { name: 'Paracetamol', rxnorm: '161' },
  panadol: { name: 'Paracetamol', rxnorm: '161' },
  'emzor paracetamol': { name: 'Paracetamol', rxnorm: '161' },
  acetaminophen: { name: 'Paracetamol', rxnorm: '161' },
  aspirin: { name: 'Aspirin', rxnorm: '1191' },
  'aspirin gp': { name: 'Aspirin', rxnorm: '1191' },
  gp: { name: 'Aspirin', rxnorm: '1191' },
  ibuprofen: { name: 'Ibuprofen', rxnorm: '5640' },
  brufen: { name: 'Ibuprofen', rxnorm: '5640' },
  diclofenac: { name: 'Diclofenac', rxnorm: '3033' },
  voltaren: { name: 'Diclofenac', rxnorm: '3033' },
  naproxen: { name: 'Naproxen', rxnorm: '4036' },
  tramadol: { name: 'Tramadol', rxnorm: '8357' },
  tramol: { name: 'Tramadol', rxnorm: '8357' },

  // Malaria
  coartem: { name: 'Artemether / Lumefantrine', rxnorm: '282448' },
  maloxine: { name: 'Artemether / Lumefantrine', rxnorm: '282448' },
  lonart: { name: 'Artemether / Lumefantrine', rxnorm: '282448' },
  artemether: { name: 'Artemether', rxnorm: '190102' },
  lumefantrine: { name: 'Lumefantrine', rxnorm: '190521' },
  artesunate: { name: 'Artesunate', rxnorm: '1790358' },
  amodiaquine: { name: 'Amodiaquine', rxnorm: '1368' },
  fansidar: { name: 'Sulfadoxine / Pyrimethamine', rxnorm: '6498' },
  chloroquine: { name: 'Chloroquine', rxnorm: '2393' },
  quinine: { name: 'Quinine', rxnorm: '6754' },

  // Antibiotics
  amoxicillin: { name: 'Amoxicillin', rxnorm: '723' },
  amoxyl: { name: 'Amoxicillin', rxnorm: '723' },
  augmentin: { name: 'Amoxicillin / Clavulanate', rxnorm: '3081' },
  'co-amoxiclav': { name: 'Amoxicillin / Clavulanate', rxnorm: '3081' },
  metronidazole: { name: 'Metronidazole', rxnorm: '6960' },
  flagyl: { name: 'Metronidazole', rxnorm: '6960' },
  ciprofloxacin: { name: 'Ciprofloxacin', rxnorm: '2551' },
  ciprotab: { name: 'Ciprofloxacin', rxnorm: '2551' },
  azithromycin: { name: 'Azithromycin', rxnorm: '447' },
  zithromax: { name: 'Azithromycin', rxnorm: '447' },
  doxycycline: { name: 'Doxycycline', rxnorm: '3640' },
  septrin: { name: 'Cotrimoxazole', rxnorm: '6856' },
  cotrimoxazole: { name: 'Cotrimoxazole', rxnorm: '6856' },
  'sulfamethoxazole/trimethoprim': { name: 'Cotrimoxazole', rxnorm: '6856' },
  erythromycin: { name: 'Erythromycin', rxnorm: '3867' },
  cefixime: { name: 'Cefixime', rxnorm: '2350' },
  ceftriaxone: { name: 'Ceftriaxone', rxnorm: '2381' },

  // Hypertension / Cardiovascular
  amlodipine: { name: 'Amlodipine', rxnorm: '692' },
  norvasc: { name: 'Amlodipine', rxnorm: '692' },
  lisinopril: { name: 'Lisinopril', rxnorm: '782' },
  enalapril: { name: 'Enalapril', rxnorm: '864' },
  atenolol: { name: 'Atenolol', rxnorm: '1207' },
  metoprolol: { name: 'Metoprolol', rxnorm: '687' },
  losartan: { name: 'Losartan', rxnorm: '3840' },
  nifedipine: { name: 'Nifedipine', rxnorm: '3162' },
  hydrochlorothiazide: { name: 'Hydrochlorothiazide', rxnorm: '5482' },
  spironolactone: { name: 'Spironolactone', rxnorm: '6750' },

  // Diabetes
  metformin: { name: 'Metformin', rxnorm: '6809' },
  glibenclamide: { name: 'Glibenclamide', rxnorm: '4240' },
  glyburide: { name: 'Glibenclamide', rxnorm: '4240' },
  insulin: { name: 'Insulin', rxnorm: '6890' },

  // Respiratory
  salbutamol: { name: 'Salbutamol', rxnorm: '7480' },
  ventolin: { name: 'Salbutamol', rxnorm: '7480' },
  beclometasone: { name: 'Beclometasone', rxnorm: '1443' },

  // Allergy / Antihistamines
  piriton: { name: 'Chlorpheniramine', rxnorm: '2462' },
  chlorpheniramine: { name: 'Chlorpheniramine', rxnorm: '2462' },
  cetirizine: { name: 'Cetirizine', rxnorm: '2061' },
  loratadine: { name: 'Loratadine', rxnorm: '3720' },

  // GI
  omeprazole: { name: 'Omeprazole', rxnorm: '7643' },

  // Supplements
  'vitamin c': { name: 'Ascorbic Acid', rxnorm: '1095' },
  ascorbic: { name: 'Ascorbic Acid', rxnorm: '1095' },
  'ferrous sulfate': { name: 'Ferrous Sulfate', rxnorm: '3990' },
  'folic acid': { name: 'Folic Acid', rxnorm: '4090' },
  multivitamin: { name: 'Multivitamin', rxnorm: '21015' },
}

export function lookupSynonym(term: string): SynonymEntry | null {
  const normalized = term.toLowerCase().trim()
  return synonyms[normalized] ?? null
}

export function getAllSynonyms(): Record<string, SynonymEntry> {
  return synonyms
}