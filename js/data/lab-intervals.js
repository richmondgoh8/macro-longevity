// Demand-loaded adult examples transcribed from the linked performing laboratories.
// Sex labels follow the laboratories' tables. Not paediatric or pregnancy intervals.
const KKH = 'https://www.kkh.com.sg/our-specialties/elab-book/';
const CBC = 'https://nuhsingapore.testcatalog.org/show/FBC';
const RENAL = 'https://www.nhghealth.com.sg/wh/our-partners/laboratory-services/test-catalogue/renal-panel';
const entry = (lab, population, unit, values, source) => ({ lab, population, unit, values, source, reviewed: '2026-11-02' });
const cbc = (unit, values) => entry('NUH', 'adult', unit, values, CBC);
const kkh = (unit, values, slug, population = 'age ≥19 years') => entry('KKH', population, unit, values, KKH + slug);
export const LAB_INTERVALS = {
  wbc: cbc('×10⁹/L', '4.30–10.40'),
  rbc: cbc('×10¹²/L', 'Male: 4.50–5.75; female: 4.03–5.19'),
  hemoglobin: cbc('g/dL', 'Male: 13.1–16.8; female: 11.5–14.9'),
  hematocrit: cbc('%', 'Male: 40.3–50.0; female: 35.8–45.2'),
  mcv: cbc('fL', '80.6–96.1'),
  meancorpuscularhemoglobin: cbc('pg', '26.1–32.1'),
  meancorpuscularhemoglobinconcentration: cbc('g/dL', '30.8–34.9'),
  platelets: cbc('×10⁹/L', '150–410'),
  rdw: cbc('%', '11.5–14.5'),
  meanplateletvolume: cbc('fL', '8.7–12.1'),
  absoluteneutrophils: cbc('×10⁹/L', '1.90–6.53'),
  absolutelymphocytes: cbc('×10⁹/L', '1.21–3.56'),
  absolutemonocytes: cbc('×10⁹/L', '0.23–0.82'),
  absoluteeosinophils: cbc('×10⁹/L', '0.05–0.50'),
  absolutebasophils: cbc('×10⁹/L', 'Male: 0.02–0.09; female: 0.00–0.09'),
  sodium: entry('NHG Woodlands', 'adult', 'mmol/L', '135–145', RENAL),
  potassium: entry('NHG Woodlands', 'adult', 'mmol/L', '3.5–4.5', RENAL),
  creatinine: entry('NHG Woodlands', 'adult', 'µmol/L', 'Male: 60–105; female: 40–75', RENAL),
  chloride: kkh('mmol/L', '98–107', 'chloride', 'adult example; published for age >1 month'),
  bicarbonate: kkh('mmol/L', '22–29', 'bicarbonate-hco3', 'age ≥21 years; serum total CO₂, not blood-gas bicarbonate'),
  calcium: kkh('mmol/L', '2.10–2.55', 'calcium-total', 'age ≥19 years; total serum calcium, not ionised calcium'),
  albumin: kkh('g/L', '35–50', 'albumin'),
  protein: kkh('g/L', '60–80', 'protein-total'),
  bilirubin: kkh('µmol/L', '5–21', 'bilirubin-total', 'adult example; published for age ≥30 days; total bilirubin'),
  magnesium: kkh('mmol/L', '0.66–1.07', 'magnesium'),
  iron: kkh('µmol/L', 'Male: 11.6–31.3; female: 9.0–30.4', 'iron-serum'),
  tsh: kkh('mIU/L', '0.45–4.50', 'thyroid-stimulating-hormone-tsh', 'adult, non-pregnant; pregnancy requires separate intervals'),
  ft4: entry('SGH', 'adult example; published for age ≥13 years; immunoassay', 'pmol/L', '8.8–14.4', 'https://www.sgh.com.sg/our-specialties/pathology/pathology-lab-services/thyroxine-t4-free-serum'),
  thyroidperoxidaseantibodies: kkh('U/mL', '0–60', 'thyroid-peroxidase-antibodies-tpoab', 'laboratory assay interval; performed at SGH; not interchangeable with other antibody assays'),
  urate: kkh('µmol/L', 'Male: 150–550; female: 140–450', 'uric-acid'),
  amylase: kkh('U/L', '28–100', 'amylase'),
  phosphate: kkh('mmol/L', '0.7–1.5', 'phosphate'),
};
