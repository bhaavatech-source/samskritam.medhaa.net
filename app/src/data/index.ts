// ═══════════════════════════════════════════════════════════════
//  data/index.ts — the game's word, verb, kṛdanta, sentence and
//  avyaya data, with the labels used everywhere in the app.
//  The JSON files next to this one are generated from data-source/
//  (see tools/README.md). Do not hand-edit them; flag errors in the app.
// ═══════════════════════════════════════════════════════════════
import wordsJson from "./words.json";
import verbsJson from "./verbs.json";
import krtJson from "./krt.json";
import sentencesJson from "./sentences.json";
import avyayaJson from "./avyaya.json";
import errorsJson from "./errors.json";
import padacchedaJson from "./padaccheda.json";
import padyaJson from "./padya.json";
import grammarJson from "./grammar.json";

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
export const VERBS = verbsJson as unknown as Verb[];
export const KRT = krtJson as unknown as KrtRoot[];
export const SENTENCES = sentencesJson as unknown as Sentence[];
export const AVYAYA = (avyayaJson as unknown as { items: Avyaya[] }).items;
export const ERRORS = errorsJson as unknown as ErrorPair[];
export const PADACCHEDA = padacchedaJson as unknown as Padaccheda[];
export type KarakaRow = { word: string; role: string; vibhakti?: string; of?: string; note?: string };
export type Padya = { id: string; source: string; verse: string; padaccheda: string[]; anvaya: string; artha_sa: string;
  words: { word: string; form: string }[]; karaka: KarakaRow[]; notes: string[]; m: Record<string, string>; r?: Record<string, string> };
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
  lat: ["लट्", "present"], lan: ["लङ्", "past"], lot: ["लोट्", "command"], vidhilin: ["विधिलिङ्", "should / may"],
  lrt: ["लृट्", "future"], lut: ["लुट्", "future (a later day)"], lit: ["लिट्", "perfect (long ago)"],
  lun: ["लुङ्", "aorist past"], asirlin: ["आशीर्लिङ्", "blessing"], lrn: ["लृङ्", "conditional"],
};
export const LAKARA_ORDER = Object.keys(LAKARA);
export const PRAYOGA: Record<"P" | "A" | "K" | "B", [string, string]> = {
  P: ["परस्मैपदम्", "active"], A: ["आत्मनेपदम्", "active (middle)"], K: ["कर्मणि", "passive"], B: ["भावे", "impersonal"],
};
/** label for a verb grid: P holds the root's main kartari forms (ātmanepada for ātmanepadī roots) */
export const prayogaLabel = (v: Verb, key: "P" | "A" | "K" | "B"): [string, string] =>
  key === "P" && v.pada.startsWith("आत्मने") ? PRAYOGA.A : PRAYOGA[key];
export const LINGA: Record<string, [string, string]> = { m: ["पुंलिङ्गम्", "masculine"], f: ["स्त्रीलिङ्गम्", "feminine"], n: ["नपुंसकलिङ्गम्", "neuter"] };

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
export const wordMeaning = (w: Word, lang: string) =>
  String(w.m?.[lang]?.[0] || w.m?.en?.[0] || "").split(/\s*;\s*/)[0].trim();
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
export type Grammar = {
  sandhi: { definition: string; kinds: { name: string; en: string; ex: string }[]; not_sandhi: string; layers: { name: string; en: string; ex: string }[];
    questions: { q: string; en: string }[]; groups: Record<string, [string, string]>; rules: SandhiRule[]; stages: { title: string; steps: [string, string][]; note: string }[] };
  samasa: { definition: Record<string, string>; vigraha: { definition: string; types: { type: string; details: string }[] };
    occurrence: { title: string; types: { name: string; definition: string }[] }; count: { title: string; types: { name: string; definition: string; note?: string }[] };
    dominance: { title: string; details: string; types: { name: string; meaning_dominance: string; nature?: string; example_laukika?: string; sub_types?: (string | { name: string; condition: string })[] }[] };
    pos: { title: string; shloka: string; types: { combination: string; example: string }[] }; notes: Record<string, string>; ex: Samasa[] };
  pratyaya: { intro: string[]; list: KrtPratyaya[]; kinds: Record<string, [string, string]> };
  upasarga: { sloka: string; sloka_en: string; pada: string; cls: string; nature: string; three: [string, string, string][]; hr: [string, string, string][];
    list: { u: string; en: string; ex: [string, string][] }[] };
};
export const GRAMMAR = grammarJson as unknown as Grammar;
