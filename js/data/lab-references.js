// Demand-loaded published-panel guidance. Reviewed against linked sources 2026-11-01;
// source review is not clinical approval or a recommendation to order the panel.
import { BLUEPRINT_MARKERS, biomarkerUnits } from './blueprint-markers.js';
import { ADDITIONAL_MARKERS } from './additional-screening.js';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS } from './health-reference-groups.js';
import { SG_MARKER_ACTIONS } from './screening-actions.js';
import { measurementIdentity } from './measurement-index.js';

const NLM = 'https://medlineplus.gov/lab-tests/';
const encyclopedia = id => `https://medlineplus.gov/ency/article/${id}.htm`;
const lipids = 'https://www.questdiagnostics.com/healthcare-professionals/clinical-education-center/faq/faq134';
const omega = 'https://testdirectory.questdiagnostics.com/test/test-detail/92701/omegacheck-r';
// Each family supplies explicitly shared interpretation/action context, not a
// universal numerical range. Every individual analyte also has its own meaning.
const FAMILIES = {
  differential: ['inflammation', 'White-cell differential', 'Read absolute counts and percentages separately with total WBC, symptoms and the laboratory interval. A percentage can change when another cell type changes.', 'Do not try to boost or suppress a white-cell subtype with supplements. Follow up unexplained or persistent changes with the full blood count and any illness or medication history.', NLM + 'blood-differential/'],
  immature: ['inflammation', 'Immature cells and blood morphology', 'Copy the absolute count or percentage and the morphology comments. Unexpected immature-cell findings need clinical interpretation, not a longevity target.', 'Arrange clinical review of unexpected or flagged immature-cell findings; do not delay it for a diet or supplement experiment. There is no appropriate self-directed cell-count target.', NLM + 'blood-smear/'],
  indices: ['inflammation', 'Red-cell indices', 'Interpret with haemoglobin, MCV, RDW and the report interval. These indices describe cells; they do not identify the cause of anaemia alone.', 'Use regular balanced meals and treat only a confirmed nutrient deficiency using the agreed plan. Do not start iron just because a red-cell index is abnormal.', encyclopedia('003648')],
  plateletsize: ['inflammation', 'Platelet size', 'Interpret MPV with platelet count and the laboratory method. Platelet size alone cannot diagnose a bleeding or marrow disorder.', 'Do not use aspirin, blood thinners or supplements to alter platelet size. Follow up an unexplained abnormal count/size pattern or unusual bleeding with your clinician.', NLM + 'mpv-blood-test/'],
  bloodtype: ['inflammation', 'Inherited blood group', 'ABO and Rh are inherited categories, not high/low numerical results. No blood group is an optimisation target.', 'No lifestyle intervention changes an inherited blood group. Keep the laboratory result available for care; transfusion services still perform their own compatibility testing.', encyclopedia('003345')],
  ana: ['inflammation', 'Antinuclear antibodies', 'Interpret the screen, titre and staining pattern together with symptoms and the assay. A positive ANA alone does not establish an autoimmune diagnosis.', 'Do not self-start steroids or immune-suppressing/boosting products for an ANA result. Follow up persistent symptoms or a flagged result; there is no diet proven to normalise every ANA pattern.', NLM + 'ana-antinuclear-antibody-test/'],
  rf: ['inflammation', 'Rheumatoid factor', 'Interpret with joint symptoms and other findings. RF can occur without rheumatoid arthritis, and the result alone does not diagnose it.', 'Seek assessment for persistent swollen or stiff joints rather than trying to suppress RF with supplements. Follow prescribed treatment if a condition has been established.', NLM + 'rheumatoid-factor-rf-test/'],
  thyroid: ['metabolic', 'Thyroid follow-up', 'Use the assay interval with TSH, free T4, symptoms and medication context. A hormone concentration and an antibody result answer different questions.', 'Take prescribed thyroid treatment consistently and avoid unprescribed thyroid boosters or iodine megadoses. Do not change a dose to chase a single thyroid test.', NLM + 'thyroid-antibody-tests/'],
  hormones: ['metabolic', 'Reproductive and adrenal hormones', 'Use the age-, sex-, physiological-state- and assay-specific report interval. Timing, menstrual phase, pregnancy and medicines may affect interpretation; higher is not always better.', 'Avoid unprescribed hormone, steroid and fertility products. Keep a regular eating/sleep routine, but investigate unexplained symptoms rather than assuming lifestyle changes can treat a hormone disorder.', NLM + 'testosterone-levels-test/'],
  leptin: ['metabolic', 'Leptin', 'Interpret using the laboratory method and sex/BMI context. A leptin concentration is not a universal appetite, body-fat or longevity target.', 'Avoid crash dieting or unprescribed hormone products to manipulate leptin. Use a sustainable eating/activity plan and investigate suspected endocrine disorders with a clinician.', 'https://www.mayocliniclabs.com/test-catalog/overview/91339'],
  particles: ['cardiovascular', 'Advanced lipoproteins', 'Particle counts, subclass sizes and patterns are method-specific. They are not interchangeable with LDL cholesterol concentration; retain LDL/non-HDL, ApoB and overall-risk context.', 'Replace saturated-fat-heavy choices with unsaturated fats, legumes and fibre-rich wholegrains; keep regular activity. Do not stop indicated lipid treatment because a particle pattern or ratio looks favourable.', lipids],
  fattyacids: ['cardiovascular', 'Fatty-acid profile', 'Use the specimen, fraction, units and laboratory method on the report. Whole-blood and red-cell profiles are not interchangeable; no single ratio is a universal treatment target.', 'Include fish or appropriate plant sources of unsaturated fats in regular meals. Do not add high-dose fish oil or remove whole food groups merely to chase an assay ratio.', omega],
  proteins: ['organ', 'Blood proteins', 'Interpret the protein pattern with albumin, total protein, liver/kidney findings and the laboratory interval. These are not direct dietary-protein intake measurements.', 'Keep regular balanced meals. Investigate unexplained abnormal proteins rather than increasing protein supplements to force the result into range; follow any prescribed kidney/liver dietary limits.', NLM + 'total-protein-and-albumin-globulin-a-g-ratio/'],
  renalratio: ['organ', 'Kidney chemistry context', 'A derived BUN/creatinine ratio depends on both component values and compatible units. Interpret with eGFR, hydration, diet and the rest of the report; do not compare unlike unit systems.', 'Follow your usual or prescribed fluid plan; do not force extra water or restrict protein to manipulate a ratio. Review a persistent unexplained change with kidney-function results.', NLM + 'creatinine-test/'],
  pancreatic: ['organ', 'Digestive enzymes', 'Interpret blood enzyme activity with symptoms and the laboratory interval. Amylase/lipase are not general pancreatic-cancer screening tests.', 'Seek prompt assessment for persistent severe upper-abdominal pain or vomiting instead of trying digestive supplements to change the result. Follow an established pancreatic treatment plan if prescribed.', NLM + 'lipase-tests/'],
  urine: ['organ', 'Urine appearance and chemistry', 'Keep visual, dipstick and microscopy results distinct. Collection, medicines and symptoms affect interpretation; use the report format rather than a blood-test range.', 'Follow the laboratory clean-catch instructions if a repeat is requested. Do not force extra water or change medicines to improve the appearance of a urine report.', encyclopedia('003579')],
  urinecells: ['organ', 'Urine cells and organisms', 'Use the microscopy count/unit and collection context. Blood cells, epithelial cells and organisms are different findings; contamination can affect the report.', 'Use correct clean-catch collection for any requested repeat. Discuss persistent abnormalities or urinary symptoms; do not self-start antibiotics or antifungals from microscopy alone.', NLM + 'epithelial-cells-in-urine/'],
  casts: ['organ', 'Urine casts', 'Record the cast type and count, not just “casts present”. A few hyaline casts and cellular/granular casts have different implications; interpret with kidney findings.', 'Follow up unexpected casts with your clinician and kidney-function results. Do not use detox products or force water intake to clear casts; follow any existing fluid restriction.', encyclopedia('003586')],
  crystals: ['organ', 'Urine crystals', 'Record crystal type, quantity and collection context. Some small crystals can occur without disease; a crystal finding alone does not establish a kidney stone.', 'Follow an individual stone-prevention plan if one has been prescribed. Do not start an extreme low-mineral diet or change urine acidity with supplements from a crystal name alone.', NLM + 'crystals-in-urine/'],
  magnesium: ['micronutrients', 'Magnesium', 'Blood magnesium is a small part of body magnesium. Use the laboratory interval, kidney function, medicines and symptoms; both high and low values can matter.', 'Include beans, nuts and leafy vegetables in ordinary meals if compatible with your care plan. Do not self-correct an abnormal blood level with high-dose magnesium, especially with kidney disease.', NLM + 'magnesium-blood-test/'],
  zinc: ['micronutrients', 'Zinc', 'Serum/plasma zinc varies with illness, time of day and other factors and does not directly measure intake. Use the laboratory method and clinical context.', 'Include varied protein foods, legumes, nuts or seeds. Avoid high-dose or overlapping zinc products without a confirmed need; excessive zinc can interfere with copper status.', 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/'],
  metals: ['micronutrients', 'Environmental exposures', 'Interpret the specific metal, specimen, exposure history and laboratory/public-health guidance. Different metals and blood/urine tests are not interchangeable.', 'Reduce an identified exposure using occupational, food or public-health guidance. Do not use unprescribed chelation or detox products; an elevated result needs exposure-specific follow-up.', NLM + 'heavy-metal-testing/'],
  psa: ['cancer', 'PSA laboratory results', 'Interpret total, free and percent-free PSA together with age, symptoms, prior results and assay context. These measurements do not establish a cancer diagnosis.', 'Do not use supplements to suppress PSA or ignore an unexplained rise. Follow the agreed review/repeat plan and discuss screening benefits and harms separately from interpreting an existing result.', NLM + 'prostate-specific-antigen-psa-test/'],
};

// Explicit identities: never infer these joins from partial or fuzzy names.
const ROWS = [
  ['abogroup', 'bloodtype', 'The ABO blood-group category: A, B, AB or O. It is separate from Rh type.'],
  ['rhtype', 'bloodtype', 'Presence or absence of the Rh blood-group factor, reported positive or negative.'],
  ['absolutebandneutrophils', 'immature', 'Number of band-form neutrophils per blood volume, not their percentage.'],
  ['bandneutrophils', 'immature', 'Proportion of white cells identified as band-form neutrophils.'],
  ['absoluteblasts', 'immature', 'Number of cells reported as blasts per blood volume; unexpected findings require prompt clinical review.'],
  ['blasts', 'immature', 'Proportion of cells reported as blasts, not a total white-cell count.'],
  ['absolutemetamyelocytes', 'immature', 'Number of cells identified as metamyelocytes per blood volume.'],
  ['metamyelocytes', 'immature', 'Proportion of white cells identified as metamyelocytes.'],
  ['absolutemyelocytes', 'immature', 'Number of cells identified as myelocytes per blood volume.'],
  ['myelocytes', 'immature', 'Proportion of white cells identified as myelocytes.'],
  ['absolutepromyelocytes', 'immature', 'Number of cells identified as promyelocytes per blood volume.'],
  ['promyelocytes', 'immature', 'Proportion of white cells identified as promyelocytes.'],
  ['absolutenucleatedrbc', 'immature', 'Number of nucleated red cells per blood volume; not the ordinary RBC count.'],
  ['nucleatedrbc', 'immature', 'Reported relative nucleated-red-cell result; retain the laboratory denominator and units.'],
  ['absoluteneutrophils', 'differential', 'Absolute neutrophil count, distinct from the percentage of white cells that are neutrophils.'],
  ['neutrophils', 'differential', 'Percentage of white cells identified as neutrophils, which help fight infection.'],
  ['absolutelymphocytes', 'differential', 'Absolute lymphocyte count, not the lymphocyte percentage or a lymphocyte-function test.'],
  ['lymphocytes', 'differential', 'Percentage of white cells identified as lymphocytes, including B and T cells.'],
  ['absolutemonocytes', 'differential', 'Absolute number of monocytes, an immune-cell subtype, per blood volume.'],
  ['monocytes', 'differential', 'Percentage of white cells identified as monocytes.'],
  ['absoluteeosinophils', 'differential', 'Absolute eosinophil count, relevant to allergy and other clinical contexts.'],
  ['eosinophils', 'differential', 'Percentage of white cells identified as eosinophils.'],
  ['absolutebasophils', 'differential', 'Absolute basophil count, distinct from the basophil percentage.'],
  ['basophils', 'differential', 'Percentage of white cells identified as basophils, an allergy-related immune-cell subtype.'],
  ['reactivelymphocytes', 'differential', 'Lymphocytes described as reactive on morphology; retain the report’s count or proportion.'],
  ['meancorpuscularhemoglobin', 'indices', 'MCH: average amount of haemoglobin per red blood cell, not haemoglobin concentration in whole blood.'],
  ['meancorpuscularhemoglobinconcentration', 'indices', 'MCHC: haemoglobin concentration within red cells; a different quantity from MCH.'],
  ['meanplateletvolume', 'plateletsize', 'MPV measures average platelet size, not the number of platelets.'],
  ['antinuclearantibodiesscreen', 'ana', 'The ANA screen checks whether antinuclear antibodies are detected.'],
  ['antinuclearantibodiestiter', 'ana', 'The ANA titre describes the dilution at which antibody activity remains detectable; it is not a concentration in mg/L.'],
  ['antinuclearantibodiespattern', 'ana', 'The ANA staining pattern describes how antibodies bind in the assay, not a high/low score.'],
  ['rheumatoidfactor', 'rf', 'RF measures rheumatoid-factor antibodies; a positive result alone does not establish rheumatoid arthritis.'],
  ['thyroglobulinantibodies', 'thyroid', 'Antibodies directed against thyroglobulin; different from thyroid hormone concentrations.'],
  ['thyroidperoxidaseantibodies', 'thyroid', 'Antibodies directed against thyroid peroxidase (TPO), used in autoimmune thyroid assessment.'],
  ['triiodothyroninet3free', 'thyroid', 'Free T3 measures unbound triiodothyronine, not total T3 or free T4.', 'triiodothyronine-t3-tests'],
  ['cortisol', 'hormones', 'An adrenal hormone with a daily rhythm; retain collection time and specimen, not just the number.', 'cortisol-test'],
  ['dheasulfate', 'hormones', 'DHEA-S is an adrenal androgen measured as its sulfate form, not interchangeable with unsulfated DHEA.', 'dhea-sulfate-test'],
  ['estradiol', 'hormones', 'Estradiol (E2) is one type of estrogen; age, menstrual phase and hormonal treatment affect interpretation.', 'estrogen-levels-test'],
  ['folliclestimulatinghormone', 'hormones', 'FSH is a pituitary signal involved in ovarian follicles and sperm production.', 'follicle-stimulating-hormone-fsh-levels-test'],
  ['luteinizinghormone', 'hormones', 'LH is a pituitary signal involved in ovulation and testosterone production.', 'luteinizing-hormone-lh-levels-test'],
  ['prolactin', 'hormones', 'Prolactin is a pituitary hormone involved in milk production; pregnancy, medicines and other causes affect levels.', 'prolactin-levels'],
  ['testosteronefree', 'hormones', 'Free testosterone is the unbound fraction, distinct from total or bioavailable testosterone.'],
  ['testosteronetotal', 'hormones', 'Total testosterone includes free and protein-bound hormone; it is not the free-testosterone concentration.'],
  ['sexhormonebindingglobulin', 'hormones', 'SHBG is a hormone-binding protein; it helps explain differences between total and free testosterone.', 'shbg-blood-test'],
  ['antimullerianhormoneamh', 'hormones', 'AMH provides ovarian-reserve context in adults with ovaries; it is not a guarantee of fertility.', 'anti-mullerian-hormone-test'],
  ['leptin', 'leptin', 'A serum leptin assay provides specialised metabolic context; reference interpretation depends on sex and body size.'],
  ['ldlparticlenumber', 'particles', 'LDL particle number counts particles, whereas LDL-C measures the cholesterol carried in them.'],
  ['ldlsmall', 'particles', 'Concentration of the small LDL subclass defined by the assay.'],
  ['ldlmedium', 'particles', 'Concentration of the medium LDL subclass defined by the assay.'],
  ['ldlpeaksize', 'particles', 'Size of the predominant LDL particle population, not LDL cholesterol concentration.'],
  ['ldlpattern', 'particles', 'An assay-defined LDL size-pattern category, not an amount of cholesterol.'],
  ['hdllarge', 'particles', 'Concentration of large HDL particles, distinct from standard HDL cholesterol.'],
  ['cholhdlcratio', 'particles', 'Total cholesterol divided by HDL-C using compatible concentration units; different from the TG:HDL ratio.'],
  ['docosahexaenoicaciddha', 'fattyacids', 'DHA is a specific omega-3 fatty acid measured in the laboratory profile.'],
  ['docosapentaenoicaciddpa', 'fattyacids', 'DPA in this profile is the omega-3 docosapentaenoic-acid component.'],
  ['eicosapentaenoicacidepa', 'fattyacids', 'EPA is a specific omega-3 fatty acid, not the combined omega-3 result.'],
  ['epadpadha', 'fattyacids', 'Combined EPA, omega-3 DPA and DHA in the assay’s measured fatty-acid fraction.'],
  ['omega3total', 'fattyacids', 'Total omega-3 fraction reported by the assay; retain its component definition.'],
  ['omega6total', 'fattyacids', 'Total omega-6 fraction reported by the assay, not dietary grams of omega-6.'],
  ['omega6omega3ratio', 'fattyacids', 'Ratio of the measured omega-6 and omega-3 fractions; check which is the numerator.'],
  ['arachidonicacid', 'fattyacids', 'Arachidonic acid is an omega-6 fatty-acid component of the profile.'],
  ['linoleicacid', 'fattyacids', 'Linoleic acid is an omega-6 fatty acid, distinct from the total omega-6 fraction.'],
  ['arachidonicacideparatio', 'fattyacids', 'Arachidonic acid divided by EPA in the measured profile; not the total omega-6:omega-3 ratio.'],
  ['albuminglobulinratio', 'proteins', 'The blood albumin-to-globulin ratio compares two protein fractions.'],
  ['globulin', 'proteins', 'The globulin protein fraction includes proteins involved in transport and immunity.'],
  ['buncreatinineratio', 'renalratio', 'A ratio derived from blood urea nitrogen and creatinine, not a direct filtration measurement.'],
  ['amylase', 'pancreatic', 'Amylase is a carbohydrate-digesting enzyme made in the pancreas and salivary glands.', 'amylase-test'],
  ['lipase', 'pancreatic', 'Lipase is a fat-digesting enzyme; blood activity can help assess pancreatic disorders.'],
  ['appearanceurine', 'urine', 'Visual clarity/cloudiness of urine; not a diagnosis of infection.'],
  ['colorurine', 'urine', 'The observed urine colour; foods, medicines and collection context can affect it.'],
  ['phurine', 'urine', 'Urine acidity/alkalinity on a pH scale, not blood pH.'],
  ['specificgravityurine', 'urine', 'Urine concentration relative to water; not a direct measure of kidney filtration.'],
  ['glucoseurine', 'urine', 'Glucose detected in urine, distinct from blood glucose; blood testing is generally used for diabetes diagnosis.', 'glucose-in-urine-test'],
  ['ketonesurine', 'urine', 'Urine ketones reflect fat breakdown. High ketones with illness or diabetes may need urgent assessment; do not chase ketosis as a target.', 'ketones-in-urine'],
  ['bilirubinurine', 'urine', 'Bilirubin in urine can prompt liver/bile-duct assessment; it is not the total blood bilirubin result.', 'bilirubin-in-urine'],
  ['proteinurine', 'urine', 'Urine protein is distinct from blood protein and from a quantitative urine albumin/creatinine ratio.', 'protein-in-urine'],
  ['occultbloodurine', 'urine', 'A urine test for blood, which is different from a faecal occult-blood test or an RBC blood count.', 'blood-in-urine'],
  ['nitriteurine', 'urine', 'Nitrite is a urine chemistry finding associated with certain bacteria; a negative result cannot exclude every UTI.', 'nitrites-in-urine'],
  ['leukocyteesteraseurine', 'urine', 'Leukocyte esterase is a urine chemistry marker of white-cell activity, not the blood WBC count.'],
  ['redbloodcellsurine', 'urinecells', 'Red cells counted in urine microscopy, not the circulating RBC count.', 'blood-in-urine'],
  ['whitebloodcellsurine', 'urinecells', 'White cells found in urine microscopy, interpreted with symptoms and other urine findings.'],
  ['squamousepithelialcellsurine', 'urinecells', 'Squamous epithelial cells can reflect collection contamination; retain the cell type and count.'],
  ['renalepithelialcellsurine', 'urinecells', 'Renal epithelial cells are a distinct urine microscopy finding needing kidney-context interpretation.'],
  ['transitionalepithelialcellsurine', 'urinecells', 'Transitional epithelial cells are a urinary-tract lining-cell finding, not the same as squamous cells.'],
  ['bacteriaurine', 'urinecells', 'Bacteria seen in urine; microscopy alone does not establish which antibiotic, if any, is appropriate.'],
  ['yeasturine', 'urinecells', 'Yeast reported in urine microscopy; collection and symptoms affect whether treatment is needed.'],
  ['castsurine', 'casts', 'Tube-shaped structures seen in urine; the type matters for interpretation.'],
  ['hyalinecasturine', 'casts', 'Hyaline casts are protein-based casts; small numbers can occur without a specific kidney disease.'],
  ['granularcasturine', 'casts', 'Granular casts are a different microscopy finding from hyaline casts and can accompany kidney disease.'],
  ['crystalsurine', 'crystals', 'Crystals detected in urine microscopy; the composition and quantity matter.'],
  ['calciumoxalatecrystalsurine', 'crystals', 'Crystals identified as calcium oxalate; not a serum calcium test.'],
  ['triplephosphatecrystalsurine', 'crystals', 'Crystals identified as triple phosphate; interpret with urine chemistry and any infection/stone assessment.'],
  ['uricacidcrystalsurine', 'crystals', 'Crystals identified as uric acid in urine, distinct from blood urate concentration.'],
  ['amorphoussedimenturine', 'crystals', 'Unstructured sediment reported on urine microscopy; not a measurement of kidney stone size.'],
  ['magnesium', 'magnesium', 'Serum magnesium assesses the blood concentration of this electrolyte, not total body stores.'],
  ['zinc', 'zinc', 'Blood zinc provides nutrient-status context with important assay and illness-related limitations.'],
  ['lead', 'metals', 'A lead exposure measurement; retain the specimen and units used by the laboratory.'],
  ['mercuryblood', 'metals', 'Blood mercury assesses a specific exposure context; it is not interchangeable with urine or hair mercury.'],
  ['prostatespecificantigenpsatotal', 'psa', 'Total PSA includes free and protein-bound prostate-specific antigen.'],
  ['prostatespecificantigenpsafree', 'psa', 'Free PSA is the portion not attached to blood proteins; it is a different quantity from percent-free PSA.'],
  ['prostatespecificantigenpsapercentfree', 'psa', 'Percent-free PSA expresses free PSA relative to total PSA as a percentage, not a concentration.'],
];
const contexts = new Map(ROWS.map(([id, familyId, note, source]) => [id, { familyId, note, source }]));
const EXTRA_SOURCES = {
  ana: 'https://www.hopkinslupus.org/lupus-tests/lupus-blood-tests/',
  fattyacids: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/',
  particles: 'https://www.healthhub.sg/health-conditions/hyperlipidemia',
  psa: 'https://www.cancer.gov/publications/dictionaries/cancer-terms/def/free-psa',
};
const core = new Map(HEALTH_REFERENCES.map(item => [item.id, item]));
const optional = new Map(ADDITIONAL_MARKERS.map(item => [item.id, item]));
const optionalGroups = { 'lipid-context': 'metabolic', liver: 'organ', 'kidney-context': 'organ', iron: 'inflammation', thyroid: 'metabolic', chemistry: 'organ', 'blood-count': 'inflammation', vitamins: 'micronutrients' };

export const LAB_REFERENCES = BLUEPRINT_MARKERS.map(marker => {
  const id = measurementIdentity(marker.id).id;
  const common = { id, libraryId: marker.id, aliases: [marker.name, marker.aliases].join(' '), reviewed: '2026-11-01' };
  const existing = core.get(id);
  if (existing) return { ...existing, ...common, groupId: HEALTH_REFERENCE_GROUPS.find(group => group.ids.includes(id)).id, action: existing.action || SG_MARKER_ACTIONS[id][0].join('. ') };
  const extra = optional.get(id);
  if (extra) return { ...common, label: extra.label, unit: extra.suffix, groupId: optionalGroups[extra.group], familyId: 'optional-' + extra.group, familyLabel: extra.eyebrow, reference: extra.context, note: extra.why, action: (extra.actions || SG_MARKER_ACTIONS[extra.actionKey]).map(step => step.join('. ')).join(' '), actionLabel: 'Shared family action plan', source: extra.meaningSource, extraSource: extra.source };
  const context = contexts.get(marker.id);
  if (!context) throw new Error(`Missing published lab guidance: ${marker.id}`);
  const [groupId, familyLabel, reference, action, source] = FAMILIES[context.familyId];
  return { ...common, label: marker.name, groupId, familyId: context.familyId, familyLabel,
    unit: biomarkerUnits(marker.name).join(' or ') || 'Report-specific result and units',
    reference, note: context.note, action, actionLabel: context.familyId === 'bloodtype' ? 'No self-directed target' : 'Shared family plan / follow-up',
    source: context.source ? NLM + context.source + '/' : source,
    extraSource: EXTRA_SOURCES[context.familyId],
  };
});
