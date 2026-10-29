// Reviewed 2026-10-29. Clinical references are not universal longevity targets.
// Keep uncertain, assay-dependent and emerging tests explicitly labelled.
import { REFERENCE_RANGES } from './reference-ranges.js';

const LIVER = 'https://medlineplus.gov/lab-tests/liver-function-tests/';
const B12 = 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/';
const SG_SCREEN = 'https://www.healthhub.sg/well-being-and-lifestyle/personal-care/type-2-screening-tests';
const CLINICAL = [
  {
    id: 'insulin', label: 'Fasting insulin', unit: 'µIU/mL',
    reference: 'Example assay interval: 2.6–24.9 µIU/mL. Use your laboratory’s fasting interval.',
    note: 'Optional metabolic context, not an established population screening test or a universal “keep insulin as low as possible” target. Low insulin can also reflect insufficient production.',
    action: 'Walk for 10 minutes after meals, replace sweet drinks with water and train strength twice weekly. Do not change insulin or diabetes medicine to chase this number.',
    source: 'https://www.mayocliniclabs.com/test-notifications/attachment.php?id=14648',
  },
  {
    id: 'homair', label: 'HOMA-IR', unit: 'Derived estimate',
    reference: 'Fasting insulin (µIU/mL) × fasting glucose (mmol/L) ÷ 22.5. With glucose in mg/dL, divide by 405.',
    note: 'Use results from the same fasting sample. This is HOMA1-IR, not HOMA2; cut-offs vary by population and insulin assay. It does not diagnose insulin resistance on its own.',
    action: 'Build toward 150 minutes of moderate activity weekly and two strength sessions. If excess weight is present, reduce sugary drinks and oversized portions without crash dieting.',
    source: 'https://doi.org/10.2337/diacare.27.6.1487',
  },
  {
    id: 'tghdl', label: 'Triglyceride-to-HDL ratio', unit: 'Ratio',
    reference: 'Triglycerides ÷ HDL-C, both in the same units. No universally accepted diagnostic or longevity cut-off.',
    note: 'A ratio below 1.5 in mg/dL is a proposed optimisation target, not a universal guideline. A ratio calculated in mmol/L is numerically different. Low triglycerides or high HDL do not cancel high ApoB.',
    action: 'Replace sugary drinks, limit refined-grain snacks, avoid alcohol if triglycerides are elevated and add post-meal walks. Address LDL/ApoB independently.',
    source: 'https://pubmed.ncbi.nlm.nih.gov/22075272/',
  },
  {
    id: 'igf1', label: 'IGF-1', unit: 'ng/mL · age-/assay-specific',
    reference: 'Use the age- and sex-appropriate interval and any laboratory z-score; there is no single adult longevity range.',
    note: 'IGF-1 helps evaluate growth-hormone disorders. Associations with mortality do not establish that forcing a mid-normal result prevents cancer.',
    action: 'Avoid unprescribed growth hormone or “anti-ageing” hormone products. Keep regular meals and strength training; do not restrict protein aggressively to suppress IGF-1.',
    source: 'https://www.mayocliniclabs.com/test-catalog/overview/75932',
  },
  {
    id: 'nlr', label: 'Neutrophil-to-lymphocyte ratio (NLR)', unit: 'Ratio · CBC differential',
    reference: 'Absolute neutrophil count ÷ absolute lymphocyte count, using the same count units. One healthy-adult study found 0.78–3.53; this is not a universal clinical cut-off.',
    note: 'Infection, stress, medicines and other conditions affect NLR. Associations in people with cancer do not make NLR a cancer-screening or “immune exhaustion” test.',
    action: 'Avoid smoking, keep a consistent sleep schedule and allow recovery from illness. Follow up unexplained persistent blood-count changes rather than using immune-boosting supplements.',
    source: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5217256/',
  },
  {
    id: 'ferritin', label: 'Ferritin', unit: 'µg/L (= ng/mL)',
    reference: 'Use your age-/sex-specific laboratory interval. Both low iron stores and unexplained high ferritin need context.',
    note: 'Ferritin reflects iron storage but also rises with inflammation and liver disease. A high result alone does not prove iron overload; interpret with transferrin saturation and the clinical picture.',
    action: 'Do not add iron supplements without a demonstrated need. Avoid self-directed blood donation or phlebotomy to lower ferritin; treat a confirmed deficiency or overload using the agreed plan.',
    source: 'https://medlineplus.gov/lab-tests/ferritin-blood-test/',
  },
  {
    id: 'fibrinogen', label: 'Fibrinogen', unit: 'g/L',
    reference: 'Example laboratory interval: 2.00–3.93 g/L (200–393 mg/dL); match the assay on your report.',
    note: 'A clotting protein and acute-phase reactant, not a standalone cancer or plasma-viscosity screening test. Low and high results can both matter.',
    action: 'Stay smoke-free and build regular walking into your week. Do not start aspirin or anticoagulants to change fibrinogen; abnormal results require cause-specific assessment.',
    source: 'https://boonehealth.testcatalog.org/show/FIB',
  },
  {
    id: 'esr', label: 'Erythrocyte sedimentation rate (ESR)', unit: 'mm/hour',
    reference: 'Use the laboratory’s age-/sex- and method-specific interval; there is no universal longevity target.',
    note: 'ESR is nonspecific and can change with anaemia, pregnancy, infection or inflammatory disease. It cannot establish or exclude cancer.',
    action: 'Follow treatment for any identified condition and maintain regular activity as tolerated. Avoid self-starting steroids or anti-inflammatory medicines to suppress a result.',
    source: 'https://medlineplus.gov/lab-tests/erythrocyte-sedimentation-rate-esr/',
  },
  {
    id: 'homocysteine', label: 'Homocysteine', unit: 'µmol/L',
    reference: 'Use the laboratory’s age-/sex-specific interval. Below 9–10 µmol/L is not a proven universal prevention target.',
    note: 'B12/folate status and kidney function affect this marker. Lowering the concentration with vitamins does not automatically prevent cardiovascular events or demonstrate improved “detoxification”.',
    action: 'Include B12-containing foods or an appropriate fortified alternative, plus folate-rich vegetables and legumes. Correct a confirmed deficiency; avoid high-dose B-vitamin stacks without advice.',
    source: 'https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/',
  },
  {
    id: 'ggt', label: 'GGT', unit: 'U/L',
    reference: 'Use the sex-/assay-specific laboratory interval; no validated universal “optimal longevity” cut-off.',
    note: 'Alcohol, medicines and liver or bile-duct conditions can raise GGT. It does not directly measure glutathione depletion or an overall “toxic burden”.',
    action: 'Choose alcohol-free drinks and stop non-prescribed “detox” products. Keep prescribed medicines unchanged until reviewed; add regular activity and sustainable portion changes if overweight.',
    source: LIVER,
  },
  {
    id: 'alt', label: 'ALT', unit: 'U/L',
    reference: 'Use the laboratory interval and the degree and persistence of any elevation, not a universal low target.',
    note: 'ALT can reflect liver injury but cannot diagnose or exclude MASLD (fatty liver) by itself. Normal ALT does not rule out liver disease.',
    action: 'Replace sweet drinks, avoid alcohol when liver tests are abnormal and build toward 150 minutes of weekly activity. Avoid crash diets and high-dose supplements.',
    source: LIVER,
  },
  {
    id: 'ast', label: 'AST', unit: 'U/L',
    reference: 'Use the laboratory interval and interpret with ALT, symptoms, medicines and recent exercise.',
    note: 'AST also comes from muscle; hard exercise or injury can raise it. Neither AST alone nor the AST/ALT ratio is a general “detox” score.',
    action: 'Allow recovery after unusually hard training and avoid alcohol and unverified supplements. Do not stop prescribed medicines without review; investigate persistent or symptomatic abnormalities.',
    source: LIVER,
  },
  {
    id: 'cystatin', label: 'Cystatin C', unit: 'mg/L',
    reference: 'Use the assay interval and a validated eGFR equation; combined creatinine–cystatin C eGFR is often more accurate than either marker alone.',
    note: 'Useful when creatinine is difficult to interpret, including unusual muscle mass. Cystatin C also has non-kidney influences; it is not always a superior standalone test.',
    action: 'Keep blood-pressure and diabetes treatment consistent. Avoid routine non-prescribed ibuprofen/naproxen, “kidney detox” products and forcing extra water to improve a number.',
    source: 'https://www.niddk.nih.gov/research-funding/research-programs/kidney-clinical-research-epidemiology/laboratory/glomerular-filtration-rate-equations/adults',
  },
  {
    id: 'vitd', label: 'Vitamin D (25-OH)', unit: 'nmol/L',
    bands: [['Adequate for most', '50–125'], ['May be inadequate', '30–<50'], ['Too low', '<30']],
    alternate: { unit: 'ng/mL', values: ['20–50', '12–<20', '<12'] },
    note: 'Bone-health reference, not a cancer-prevention target. Above 125 nmol/L (50 ng/mL) can also be concerning. A universal target of 40–60 ng/mL and routine testing of healthy adults are not established recommendations.',
    action: 'Choose oily fish or fortified foods. If supplementation is indicated, use the agreed dose and avoid overlapping high-dose products; do not pursue unprotected sun exposure to chase a result.',
    source: 'https://ods.od.nih.gov/factsheets/VitaminD-Consumer/',
  },
  {
    id: 'b12', label: 'Vitamin B12', unit: 'pmol/L · pg/mL on some reports',
    reference: 'Laboratories commonly flag values below 148–185 pmol/L (200–250 pg/mL); thresholds and upper intervals vary.',
    note: 'Interpret with symptoms, blood count, diet and absorption risks. Borderline values may need MMA. A high B12 result is not proof of better cellular function.',
    action: 'Eat fish, eggs, dairy or reliably fortified foods as appropriate. If vegan or deficient, follow a suitable B12 replacement plan; neurological symptoms need prompt assessment, not just dietary changes.',
    source: B12,
  },
  {
    id: 'mma', label: 'Methylmalonic acid (MMA)', unit: 'µmol/L',
    reference: 'Use the assay interval. MMA above 0.271 µmol/L can support B12 deficiency, but is not diagnostic in isolation.',
    note: 'Kidney impairment can raise MMA. Interpret alongside B12, kidney function and symptoms rather than using it as an isolated optimisation target.',
    action: 'Use prescribed B12 replacement consistently when deficiency is confirmed. Do not take folic acid alone to mask an unexplained B12 deficiency; have persistent neurological symptoms assessed.',
    source: B12,
  },
  {
    id: 'colorectal', label: 'Colonoscopy, FIT & stool DNA-FIT', unit: 'Screening · eligibility and interval',
    reference: 'Singapore: generally from 50, FIT yearly; colonoscopy interval is risk-based (often 5–10 years). US guidance starts average-risk screening at 45.',
    note: 'A normal US screening colonoscopy is usually repeated at 10 years; stool DNA-FIT such as Cologuard is a different test, every 1–3 years under US guidance. Any positive stool screen needs colonoscopy. Symptoms or family history can require earlier assessment.',
    action: 'Check when your last screen was completed and book the eligible option. Complete the collection or bowel-preparation instructions and arrange follow-up of a positive result; do not substitute a tumour-marker blood panel.',
    source: SG_SCREEN,
    extraSource: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
  },
  {
    id: 'breast', label: 'Mammography & breast MRI', unit: 'Screening · risk-based',
    reference: 'Singapore guidance: annual mammography at 40–49 after discussing benefits/harms; every 2 years at 50–74. Subsidy eligibility is a separate rule.',
    note: 'Breast MRI is an additional option for selected high-risk people, not a routine replacement. Dense breasts alone do not automatically determine a universal annual MRI schedule. A new lump or breast change needs diagnostic assessment.',
    action: 'Check your screening due date and family history. Book the recommended mammogram; if a hereditary high-risk pathway applies, agree the MRI and mammography schedule with the breast team.',
    source: SG_SCREEN,
    extraSource: 'https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-recommendations-for-the-early-detection-of-breast-cancer.html',
  },
  {
    id: 'cervical', label: 'Pap smear & HPV testing', unit: 'Screening · Singapore pathway',
    reference: 'Sexually active women: Pap test every 3 years at 25–29; HPV test every 5 years from 30, according to eligibility and prior results.',
    note: 'Co-testing is used in some countries but is not the same as Singapore’s age-based Pap/HPV pathway. Prior abnormalities, immunosuppression or treatment change follow-up. HPV vaccination does not remove the need for screening.',
    action: 'Check your previous result and due date, then book the appropriate test. Complete follow-up for a positive HPV or abnormal Pap result rather than waiting for the next routine interval.',
    source: 'https://www.healthhub.sg/programmes/healthiersg-screening/screening-faq',
  },
  {
    id: 'psa', label: 'PSA (total / free) & prostate assessment', unit: 'Shared screening decision',
    reference: 'No universal PSA “good” cut-off. AUA allows a baseline discussion at 45–50 (earlier for increased risk); USPSTF recommends individual decisions at 55–69.',
    note: 'PSA can rise without cancer. AUA suggests individualised 2–4-year screening at 50–69. A new elevation is usually confirmed before deciding on free PSA, MRI or biopsy. A digital rectal exam is not a mandatory universal paired screening test.',
    action: 'Discuss the possible benefits, false positives and overdiagnosis before testing. If elevated, complete the agreed repeat and risk-assessment pathway; do not order MRI or biopsy solely from a self-selected threshold.',
    source: 'https://auanews.net/issues/articles/2023/september-2023/prostate-cancer-early-detection-of-prostate-cancer-highlights-from-2023-aua/society-of-urologic-oncology-guidelines',
    extraSource: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/prostate-cancer-screening',
  },
  {
    id: 'ldct', label: 'Low-dose CT (LDCT) for lung cancer', unit: 'Selected high-risk screening',
    reference: 'US USPSTF example: annual LDCT at 50–80 with ≥20 pack-years, currently smoking or quit within 15 years. Local eligibility can differ.',
    note: 'Pack-years = packs/day × years smoked. Screening requires shared decision-making and fitness for further treatment; it is not routine for all nonsmokers. Symptoms need a diagnostic pathway instead.',
    action: 'Record your smoking exposure and quit date, and review eligibility with a clinician. Use a smoking-cessation programme and complete any nodule follow-up through the screening service.',
    source: 'https://www.uspreventiveservicestaskforce.org/uspstf/document/RecommendationStatementFinal/lung-cancer-screening',
  },
  {
    id: 'mced', label: 'Multi-cancer early detection (MCED)', unit: 'Emerging · not a replacement screen',
    reference: 'No established routine testing frequency or proven population mortality benefit for generally healthy adults.',
    note: 'Tests such as Galleri assess cancer-associated signals, sometimes cfDNA methylation. False positives, missed early cancers and uncertain follow-up are possible. Claims to detect many cancers do not demonstrate that screening saves lives.',
    action: 'Complete established age-/risk-appropriate screening first. Before paying for MCED, agree who will investigate a positive result, likely costs and possible harms. Do not treat a negative result as a cancer all-clear.',
    source: 'https://prevention.cancer.gov/research-areas/networks-consortia-programs/csrn/q-a-about-mcd-tests',
  },
  {
    id: 'wholebodymri', label: 'Full-body preventive MRI', unit: 'Not routine for average-risk adults',
    reference: 'No evidence-based routine interval for asymptomatic average-risk adults; dedicated surveillance may be appropriate for specific inherited syndromes.',
    note: 'Services such as Prenuvo or Ezra avoid ionising radiation but can generate incidental findings, unnecessary procedures and false reassurance. MRI does not replace cervical, colorectal, breast or indicated lung screening.',
    action: 'Prioritise established screening. Use targeted imaging for a clinical question or a specialist-defined hereditary-risk surveillance plan, rather than repeating whole-body scans on a commercial schedule.',
    source: 'https://www.acr.org/News-and-Publications/Media-Center/2023/ACR-Statement-on-Screening-Total-Body-MRI',
  },
  {
    id: 'vo2', label: 'Cardiorespiratory fitness (VO₂ max)', unit: 'mL/kg/min · age-/sex-/method-specific',
    reference: 'Compare with an appropriate age-/sex-specific percentile and your own trend; there is no single “elite” longevity threshold for everyone.',
    note: 'Lab cardiopulmonary exercise testing and wearable estimates are not interchangeable. Observational fitness–mortality associations are not a guaranteed five-fold risk reduction from reaching a percentile.',
    action: 'Build toward 150–300 minutes of moderate aerobic activity weekly and two strength sessions. Increase gradually from your baseline; add vigorous intervals only when appropriate for your health and fitness.',
    source: 'https://www.nhlbi.nih.gov/health/heart-healthy-living/physical-activity',
  },
  {
    id: 'dexa', label: 'DEXA / DXA body composition & VAT', unit: 'Device-/method-specific body composition',
    reference: 'Interpret visceral adipose tissue (VAT), lean mass and fat mass using the device’s reference and repeat-test precision; no universal VAT longevity target.',
    note: 'Body-composition assessment is different from osteoporosis bone-density screening. Comparisons across machines can mislead, and routine serial DXA for every healthy adult is not established. Avoid DXA in pregnancy.',
    action: 'Train strength twice weekly, walk regularly and keep adequate protein from normal meals. If excess fat is present, make sustainable portion changes while preserving muscle; do not chase a scan number with crash dieting.',
    source: 'https://iscd.org/official-positions-2023/',
  },
  {
    id: 'cac', label: 'Coronary artery calcium (CAC)', unit: 'Agatston score',
    bands: [['No calcified plaque', '0'], ['Plaque present', '1–99'], ['Higher burden', '≥100']],
    note: 'A risk-refinement CT for selected people when prevention decisions are uncertain, not annual general screening. CAC=0 does not exclude non-calcified plaque or erase smoking, diabetes, familial or lifetime ApoB risk.',
    action: 'Use the result to agree an LDL/ApoB and blood-pressure plan and take prescribed treatment consistently. Do not stop lipid medicines because CAC is zero or start aspirin without a bleeding-risk discussion.',
    source: 'https://www.acc.org/about-acc/press-releases/2026/03/13/18/01/accaha-issue-updated-guideline-for-managing-lipids-cholesterol',
    extraSource: 'https://www.acc.org/latest-in-cardiology/ten-points-to-remember/2020/12/21/21/46/nla-scientific-statement-on-cac-scoring-for-ascvd-prevention',
  },
];

export const HEALTH_REFERENCES = [...REFERENCE_RANGES, ...CLINICAL].map(reference => ({
  ...reference,
  note: reference.note + (reference.id === 'hba1c' ? ' A target of 4.8–5.3% is not an established universal longevity recommendation.' : reference.id === 'hscrp' ? ' Targets below 0.8 or 0.5 mg/L are not universal treatment goals.' : ''),
}));

export const HEALTH_REFERENCE_GROUPS = [
  {
    id: 'metabolic', title: 'Metabolic health & insulin regulation', short: 'Metabolic',
    description: 'Assess glucose regulation and metabolic risk together. These markers support clinical assessment; they are not cancer-screening tests.',
    ids: ['glucose', 'insulin', 'homair', 'hba1c', 'tghdl', 'igf1'],
    plan: ['Walk for 10 minutes after one or more main meals; work toward 150 minutes of moderate activity a week.', 'Replace sweet drinks with water and use a quarter-plate portion of wholegrains alongside vegetables and protein.', 'Train strength twice weekly. If taking glucose-lowering medicines, follow your agreed meal/exercise plan to avoid hypoglycaemia.'],
  },
  {
    id: 'inflammation', title: 'Chronic inflammation & immune balance', short: 'Inflammation',
    description: 'Interpret trends when clinically well. These nonspecific markers do not measure cancer surveillance or establish that cancer is present.',
    ids: ['hscrp', 'nlr', 'ferritin', 'fibrinogen', 'esr'],
    plan: ['Build regular activity gradually and allow recovery from illness rather than training hard through it.', 'Include vegetables, whole fruit, wholegrains and legumes; increase fibre gradually toward 25–30 g/day.', 'Stay smoke-free and keep 7–9 hours available for sleep. Do not take iron or anti-inflammatory drugs merely to change a biomarker.'],
  },
  {
    id: 'cardiovascular', title: 'Cardiovascular & endothelial health', short: 'Cardiovascular',
    description: 'Control modifiable cardiovascular risk. A favourable ratio or calcium score does not cancel elevated atherogenic particles.',
    ids: ['apob', 'lpa', 'homocysteine', 'ldl', 'tg', 'nonhdl', 'bp'],
    plan: ['Swap butter/ghee and fatty processed meats for unsaturated oils, beans, tofu or fish.', 'Build toward 25–30 g fibre/day and regular walking; aim for 150 minutes of weekly activity and two strength sessions.', 'Keep sodium below 2,000 mg/day unless your care team sets another plan, stay smoke-free and take indicated medicines consistently.'],
  },
  {
    id: 'organ', title: 'Organ function: liver & kidneys', short: 'Liver & kidneys',
    description: 'Assess liver and kidney function using laboratory intervals, the pattern of results and changes over time.',
    ids: ['ggt', 'alt', 'ast', 'cystatin', 'egfr', 'uacr'],
    plan: ['Choose alcohol-free drinks and avoid unverified “liver/kidney detox” supplements.', 'Reduce high-sodium sauces and broth; follow your kidney team’s protein, fluid or exercise limits if applicable.', 'Take prescribed blood-pressure/diabetes medicines consistently. Avoid routine non-prescribed NSAIDs and do not force water or change doses to chase results.'],
  },
  {
    id: 'micronutrients', title: 'Cellular integrity & micronutrients', short: 'Micronutrients',
    description: 'Correct established deficiencies and their cause; more is not always better, and associations do not prove a cancer-prevention target.',
    ids: ['vitd', 'b12', 'mma'],
    plan: ['Include appropriate B12 and vitamin-D food sources or reliable fortified alternatives.', 'Use a prescribed replacement dose when a deficiency or other indication is established; avoid stacked megadose products.', 'Combine adequate nutrition with strength and weight-bearing activity. Have neurological symptoms assessed promptly.'],
  },
  {
    id: 'cancer', title: 'Cancer-specific screening & advanced diagnostics', short: 'Cancer screening',
    description: 'CEA, CA 19-9 and CA-125 are not general screening tests for asymptomatic average-risk adults. Prioritise established age-/risk-appropriate screening; new symptoms need diagnostic assessment, not a screening package.',
    source: 'https://www.cancer.gov/about-cancer/diagnosis-staging/diagnosis/tumor-markers-fact-sheet',
    ids: ['colorectal', 'breast', 'cervical', 'psa', 'ldct', 'mced', 'wholebodymri'],
    plan: ['List your last completed screening dates, prior abnormal results and relevant family history.', 'Book the screening you are due for under your local guideline; discuss an earlier or specialist pathway for inherited/family risk.', 'Complete follow-up after an abnormal screen. Do not replace proven screening with tumour markers, MCED or a whole-body MRI.'],
  },
  {
    id: 'functional', title: 'Functional & physiological biomarkers', short: 'Fitness & body',
    description: 'Physical capacity, body composition and selected plaque assessment complement blood tests. Compare like-for-like methods and avoid guaranteed mortality-reduction claims.',
    ids: ['vo2', 'dexa', 'cac', 'bmi', 'waist'],
    plan: ['Build aerobic volume gradually toward 150–300 minutes/week at a moderate intensity suited to your health.', 'Train major muscle groups twice weekly; track improvements in real-world walking, stairs and lifting as well as any test result.', 'Use sustainable meals to reduce excess fat when appropriate, not crash dieting. Reserve CAC/DXA for a decision they can actually inform.'],
  },
];

export const TESTING_SCHEDULE = [
  ['Routine review', 'Review blood pressure, BMI/waist, habits, family history and screening due dates regularly. In Singapore, core glucose/lipid screening is commonly offered from 40 about every 3 years—not automatically every year for all healthy adults.'],
  ['Additional blood/urine tests: indication-led', 'Discuss CBC with differential; CMP (ALT, AST, creatinine/eGFR and electrolytes); lipid panel + ApoB; fasting insulin/HbA1c; hs-CRP; GGT; 25-OH vitamin D; ferritin; homocysteine; and uACR when results would change care. This is a discussion list, not a blanket annual panel. Monitoring frequency depends on disease, medicines and prior results.'],
  ['Usually once in adulthood / inherited risk', 'Lp(a) is generally checked once, with repeats in selected clinical circumstances. BRCA1/2, Lynch syndrome and other germline tests should follow personal/family-risk assessment and genetic counselling—not universal “baseline genetic screening”. APOE is not a routine general longevity or cancer-screening test.'],
  ['Cancer screening', 'Use the eligibility and intervals in the cancer group, adjusted for local guidance, prior results and personal/family history. Do not wait for a routine screen if symptoms develop.'],
];
