// ═══════════════════════════════════════════════════════════════
//  data/index.ts — the game's word, verb, kṛdanta, sentence and
//  avyaya data, with the labels used everywhere in the app.
//  The JSON files next to this one are generated from data-source/
//  (see tools/README.md). Do not hand-edit them; flag errors in the app.
// ═══════════════════════════════════════════════════════════════
import wordsJson from "./words.json";
import curriculumJson from "./curriculum.json";
import compositionJson from "./composition.json";
import verbsJson from "./verbs.json";
import krtJson from "./krt.json";
import sentencesJson from "./sentences.json";
import avyayaJson from "./avyaya.json";
import errorsJson from "./errors.json";
import padacchedaJson from "./padaccheda.json";
import padyaJson from "./padya.json";
import grammarJson from "./grammar.json";
import dhatu400TinantaUrl from "../../../dhatu_400_tinanta.json?url";
import dhatu400KrtUrl from "../../../dhatu_400_krt.json?url";
import upasargaFormsUrl from "./upasarga_forms.json?url";
import unadiUrl from "./unadi.json?url";
import alankaraUrl from "./alankara.json?url";
import chandasUrl from "./chandas.json?url";

/** a meaning in one language: [text, how it was sourced] */
export type Meaning = [string, string];

export type Word = {
  id: string; w: string; iast: string; g: string; cat: string;
  m: Record<string, Meaning>;
  /** declension: d[vacana 0-2][vibhakti 0-7]; "" = no such form */
  d: string[][];
  ch: number; notes: string[];
};

/** one verb cell: [form, alternative form, English gloss, book page, differs-from-book flag] */
export type VerbCell = [string, string, string, number, number];
/** lakāra → [puruṣa 0-2][vacana 0-2] */
export type VerbGrid = Record<string, (VerbCell | null)[][]>;
export type Verb = {
  id: string; w: string; iast: string; gana: string; pada: string; trans: string; artha: string;
  m: { en?: string; te?: string; hi?: string } & Record<string, string | undefined>;
  /** how each verb meaning was sourced (direct / draft …) */
  mc?: Record<string, string>;
  P?: VerbGrid; A?: VerbGrid; K?: VerbGrid; B?: VerbGrid;
};

/** kṛt form: [form, English gloss, attested in dictionary 1/0, level] */
export type KrtForm = [string, string, number, string];
export type KrtRoot = { id: string; w: string; gana: string; pada: string; en: string; f: Record<string, KrtForm>; notes: string[] };

export type Sentence = { id: string; sa: string; en: string; cat: string; cat_sa: string; fixed: string[]; m?: Record<string, string>; r?: Record<string, string> };
/** a wrong sentence and its correction (reviewed Gold data) */
export type ErrorPair = { id: string; wrong: string; right: string; note: string };
/** a śloka and its word split */
export type Padaccheda = { id: string; sloka: string; padas: string[] };
export type Avyaya = { sa: string; cat: string; en: string; hi: string; te: string };

export const WORDS = wordsJson as unknown as Word[];
export type CurriculumChallenge = {
  id: string; topic: string; prompt_sa: string; prompt_en: string; options: string[]; answer: string;
  explanation_sa: string; explanation_en: string; explanation_hi: string; explanation_te: string; points: number;
};
export type CurriculumModule = {
  id: string; name_sa: string; name_en: string; description: string; theory: string[]; challenges: CurriculumChallenge[];
};
export type CurriculumTrack = {
  title: string; audience: string; level: string; description: string; modules: CurriculumModule[];
};
export const CURRICULUM = curriculumJson as unknown as Record<"school" | "college" | "university", CurriculumTrack>;
export type CompositionChallenge = {
  question_sa: string; question_en: string; options: string[]; answer: string;
  explanation_en: string; explanation_hi: string; explanation_te: string;
};
export type CompositionQuest = {
  id: string; level: string; type: string; title_sa: string; title_en: string; context: string;
  framework: Record<string, string>; subhashita: Record<string, string>;
  manjusha: unknown[]; templates: string[]; model: unknown; cloze: string[];
  challenge: CompositionChallenge;
};
export type CompositionSet = { title: string; description: string; total: number; quests: CompositionQuest[] };
export const COMPOSITION = compositionJson as unknown as Record<"paragraph" | "picture" | "letter", CompositionSet>;
export const VERBS = verbsJson as unknown as Verb[];
export const KRT = krtJson as unknown as KrtRoot[];
export type Dhatu400Cell = {
  form: string | null;
  variants?: string[];
  source?: string;
  meanings?: Record<string, string>;
  checks?: Record<string, string | string[]>;
};
export type Dhatu400Grid = Partial<Record<"prathama_purusha" | "madhyama_purusha" | "uttama_purusha",
  Partial<Record<"ekavacana" | "dvivacana" | "bahuvacana", Dhatu400Cell>>>>;
export type LakaraMeaning = { sutra: string; sa: string; en: string; term: string };
export type Dhatu400Conjugation = {
  lakara_name_sa: string; lakara_name_en: string; conjugation_grid: Dhatu400Grid; lakara_meaning?: LakaraMeaning;
};
export type Dhatu400 = {
  id: string; lemma: string; given_headword: string; iast: string; gana: string; pada: string;
  meanings: Record<string, string>; transitivity: string; gloss_verb_en: string;
  lakara_conjugations: Record<string, Dhatu400Conjugation>;
  lakara_conjugations_atmanepada?: Record<string, Dhatu400Conjugation>;
  karmani_conjugations?: Record<string, Dhatu400Conjugation>;
  bhave_conjugations?: Record<string, Dhatu400Conjugation>;
  source_verification?: { kartari_cells: number; sanskritverb_same: number; attested_in_samsaadhanii_or_heritage: number };
  dhatupatha: { code: string; aupadeshika: string; artha: string; set_anit?: string };
};
export type Dhatu400KrtForm = {
  tier?: string; form?: string | null; variants?: string[]; meaning_en?: string;
  source?: string; status?: string; note?: string; usage?: string; attested_in_dictionary?: boolean;
};
export type Dhatu400Krt = {
  dhatu_id: string; lemma: string; gana: string; pada: string; meaning_en: string;
  krt_rupas: Record<string, Dhatu400KrtForm>;
  restricted_krt: Record<string, Dhatu400KrtForm>;
  source_note: string;
};
export async function loadDhatu400Data(): Promise<{ tinanta: Dhatu400[]; krt: Dhatu400Krt[] }> {
  const responses = await Promise.all([fetch(dhatu400TinantaUrl), fetch(dhatu400KrtUrl)]);
  const [tinantaResponse, krtResponse] = responses;
  if (!tinantaResponse.ok) throw new Error(`Could not load tiṅanta data (HTTP ${tinantaResponse.status}).`);
  if (!krtResponse.ok) throw new Error(`Could not load kṛdanta data (HTTP ${krtResponse.status}).`);
  const [tinanta, krt] = await Promise.all([tinantaResponse.json(), krtResponse.json()]);
  return { tinanta: tinanta as Dhatu400[], krt: krt as Dhatu400Krt[] };
}
// full verb tables of the upasarga + root verbs (data-source/21-upasarga/tools/build_upasarga_forms.py)
/** mode ("kartari_P" | "kartari_A" | "karmani") → lakāra → 9 cells (prathama eka … uttama bahu) */
export type UpasargaForms = Record<string, Record<string, Record<string, string[]>>>;
let upasargaForms: Promise<UpasargaForms> | null = null;
export function loadUpasargaForms(): Promise<UpasargaForms> {
  upasargaForms ??= fetch(upasargaFormsUrl).then(r => {
    if (!r.ok) throw new Error(`Could not load the prefixed verb tables (HTTP ${r.status}).`);
    return r.json() as Promise<UpasargaForms>;
  });
  upasargaForms.catch(() => { upasargaForms = null; });
  return upasargaForms;
}
// उणादयः — the 748 Uṇādi-sūtras (data-source/23-unadi/tools/build_unadi_app.py)
/** one derivation step: rule ("A:7.2.115", "U:1.1"…), the terms after it in SLP1 ("*" marks a changed term),
 *  and the rules that only named something (saṃjñā) since the previous change */
export type UnadiStep = [string, string, string[]];
export type UnadiDerivation = { root: string; stem: string; s: UnadiStep[]; n: UnadiStep[] };
/** a rūpa: word, dhātu, gender (पुं/स्त्री/नपुं/अव्य), meanings by language, class-note prakriyā,
 *  step-by-step derivation (vidyut-prakriya), short outline when neither exists */
export type UnadiRupa = [string, string, string, Record<string, string>, string, UnadiDerivation | null, string];
/** a sūtra: number (१.१), text, suffix, prakriyā, rūpas */
export type UnadiSutra = [string, string, string, string, UnadiRupa[]];
/** a question of the teacher's Uṇādi exam (level 1–4) */
export type UnadiExam = { id: string; lv: number; w: string; q: string; qe: string; o: string[]; a: string; s: string; x: string };
export type Unadi = { intro: string[]; abbr: [string, string, string][]; padas: [string, number][]; s: UnadiSutra[];
  levels: [number, string, string, string][]; exam: UnadiExam[];
  /** rule code → [number, text, term key] */ rules: Record<string, [string, string, string]>;
  /** term key → [Sanskrit, English, sūtras, explanation, example] */ terms: Record<string, [string, string, string, string, string]> };
let unadi: Promise<Unadi> | null = null;
export function loadUnadi(): Promise<Unadi> {
  unadi ??= fetch(unadiUrl).then(r => {
    if (!r.ok) throw new Error(`Could not load the Uṇādi-sūtras (HTTP ${r.status}).`);
    return r.json() as Promise<Unadi>;
  });
  unadi.catch(() => { unadi = null; });
  return unadi;
}
// विभक्तिसमन्वयः — agreement of case and verb (data-source/22-vibhakti-samanvaya/build_samanvaya.py)
import samanvayaJson from "./samanvaya.json";
export type Samanvaya = {
  definition: string; definition_en: string; principle: string; principle_en: string; circ: string; circ_en: string;
  persons: { name: string; rule: string; kartari: string[]; karmani: string[] }[]; vacana: string;
  single: { canonical_mandate: string; english_translation: string; exceptions: { kind: string; example: string }[]; with_ca_va: string };
  prayoga: { name: string; def: string; rules: string; ok: string; ok_why: string; bad: { text: string; why: string }[] }[];
  adhyahara: { sa: string; en: string; maxim: string }[];
};
export const SAMANVAYA = samanvayaJson as unknown as Samanvaya;
export const SENTENCES = sentencesJson as unknown as Sentence[];
export const AVYAYA = (avyayaJson as unknown as { items: Avyaya[] }).items;
export const ERRORS = errorsJson as unknown as ErrorPair[];
export const PADACCHEDA = padacchedaJson as unknown as Padaccheda[];
export type KarakaRow = { word: string; role: string; vibhakti?: string; of?: string; note?: string };
export type Padya = { id: string; source: string; verse: string; padaccheda: string[]; anvaya: string; artha_sa: string;
  words: { word: string; form: string }[]; karaka: KarakaRow[]; notes: string[]; m: Record<string, string>; r?: Record<string, string>; free?: boolean };
export const PADYA = padyaJson as unknown as { method: { n: number; title: string; details: string }[];
  adjectives: Record<string, unknown>; verses: Padya[] };
export const padyaMeaning = (v: Padya, lang: string) => v.m[lang] || v.m.en || "";
/** the anvaya as word tokens (punctuation dropped, supplied words keep their brackets) */
export const anvayaTokens = (v: Padya) => {
  const raw = v.anvaya.replace(/[,।?॥|]/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").split(/\s+/).filter(Boolean);
  const out: string[] = [];                       // a supplied (adhyāhṛta) phrase in brackets stays one tile
  for (const t of raw) { const last = out[out.length - 1]; if (last && last.startsWith("(") && !last.endsWith(")")) out[out.length - 1] = last + " " + t; else out.push(t); }
  return out;
};
export const AVYAYA_CATS = (avyayaJson as unknown as { cats: Record<string, [string, string]> }).cats;

// ── labels ──────────────────────────────────────────────────────
export const VIBHAKTI = ["प्रथमा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी", "सप्तमी", "सम्बोधनम्"];
export const VIBHAKTI_EN = ["1st · nominative", "2nd · accusative", "3rd · instrumental", "4th · dative", "5th · ablative", "6th · genitive", "7th · locative", "vocative"];
export const VACANA = ["एकवचनम्", "द्विवचनम्", "बहुवचनम्"];
export const VACANA_EN = ["singular", "dual", "plural"];
export const PURUSHA = ["प्रथमपुरुषः", "मध्यमपुरुषः", "उत्तमपुरुषः"];
export const PURUSHA_EN = ["3rd person (he/she/it/they)", "2nd person (you)", "1st person (I/we)"];
export const LAKARA: Record<string, [string, string]> = {
  lat: ["लट्", "present"], lan: ["लङ्", "past (an earlier day)"], lot: ["लोट्", "command"], vidhilin: ["विधिलिङ्", "should / may"],
  lrt: ["लृट्", "future"], lut: ["लुट्", "future (a later day)"], lit: ["लिट्", "past (long ago, unseen)"],
  lun: ["लुङ्", "past (any time)"], asirlin: ["आशीर्लिङ्", "blessing"], lrn: ["लृङ्", "conditional"],
};
import lakaraJson from "./lakara.json";
/** what each lakāra means: sūtra, Sanskrit, English, and the term used for it in the thesis (4.8.6) */
export const LAKARA_INFO = lakaraJson as Record<string, LakaraMeaning>;
export const LAKARA_ORDER = Object.keys(LAKARA);
export const PRAYOGA: Record<"P" | "A" | "K" | "B", [string, string]> = {
  P: ["परस्मैपदम्", "active"], A: ["आत्मनेपदम्", "active (middle)"], K: ["कर्मणि", "passive"], B: ["भावे", "impersonal"],
};
/** label for a verb grid: P holds the root's main kartari forms (ātmanepada for ātmanepadī roots) */
export const prayogaLabel = (v: Verb, key: "P" | "A" | "K" | "B"): [string, string] =>
  key === "P" && v.pada.startsWith("आत्मने") ? PRAYOGA.A : PRAYOGA[key];
/** the gender of a word, as said of the word itself (… शब्दः): पुंलिङ्गः, स्त्रीलिङ्गः, नपुंसकलिङ्गः;
 *  "c": अस्मद्, युष्मद् and पञ्चन् … दशन्, which have the same forms in all genders */
export const LINGA: Record<string, [string, string]> = {
  m: ["पुंलिङ्गः", "masculine"], f: ["स्त्रीलिङ्गः", "feminine"], n: ["नपुंसकलिङ्गः", "neuter"], c: ["त्रिषु लिङ्गेषु समानः", "same in all genders"] };
const ANTA_VOWEL: Record<string, [string, string]> = {
  "": ["अ", "a"], "ा": ["आ", "ā"], "ि": ["इ", "i"], "ी": ["ई", "ī"], "ु": ["उ", "u"], "ू": ["ऊ", "ū"], "ृ": ["ऋ", "ṛ"], "ॄ": ["ॠ", "ṝ"],
  "े": ["ए", "e"], "ै": ["ऐ", "ai"], "ो": ["ओ", "o"], "ौ": ["औ", "au"] };
const IAST_C: Record<string, string> = { क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ṅ", च: "c", छ: "ch", ज: "j", झ: "jh", ञ: "ñ", ट: "ṭ", ठ: "ṭh", ड: "ḍ", ढ: "ḍh",
  ण: "ṇ", त: "t", थ: "th", द: "d", ध: "dh", न: "n", प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", व: "v", श: "ś", ष: "ṣ", स: "s", ह: "h" };
/** the last sound of a stem, as the tradition names it: अकारान्तः, सकारान्तः, रेफान्तः (र्) … → [Sanskrit, English] */
export function antaOf(stem: string): [string, string] {
  const s = stem.trim().replace(/[ःं]$/, "");
  const last = s.slice(-1);
  if (last === "्") {
    const c = s.slice(-2, -1);
    return c === "र" ? ["रेफान्तः", "ends in r"] : [`${c}कारान्तः`, `ends in ${IAST_C[c] ?? c}`];
  }
  const v = ANTA_VOWEL[last] ?? (IAST_C[last] !== undefined ? ANTA_VOWEL[""] : undefined);
  return v ? [`${v[0]}कारान्तः`, `ends in ${v[1]}`] : ["", ""];
}
/** "सकारान्तः पुंलिङ्गः" and "ends in s, masculine" */
export function wordKind(w: { w: string; g: string }): [string, string] {
  const [a, ae] = antaOf(w.w); const [l, le] = LINGA[w.g] ?? ["", ""];
  return [[a, l].filter(Boolean).join(" "), [ae, le].filter(Boolean).join(", ")];
}

export const LANGS: Record<string, string> = {
  te: "తెలుగు", hi: "हिन्दी", en: "English", ta: "தமிழ்", kn: "ಕನ್ನಡ", ml: "മലയാളം", mr: "मराठी", bn: "বাংলা",
  or: "ଓଡ଼ିଆ", gu: "ગુજરાતી", pa: "ਪੰਜਾਬੀ", de: "Deutsch", fr: "Français", es: "Español", ru: "Русский",
  ar: "العربية", zh: "中文", ja: "日本語", ko: "한국어", sa: "संस्कृतम्",
};
/** languages that at least one word has a meaning in (Sanskrit synonyms excluded) */
export const MEANING_LANGS = Object.keys(LANGS).filter(k => k !== "sa" && WORDS.some(w => w.m?.[k]?.[0]));

// ── helpers ─────────────────────────────────────────────────────
export const shuffle = <T,>(a: T[]): T[] => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
export const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export const take = <T,>(a: T[], n: number): T[] => shuffle(a).slice(0, n);

/** first sense of a "a ; b ; c" meaning, kept short for buttons and cards */
export const firstSense = (t: string | undefined, max = 40) => {
  const s = String(t ?? "").split(/\s*;\s*/)[0].trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
};
export const wordMeaning = (w: Word, lang: string) => w.m?.[lang]?.[0] || w.m?.en?.[0] || "";
export const verbMeaning = (v: Verb, lang: string) => (v.m as Record<string, string | undefined>)[lang] || v.m.en || "";
/** a sentence's meaning in the chosen language (English when not yet translated) */
export const sentMeaning = (s: Sentence, lang: string) => s.m?.[lang] || s.en;
export const avyayaMeaning = (a: Avyaya, lang: string) => (lang === "hi" && a.hi) || (lang === "te" && a.te) || a.en;
/** the word as a child first meets it: prathamā ekavacana */
export const headForm = (w: Word) => w.d?.[0]?.[0] || w.w;
export const isDeva = (t: string) => /[ऀ-ॿ]/.test(t);

/** sentences whose words can be laid out as tiles */
export const tokens = (s: Sentence) => s.sa.trim().split(/\s+/);

import { romanize } from "../i18n/roman";
/** Latin reading of a sentence's meaning in `lang` ("" for Latin-script languages or when the meaning falls back to English) */
export const sentRoman = (s: Sentence, lang: string) => (s.m?.[lang] ? romanize(s.m[lang], lang, s.r?.[lang]) : "");
export const padyaRoman = (v: Padya, lang: string) => (v.m[lang] ? romanize(v.m[lang], lang, v.r?.[lang]) : "");

// ── व्याकरणम्: sandhi, samāsa, kṛt pratyayas, upasargas (tools/build_grammar.py) ──
export type SandhiEx = { a: string; b: string; r: string; scope: "int" | "ext" | "exc"; note: string; game: number };
export type SandhiRule = { id: string; group: "svara" | "vyanjana" | "agama" | "visarga"; name: string; en: string; sutra: string; what: string; ex: SandhiEx[] };
export type Samasa = { w: string; l: string; a: string; t: string; n: string; m: string };
export type KrtPratyaya = { p: string; it: string; rem: string; sutra: string; artha: string; kind: string };
/** one upasarga + root combination (data-source/21-upasarga). cat: b = बाधते, v = विशिनष्टि, a = अनुवर्तते */
export type UpasargaCombo = { id: string; u: string[]; rows: string[]; d: string; up: string; g: string; w: string; fin: boolean;
  cat: "b" | "v" | "a"; cg: string; m: Record<"sa" | "en" | "hi" | "te", string>; ex: string; src: string; note: string; att: string };
/** one taddhita suffix (data-source/04-taddhita). g = group key; ex.chk = how the form was checked (reviewers) */
export type TaddhitaPratyaya = { id: string; p: string; g: string; lv: string; it: string; rem: string; eff: string; sutra: string; num: string; vidh: string;
  m: Record<string, string>; rules: string[]; ex: { b: string; w: string; m: Record<string, string>; note: string; chk: string }[] };
export type Grammar = {
  sandhi: { definition: string; kinds: { name: string; en: string; ex: string }[]; not_sandhi: string; layers: { name: string; en: string; ex: string }[];
    questions: { q: string; en: string }[]; groups: Record<string, [string, string]>; rules: SandhiRule[]; stages: { title: string; steps: [string, string][]; note: string }[] };
  samasa: { definition: Record<string, string>; vigraha: { definition: string; types: { type: string; details: string }[] };
    occurrence: { title: string; types: { name: string; definition: string }[] }; count: { title: string; types: { name: string; definition: string; note?: string }[] };
    dominance: { title: string; details: string; types: { name: string; meaning_dominance: string; nature?: string; example_laukika?: string; sub_types?: (string | { name: string; condition: string })[] }[] };
    pos: { title: string; shloka: string; types: { combination: string; example: string }[] }; notes: Record<string, string>; ex: Samasa[] };
  pratyaya: { intro: string[]; list: KrtPratyaya[]; kinds: Record<string, [string, string]> };
  upasarga: { sloka: string; sloka_en: string; pada: string; cls: string; nature: string; count_note: string; three: [string, string, string][];
    verse2: string; verse2_en: string; hr: [string, string, string][];
    list: { u: string; en: string; ex: [string, string][]; sa: string[]; hi: string; te: string; phon: string; use: string }[];
    combos: UpasargaCombo[] };
  taddhita: { intro: string[]; groups: Record<string, [string, string]>; list: TaddhitaPratyaya[];
    /** the adhikāra map: heading sūtra s (number n), section from a to z, its suffixes p, sense en, examples ex */
    map: { s: string; n: string; a: string; z: string; p: string; en: string; ex: string }[];
    /** [pāda, first sūtra, last sūtra] from 4.1.76 to 5.4.160 */
    padas: [string, number, number][] };
};
export const GRAMMAR = grammarJson as unknown as Grammar;

// ── बोधः: प्रकृतिः प्रत्ययश्च · प्रक्रिया (tools/build_prakriya.py) ──
import prakriyaJson from "./prakriya.json";
export type Derivation = { w: string; en: string; steps: [string, string][] };
export const PRAKRIYA = prakriyaJson as unknown as {
  prakriti: Record<string, any>; prakriya: Record<string, any>; derivations: Derivation[]; fixes: [string, string, string][];
};

// ── साहित्यम्: अलङ्काराः and छन्दांसि (built by tools/build_sahitya.py; loaded when the tab opens) ──
export type L4 = { sa: string; en: string; te: string; hi: string };
export type Alankara = {
  id: string; name: { sa: string; iast: string; te: string; hi: string; en: string }; category: string;
  source_text: string;
  lakshana: { sloka_sa: string; meaning_sa: string; meaning_en: string; meaning_te: string; meaning_hi: string; source_reference: string };
  elements?: { element_sa: string; element_en: string; element_te: string; element_hi: string }[];
  types?: { type_name_sa: string; type_name_en: string; description_en: string; description_te: string; description_hi: string }[];
  primary_example: { sloka_sa: string; anvaya: string; bhaava_sa: string; bhaava_en: string; bhaava_te: string; bhaava_hi: string; source_reference: string };
  alankara_samanvaya: L4;
  anya_udaharanani?: { sloka_sa: string; source_reference: string; note_en: string }[];
  additional_examples?: { sloka_sa: string; source_reference: string; note_en?: string }[];
  kuvalayananda?: {
    status: string; note?: string; number?: number; name_sa?: string;
    printed_pages?: string | number; page_note?: string;
    karikas?: { karika_no: number; sloka_sa: string; printed_page?: number; role?: string; verification_note?: string }[];
    examples?: { sloka_sa: string; source_reference?: string; note_en?: string }[];
    corresponds_to?: { number: number; name_sa: string; printed_page?: number; status?: string }[];
  };
  shodhana_tippani?: string[];
};
export type Vritta = {
  id: string; name: { sa: string; iast: string; te: string; hi: string; en: string };
  chandas_class: { tier: number; name_sa: string; syllables_per_pada: number | string; total_syllables: number | string; metrical_type: string };
  gana_structure: { ganas_sa?: string; description_sa?: string; symbols?: string; symbols_pada_1_3?: string; symbols_pada_2_4?: string; symbols_odd?: string; symbols_even?: string };
  yati: { yati_sa: string; yati_en: string; yati_te: string; yati_hi: string };
  lakshana: { sloka_sa: string; source_reference: string; meaning_sa: string; meaning_en: string; meaning_te: string; meaning_hi: string };
  metre: import("../sahitya/scan").Metre;
  primary_example?: { sloka_sa: string; anvaya: string; source_reference: string; bhaava_sa: string; bhaava_en: string; bhaava_te: string; bhaava_hi: string };
  prastara_and_samanvaya?: L4;
  example_note?: { sa: string; en: string };
  vr_check?: { vr?: string; line?: string; en: string };
};
export type VRMetre = { vr: number; name: string; ganas: string; pattern: string; yati: string; line: string; scans: boolean; aliases?: string[]; note?: string; detail?: string };
export type ChandasClass = {
  n: number; name: string; alt: string; alt2: string; group: string; patterns: number; vrittas: VRMetre[];
  vedic?: { vedic_syllables: string; en: string; te: string; hi: string };
};
export type ChGroup = { sa: string; en: string; te: string; hi: string; note_en: string };
export type Gana = { id: string; name: { sa: string; en: string }; symbol: string; pattern: string; mnemonic: string };
export type Chandas = {
  framework: {
    etymology_and_definition: L4;
    laghu_guru_system: {
      definition_rule: { sloka_sa: string };
      laghu: { symbol: string; description_sa: string; description_en: string; description_te: string; description_hi: string };
      guru: { symbol: string; conditions: { condition_sa: string; condition_en: string; condition_te: string; condition_hi: string }[] };
    };
    ashta_ganas: Gana[];
    twenty_six_akshara_chandas_classes: { tier: number; name_sa: string; syllables_per_pada: number; example_vrittas: string }[];
  };
  vrittas: Vritta[];
  classes: ChandasClass[];
  groups: Record<string, ChGroup>;
  vedic_classes: { sa: string; en: string; counts: number[] }[]; vedic_classes_note: string;
  variants: { sa: string; en: string; d_en: string; d_te: string; d_hi: string }[]; variants_note: string;
  kinds: { sa: string; en: string; te: string; hi: string }[]; vr_defs: string[]; vr_names: string[];
  dandaka: { vr: number; name: string; ganas: string; line: string }[];
  jati: string[]; ardhasama: { name: string; ganas: string; pats: string[] }[]; vishama: string[];
  source: string;
};
export type AlankaraData = {
  title: string; description: string; total_alankaras: number; alankaras: Alankara[];
  kuvalayananda_integration: Record<string, unknown>; kuvalayananda_index: Record<string, unknown>[];
  references: unknown[];
};
let alankara: Promise<AlankaraData> | undefined;
let chandas: Promise<Chandas> | undefined;
export function loadAlankara() {
  alankara ??= fetch(alankaraUrl).then(r => { if (!r.ok) throw new Error(`Could not load the alaṅkāras (HTTP ${r.status}).`); return r.json() as Promise<AlankaraData>; });
  return alankara;
}
export function loadChandas() {
  chandas ??= fetch(chandasUrl).then(r => { if (!r.ok) throw new Error(`Could not load the metres (HTTP ${r.status}).`); return r.json(); });
  return chandas;
}
/** pick a 4-language field: obj[prefix+lang], falling back to English */
export const pick4 = (o: Record<string, unknown>, prefix: string, lang: string): string =>
  String(o[prefix + lang] ?? o[prefix + "en"] ?? "");
