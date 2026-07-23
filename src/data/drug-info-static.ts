export interface DrugInfo {
  rxnorm: string
  genericName: string
  whatItDoes: string
  commonBrands?: string[]
  warnings?: string
  bodySystems: string[]
}

const staticMap: Record<string, DrugInfo> = {
  '161': {
    rxnorm: '161',
    genericName: 'Paracetamol (Acetaminophen)',
    whatItDoes: 'Lowers fever by acting on the brain\'s temperature centre and relieves mild to moderate pain. It is gentle on the stomach compared to other painkillers.',
    commonBrands: ['Panadol', 'Emzor Paracetamol', 'Paracare'],
    warnings: 'Do not take more than 4g (8 tablets of 500mg) in 24 hours. Overdose can damage the liver. Avoid alcohol while taking this drug.',
    bodySystems: ['hepatic'],
  },
  '1191': {
    rxnorm: '1191',
    genericName: 'Aspirin',
    whatItDoes: 'Reduces pain, fever, and inflammation. In low doses, it thins the blood to prevent heart attacks and strokes.',
    commonBrands: ['Aspirin GP', 'Bayer Aspirin', 'Disprin'],
    warnings: 'Do not give to children under 12 due to Reye\'s syndrome risk. Can irritate the stomach lining and increase bleeding risk. Avoid if you have a stomach ulcer.',
    bodySystems: ['cardiovascular', 'gastrointestinal', 'hematologic'],
  },
  '3821': {
    rxnorm: '3821',
    genericName: 'Diazepam',
    whatItDoes: 'Calms the brain and nerves, used for anxiety, muscle spasms, and seizures. Also used to help people relax before medical procedures.',
    commonBrands: ['Valium', 'Diaz'],
    warnings: 'Can be habit-forming — only use as prescribed. Causes drowsiness — do not drive. Avoid alcohol. Not safe in pregnancy or breastfeeding.',
    bodySystems: ['CNS'],
  },
  '282448': {
    rxnorm: '282448',
    genericName: 'Artemether / Lumefantrine',
    whatItDoes: 'The first-choice treatment for uncomplicated malaria in Nigeria. It kills the malaria parasite in the blood using two different drugs working together.',
    commonBrands: ['Coartem', 'Lonart', 'Maloxine'],
    warnings: 'Take with fatty food to help absorption. Complete the full 3-day course even if you feel better. Common side effects include nausea, headache, and dizziness.',
    bodySystems: ['gastrointestinal', 'hepatic'],
  },
  '6809': {
    rxnorm: '6809',
    genericName: 'Metformin',
    whatItDoes: 'Lowers blood sugar by helping the body use insulin better and reducing sugar production in the liver. The first-choice drug for type 2 diabetes.',
    commonBrands: ['Glucophage', 'Metforal'],
    warnings: 'Can cause nausea and diarrhoea when starting — start with a low dose and take with food. Rarely can cause lactic acidosis. Stop temporarily if having surgery or contrast scans.',
    bodySystems: ['metabolic', 'renal'],
  },
}

export function getDrugInfo(rxnormCode: string): DrugInfo | undefined {
  return staticMap[rxnormCode]
}

export function getAllStaticDrugInfo(): Record<string, DrugInfo> {
  return staticMap
}