// ═══════════════════════════════════════════════════════════════
//  i18n/verbsNatural.ts — real Hindi and Telugu sentences for verb forms
//  (वे जाते हैं · వారు వెళ్తారు) instead of "pronoun · verb · tense".
//  Each root needs a few stems; everything else follows from the rules below.
// ═══════════════════════════════════════════════════════════════

// ── Hindi ──────────────────────────────────────────────────────
// [infinitive, past participle, transitive (ergative past: उसने पढ़ा), passive participle]
const HI: Record<string, [string, string, boolean, string?]> = {
  "भू": ["होना", "हुआ", false], "गम्": ["जाना", "गया", false, "जाया"], "पठ्": ["पढ़ना", "पढ़ा", true], "लिख्": ["लिखना", "लिखा", true],
  "कृ": ["करना", "किया", true], "स्था": ["ठहरना", "ठहरा", false], "दृश्": ["देखना", "देखा", true], "पा": ["पीना", "पिया", true],
  "स्मृ": ["याद करना", "याद किया", true], "लभ्": ["पाना", "पाया", true], "अस्": ["होना", "था", false], "दा": ["देना", "दिया", true],
  "हन्": ["मारना", "मारा", true], "जि": ["जीतना", "जीता", true], "नी": ["ले जाना", "ले गया", false, "ले जाया"], "खाद्": ["खाना", "खाया", true],
  "हस्": ["हँसना", "हँसा", false], "वद्": ["बोलना", "बोला", false], "धाव्": ["दौड़ना", "दौड़ा", false], "चुर्": ["चुराना", "चुराया", true],
  "कथ्": ["कहना", "कहा", true], "क्री": ["ख़रीदना", "ख़रीदा", true], "श्रु": ["सुनना", "सुना", true], "रुध्": ["रोकना", "रोका", true],
  "दिव्": ["खेलना", "खेला", false],
};
const HI_SUBJ_IRREG: Record<string, [string, string, string, string]> = {   // stem: [3sg, 3pl, 2pl, 1sg]
  "दे": ["दे", "दें", "दो", "दूँ"], "ले": ["ले", "लें", "लो", "लूँ"], "हो": ["हो", "हों", "हो", "होऊँ"], "पी": ["पिए", "पिएँ", "पियो", "पियूँ"],
};
const HI_NOM = [["वह", "वे दोनों", "वे"], ["तू", "तुम दोनों", "तुम सब"], ["मैं", "हम दोनों", "हम"]];
const HI_ERG = [["उसने", "उन दोनों ने", "उन्होंने"], ["तूने", "तुम दोनों ने", "तुमने"], ["मैंने", "हम दोनों ने", "हमने"]];
const HI_DAT = [["उसे", "उन दोनों को", "उन्हें"], ["तुझे", "तुम दोनों को", "तुम्हें"], ["मुझे", "हम दोनों को", "हमें"]];
const HI_AUX = [["है", "हैं", "हैं"], ["है", "हो", "हो"], ["हूँ", "हैं", "हैं"]];
/** masculine plural of a participle: गया → गए, हुआ → हुए, पढ़ा → पढ़े (only the last word changes) */
const pl = (pp: string) => pp.replace(/या$/, "ए").replace(/आ$/, "ए").replace(/ा$/, "े");

function hiSubj(stem: string, p: number, n: number) {
  const last = stem.split(" ").pop()!; const pre = stem.slice(0, stem.length - last.length);
  const ir = HI_SUBJ_IRREG[last];
  const k = p === 0 ? (n === 0 ? 0 : 1) : p === 1 ? (n === 0 ? 0 : 2) : (n === 0 ? 3 : 1);
  if (ir) return pre + ir[k];
  // after a vowel (जा, खा) the endings are full letters; after a consonant (पढ़, लिख) they are vowel signs
  const afterVowel = /[ािीुूेैोौ]$/.test(last);
  return pre + last + (afterVowel ? ["ए", "एँ", "ओ", "ऊँ"] : ["े", "ें", "ो", "ूँ"])[k];
}
function hindi(root: string, lak: string, p: number, n: number, passive: boolean): string | null {
  const h = HI[root]; if (!h) return null;
  let [inf, pp, trans] = h;
  const subj = HI_NOM[p][n];
  const sg = n === 0;
  if (passive) { inf = "जाना"; trans = false; }
  const stem = inf.replace(/ना$/, "");
  const ppPass = h[3] ?? h[1];
  const prefix = passive ? (sg ? ppPass : pl(ppPass)) + " " : "";
  const ta = sg ? "ता" : "ते";
  if (root === "अस्" && !passive) {
    if (lak === "lat") return `${subj} ${HI_AUX[p][n]}`;
    if (["lan", "lit", "lun"].includes(lak)) return `${subj} ${sg ? "था" : "थे"}`;
  }
  const past = () => passive || !trans ? `${subj} ${prefix}${passive ? (sg ? "गया" : "गए") : sg ? pp : pl(pp)}` : `${HI_ERG[p][n]} ${pp}`;
  switch (lak) {
    case "lat": return `${subj} ${prefix}${stem}${ta} ${HI_AUX[p][n]}`;
    case "lan": case "lun": return past();
    case "lit": return `${past()} ${passive || !trans ? (sg ? "था" : "थे") : "था"}`;
    case "lot": return p === 1 ? `${subj} ${prefix}${sg ? stem : hiSubj(stem, 1, 1)}` : `${subj} ${prefix}${hiSubj(stem, p, n)}`;
    case "vidhilin": return passive ? `${subj} ${prefix}जाना चाहिए` : `${HI_DAT[p][n]} ${inf} चाहिए`;
    case "lrt": case "lut": return `${subj} ${prefix}${hiSubj(stem, p, n)}${sg ? "गा" : "गे"}`;
    case "asirlin": return `ईश्वर करे, ${subj} ${prefix}${hiSubj(stem, p, n)}`;
    case "lrn": return `यदि ${subj} ${prefix}${stem}${ta}…`;
  }
  return null;
}

// ── Telugu ─────────────────────────────────────────────────────
// [habitual/future 3sg m, past 3sg m, imperative sg, imperative pl, "must" form, "let" form, "if" form]
const TE: Record<string, [string, string, string, string, string, string, string]> = {
  "भू": ["అవుతాడు", "అయ్యాడు", "అవ్వు", "అవ్వండి", "అవ్వాలి", "అవ్వనివ్వు", "అయితే"],
  "गम्": ["వెళ్తాడు", "వెళ్ళాడు", "వెళ్ళు", "వెళ్ళండి", "వెళ్ళాలి", "వెళ్ళనివ్వు", "వెళ్తే"],
  "पठ्": ["చదువుతాడు", "చదివాడు", "చదువు", "చదవండి", "చదవాలి", "చదవనివ్వు", "చదివితే"],
  "लिख्": ["రాస్తాడు", "రాశాడు", "రాయి", "రాయండి", "రాయాలి", "రాయనివ్వు", "రాస్తే"],
  "कृ": ["చేస్తాడు", "చేశాడు", "చెయ్యి", "చేయండి", "చేయాలి", "చేయనివ్వు", "చేస్తే"],
  "स्था": ["నిలబడతాడు", "నిలబడ్డాడు", "నిలబడు", "నిలబడండి", "నిలబడాలి", "నిలబడనివ్వు", "నిలబడితే"],
  "दृश्": ["చూస్తాడు", "చూశాడు", "చూడు", "చూడండి", "చూడాలి", "చూడనివ్వు", "చూస్తే"],
  "पा": ["తాగుతాడు", "తాగాడు", "తాగు", "తాగండి", "తాగాలి", "తాగనివ్వు", "తాగితే"],
  "स्मृ": ["గుర్తుచేసుకుంటాడు", "గుర్తుచేసుకున్నాడు", "గుర్తుచేసుకో", "గుర్తుచేసుకోండి", "గుర్తుచేసుకోవాలి", "గుర్తుచేసుకోనివ్వు", "గుర్తుచేసుకుంటే"],
  "लभ्": ["పొందుతాడు", "పొందాడు", "పొందు", "పొందండి", "పొందాలి", "పొందనివ్వు", "పొందితే"],
  "अस्": ["ఉంటాడు", "ఉన్నాడు", "ఉండు", "ఉండండి", "ఉండాలి", "ఉండనివ్వు", "ఉంటే"],
  "दा": ["ఇస్తాడు", "ఇచ్చాడు", "ఇవ్వు", "ఇవ్వండి", "ఇవ్వాలి", "ఇవ్వనివ్వు", "ఇస్తే"],
  "हन्": ["చంపుతాడు", "చంపాడు", "చంపు", "చంపండి", "చంపాలి", "చంపనివ్వు", "చంపితే"],
  "जि": ["గెలుస్తాడు", "గెలిచాడు", "గెలువు", "గెలవండి", "గెలవాలి", "గెలవనివ్వు", "గెలిస్తే"],
  "नी": ["తీసుకెళ్తాడు", "తీసుకెళ్ళాడు", "తీసుకెళ్ళు", "తీసుకెళ్ళండి", "తీసుకెళ్ళాలి", "తీసుకెళ్ళనివ్వు", "తీసుకెళ్తే"],
  "खाद्": ["తింటాడు", "తిన్నాడు", "తిను", "తినండి", "తినాలి", "తిననివ్వు", "తింటే"],
  "हस्": ["నవ్వుతాడు", "నవ్వాడు", "నవ్వు", "నవ్వండి", "నవ్వాలి", "నవ్వనివ్వు", "నవ్వితే"],
  "वद्": ["మాట్లాడతాడు", "మాట్లాడాడు", "మాట్లాడు", "మాట్లాడండి", "మాట్లాడాలి", "మాట్లాడనివ్వు", "మాట్లాడితే"],
  "धाव्": ["పరుగెత్తుతాడు", "పరుగెత్తాడు", "పరుగెత్తు", "పరుగెత్తండి", "పరుగెత్తాలి", "పరుగెత్తనివ్వు", "పరుగెత్తితే"],
  "चुर्": ["దొంగిలిస్తాడు", "దొంగిలించాడు", "దొంగిలించు", "దొంగిలించండి", "దొంగిలించాలి", "దొంగిలించనివ్వు", "దొంగిలిస్తే"],
  "कथ्": ["చెబుతాడు", "చెప్పాడు", "చెప్పు", "చెప్పండి", "చెప్పాలి", "చెప్పనివ్వు", "చెబితే"],
  "क्री": ["కొంటాడు", "కొన్నాడు", "కొను", "కొనండి", "కొనాలి", "కొననివ్వు", "కొంటే"],
  "श्रु": ["వింటాడు", "విన్నాడు", "విను", "వినండి", "వినాలి", "విననివ్వు", "వింటే"],
  "रुध्": ["అడ్డుకుంటాడు", "అడ్డుకున్నాడు", "అడ్డుకో", "అడ్డుకోండి", "అడ్డుకోవాలి", "అడ్డుకోనివ్వు", "అడ్డుకుంటే"],
  "दिव्": ["ఆడతాడు", "ఆడాడు", "ఆడు", "ఆడండి", "ఆడాలి", "ఆడనివ్వు", "ఆడితే"],
};
const TE_NOM = [["అతడు", "వారిద్దరు", "వారు"], ["నీవు", "మీరిద్దరు", "మీరు"], ["నేను", "మేమిద్దరం", "మేము"]];
const TE_OBJ = [["అతన్ని", "వారిద్దరినీ", "వారిని"], ["నిన్ను", "మిమ్మల్నిద్దరినీ", "మిమ్మల్ని"], ["నన్ను", "మమ్మల్నిద్దరినీ", "మమ్మల్ని"]];
const TE_END = [["ాడు", "ారు", "ారు"], ["ావు", "ారు", "ారు"], ["ాను", "ాము", "ాము"]];
const TE_PROGRESSIVE_END = [["ున్నాడు", "ున్నారు", "ున్నారు"], ["ున్నావు", "ున్నారు", "ున్నారు"], ["ున్నాను", "ున్నాము", "ున్నాము"]];
/** change the 3sg masculine ending -ాడు to the ending for this person and number */
const teAgree = (f3: string, p: number, n: number) => f3.replace(/ాడు$/, TE_END[p][n]);

function telugu(root: string, lak: string, p: number, n: number, passive: boolean): string | null {
  const t = TE[root]; if (!t) return null;
  let [hab, past, imp, impl, must, let_, cond] = t;
  if (passive) {                       // చూడబడు: "must" stem + బడ
    const s = must.replace(/ాలి$/, "");
    [hab, past, imp, impl, must, let_, cond] = [s + "బడతాడు", s + "బడ్డాడు", s + "బడు", s + "బడండి", s + "బడాలి", s + "బడనివ్వు", s + "బడితే"];
  }
  const subj = TE_NOM[p][n];
  switch (lak) {
    case "lat": {
      const stem = hab.replace(/ాడు$/, "");
      return stem === hab ? null : `${subj} ${stem}${TE_PROGRESSIVE_END[p][n]}`;
    }
    case "lrt": case "lut": return `${subj} ${teAgree(hab, p, n)}`;
    case "lan": case "lun": return `${subj} ${teAgree(past, p, n)}`;
    case "lit": return `${subj} ఎప్పుడో ${teAgree(past, p, n)}`;
    case "lot": return p === 1 ? `${subj} ${n === 0 ? imp : impl}` : `${TE_OBJ[p][n]} ${let_}`;
    case "vidhilin": return `${subj} ${must}`;
    case "asirlin":
      if (!passive && root === "दिव्" && p === 0) return `${subj} ఆడుగాక`;
      return null;
    case "lrn": return `${subj} ${cond}…`;
  }
  return null;
}

/** a natural Hindi / Telugu sentence for one verb form, or null if this root has no stems yet */
export function naturalVerb(lang: string, root: string, key: "P" | "A" | "K" | "B", lak: string, p: number, n: number): string | null {
  if (key === "B") return null;
  const passive = key === "K";
  if (lang === "hi") return hindi(root, lak, p, n, passive);
  if (lang === "te") return telugu(root, lak, p, n, passive);
  return null;
}
