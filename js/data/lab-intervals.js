// Demand-loaded adult examples transcribed from the linked performing laboratories.
// Sex labels follow the laboratories' tables. Not paediatric or pregnancy intervals.
const KKH = 'https://www.kkh.com.sg/our-specialties/elab-book/';
const CBC = 'https://nuhsingapore.testcatalog.org/show/FBC';
const RENAL = 'https://www.nhghealth.com.sg/wh/our-partners/laboratory-services/test-catalogue/renal-panel';
const entry = (lab, population, unit, values, source) => ({ lab, population, unit, values, source, reviewed: '2026-11-02' });
const cbc = (unit, values) => entry('NUH', 'adult', unit, values, CBC);
const kkh = (unit, values, slug, population = 'age ≥19 years') => entry('KKH', population, unit, values, KKH + slug);
const reviewedNow = (lab, population, unit, values, source) => ({ ...entry(lab, population, unit, values, source), reviewed: '2026-11-03' });
const hormone = (unit, values, slug, population) => reviewedNow('KKH', population, unit, values, KKH + slug);
const sgh = (unit, values, slug, population) => reviewedNow('SGH', population, unit, values, 'https://www.sgh.com.sg/our-specialties/pathology/pathology-lab-services/' + slug);
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
  cortisol: hormone('nmol/L', '102–535', 'cortisol', 'adult; serum collected at 8 am after rest; not an afternoon, saliva or urine interval'),
  prolactin: hormone('µg/L', 'Male: 3.8–24.8; non-pregnant female: 7.0–32.9', 'prolactin', 'adult; pregnancy and lactation require separate interpretation'),
  testosteronetotal: hormone('nmol/L', 'Male 21–49: 8.3–30.2; male ≥50: 7.7–24.8; female 21–49: 0.5–1.9; female ≥50: 0.4–1.2', 'testosterone', 'ages in years; total testosterone, not free testosterone; no interval supplied here for age ≤20'),
  testosteronefree: hormone('nmol/L', 'Male: 0.180–0.994; female: 0.003–0.058', 'free-testosterone-calc-testosterone-shbg-albumin-fai', 'age ≥19 years; calculated using the Vermeulen equation from testosterone, SHBG and albumin; not a direct free-testosterone assay'),
  folliclestimulatinghormone: hormone('IU/L', 'Male: 1.0–12.0; pre-menopausal female: 1.4–16.7; post-menopausal female: 26.7–133.4', 'follicle-stimulating-hormone-fsh', 'adult; broad catalogue intervals, not menstrual-phase-specific targets'),
  luteinizinghormone: hormone('IU/L', 'Male: 0.6–12.1; pre-menopausal female: 0.6–89.1; post-menopausal female: 5.2–62.0', 'luteinising-hormone-lh', 'adult; broad catalogue intervals; menstrual phase and ovulation affect interpretation'),
  sexhormonebindingglobulin: hormone('nmol/L', 'Male: 11.2–78.1; female: 11.7–137.2', 'sex-hormone-binding-globulin-shbg', 'age ≥19 years; Abbott assay reference interval'),
  estradiol: hormone('pmol/L', 'Adult male: ≤161; pre-menopausal female: ≤2382', 'estradiol-e2', 'published upper reference limits, not two-sided intervals; no post-menopausal interval supplied here; menstrual phase matters'),
  antimullerianhormoneamh: hormone('ng/mL', 'Male 18–100: 0.77–14.50; female 20–24: 1.22–11.70; 25–29: 0.89–9.85; 30–34: 0.58–8.13; 35–39: 0.15–7.49; 40–44: 0.03–5.47; 45–50: 0.01–2.71', 'anti-mullerian-hormone-amh', 'ages in years; laboratory manufacturer-derived intervals; not fertility targets or a guarantee of fertility'),
  ft3: sgh('pmol/L', '3.2–5.3', 'triiodothyronine-t3-free-serum', 'adult example; published for age ≥13 years; serum immunoassay'),
  alp: sgh('U/L', '39–99', 'alkaline-phosphatase-serum', 'age ≥18 years; serum; growing children require different intervals'),
  lipase: sgh('U/L', '8–55', 'lipase-serum', 'adult example; published for age ≥13 years; serum enzymatic assay'),
  zinc: sgh('µg/L', '724–1244', 'zinc-serum', 'age ≥20 years; serum ICP-MS; fasting recommended; trace-metal-free collection'),
  tibc: sgh('µmol/L', 'Male: 44–73; female: 39–60', 'iron-binding-capacity-total-tibc-serum', 'adult example; published for age ≥13 years; total iron-binding capacity, not transferrin protein concentration'),
  tsat: sgh('%', 'Male: 16–55; female: 12–50', 'transferrin-saturation-calculated-serum', 'adult example; published for age ≥13 years; calculated from serum iron and transferrin'),
  bun: reviewedNow('Mayo Clinic Laboratories', 'age ≥18 years; serum blood urea nitrogen, not urea concentration', 'mg/dL', 'Male: 8–24; female: 6–21', 'https://renal.testcatalog.org/show/BUN'),
  specificgravityurine: reviewedNow('University of Iowa', 'urine; reflectance spectrophotometry; concentration varies with hydration', 'relative density', '1.001–1.029', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2590.html'),
  phurine: reviewedNow('University of Iowa', 'urine; reflectance spectrophotometry; not blood pH or a diet target', 'pH', '5.0–9.0', 'https://www.healthcare.uiowa.edu/path_handbook/handbook/test2590.html'),
  vitc: reviewedNow('Alfred Health', 'blood vitamin C; HPLC; Chromsystems kit interval; protect collection from light and send promptly', 'µmol/L', '23–85', 'https://pathology.alfred.org.au/handbook/index?testid=190'),
};
