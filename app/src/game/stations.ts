// ═══════════════════════════════════════════════════════════════
//  game/stations.ts — the यात्रा (journey): every station, in order
//  बालः → अध्येता → निपुणः. Questions are generated fresh on each play
//  from the data in src/data, so every play is different.
// ═══════════════════════════════════════════════════════════════
import {
  WORDS, VERBS, KRT, SENTENCES, AVYAYA, AVYAYA_CATS, ERRORS, PADACCHEDA, PADYA, GRAMMAR, padyaMeaning, padyaRoman, anvayaTokens, sentMeaning, sentRoman, VIBHAKTI, VIBHAKTI_EN, VACANA, VACANA_EN, PURUSHA, LAKARA, prayogaLabel, LINGA,
  shuffle, pick, take, firstSense, wordMeaning, verbMeaning, avyayaMeaning, headForm, tokens,
  type Word, type Verb, type Sentence, type VerbGrid,
} from "../data";
import type { FlagTarget } from "../flags";
import { nounGloss, verbGloss, krtGloss } from "../i18n/forms";

export type Region = "BAALA" | "ADHYETA" | "NIPUNA";
export const REGIONS: Record<Region, { name: string; en: string; who: string; color: string }> = {
  BAALA:   { name: "बालः",    en: "Bāla",    who: "First words, naming forms, present tense, little words", color: "#f97316" },
  ADHYETA: { name: "अध्येता", en: "Adhyetā", who: "All cases, pronouns, past & future, participles",       color: "#8b5cf6" },
  NIPUNA:  { name: "निपुणः",  en: "Nipuṇa",  who: "All ten lakāras, passive voice, every kṛdanta",          color: "#06b6d4" },
};

// ── question shapes ────────────────────────────────────────────
export type QuizItem = { mark?: string;
  prompt: string;              // big text at the top
  promptRoman?: string;        // IAST under it
  sentence?: string;           // a sentence with ___ (fill-the-blank)
  tags: string[];              // small chips: विभक्तिः, वचनम्…
  clue?: string;               // a line of help (meaning / gloss)
  ask: string;                 // the question
  options: string[];
  answer: string;
  optDeva: boolean;            // options in Devanāgarī (bigger font)
  also?: string;               // shown after answering (alternative form, pratyaya…)
  speak?: string;              // what 🔊 reads
  flag: FlagTarget;
};
export type MemoryPair = { a: string; b: string; aSub?: string; bSub?: string; bSa?: boolean };
/** a tile game: put the Sanskrit pieces in order */
export type BuildItem = { toks: string[]; show?: string; clue: string; clueR?: string; tags: string[]; ask: string; answer: string; speak: string; flag: FlagTarget };

type Base = { id: string; region: Region; title: string; en: string; icon: string; blurb: string; boss?: boolean; lives: number | null; hints: boolean };
export type QuizStation = Base & { kind: "quiz"; rounds: number; timeLimit?: number; items: (lang: string) => QuizItem[] };
export type MemoryStation = Base & { kind: "memory"; pairs: (lang: string) => MemoryPair[] };
export type BuildStation = Base & { kind: "build"; rounds: number; items: (lang: string) => BuildItem[] };
export type Station = QuizStation | MemoryStation | BuildStation;

// ── word pools ─────────────────────────────────────────────────
const NOUNS = WORDS.filter(w => w.cat === "noun");
const cut = WORDS.findIndex(w => w.w === "मरुत्");
/** the first school nouns: a/ā/i/ī/u/ṛ stems (राम … रत्न) */
const BAALA_NOUNS = NOUNS.filter(w => WORDS.indexOf(w) < (cut > 0 ? cut : 70));
const PRON_NUM = WORDS.filter(w => w.cat === "pronoun" || w.cat === "numeral");
const DECLINABLE = WORDS.filter(w => w.cat !== "participle");
const BAALA_KRT = ["क्त्वा", "ल्यप्", "तुमुन्", "शतृ", "क्त", "क्तवतु", "तव्यत्", "अनीयर्", "ल्युट्"];
const AVY = new Set(AVYAYA.map(a => a.sa));

// ── helpers ────────────────────────────────────────────────────
/** the right answer plus up to three different wrong ones */
function options(answer: string, pool: string[], n = 4): string[] {
  const out = [answer]; const seen = new Set(out);
  for (const p of shuffle(pool)) { if (out.length >= n) break; if (p && !seen.has(p)) { seen.add(p); out.push(p); } }
  return shuffle(out);
}
function repeat<T>(n: number, make: () => T | null): T[] {
  const out: T[] = []; let guard = 0;
  while (out.length < n && guard++ < n * 30) { const x = make(); if (x) out.push(x); }
  return out;
}
const lingaTag = (w: Word) => LINGA[w.g]?.[0] ?? w.cat;

// ── question makers ────────────────────────────────────────────
const meaningQ = (pool: Word[], lang: string) => (): QuizItem | null => {
  const w = pick(pool);
  const ans = firstSense(wordMeaning(w, lang));
  if (!ans) return null;
  return {
    prompt: headForm(w), promptRoman: w.iast, tags: [lingaTag(w)], ask: "इत्यस्य अर्थः कः? · What does it mean?",
    options: options(ans, pool.filter(x => x !== w).map(x => firstSense(wordMeaning(x, lang)))), answer: ans, optDeva: false, speak: headForm(w),
    flag: { kind: "word", id: w.id, field: "meaning:" + lang, value: wordMeaning(w, lang), where: `${w.w} — meaning (${lang})` },
  };
};

const formQ = (pool: Word[], vibs: number[], lang: string) => (): QuizItem | null => {
  const w = pick(pool);
  const cells: [number, number, string][] = [];
  w.d.forEach((row, n) => row.forEach((f, v) => { if (f) cells.push([n, v, f]); }));
  const ok = cells.filter(c => vibs.includes(c[1]));
  if (!ok.length || cells.length < 4) return null;
  const [n, v, f] = pick(ok);
  const pre = v === 7 ? "हे " : "";
  const opts = options(f, cells.map(c => c[2]));
  if (opts.length < 3) return null;
  return {
    prompt: w.w, promptRoman: w.iast, tags: [lingaTag(w), VIBHAKTI[v], VACANA[n]],
    clue: `“${nounGloss(w, v, n, lang)}” · ${VIBHAKTI_EN[v]}, ${VACANA_EN[n]}`,
    ask: "किं रूपम्? · Which form?", options: opts.map(o => pre + o), answer: pre + f, optDeva: true, speak: pre + f,
    flag: { kind: "word", id: w.id, field: `d:${v},${n}`, value: f, where: `${w.w} — ${VIBHAKTI[v]} ${VACANA[n]}` },
  };
};

const gridOf = (v: Verb, key: "P" | "A" | "K" | "B"): VerbGrid | undefined => v[key];
const verbQ = (lakaras: string[], prayoga: "kartari" | "karmani", lang: string) => (): QuizItem | null => {
  const v = pick(VERBS);
  const key = prayoga === "karmani" ? "K" : (v.P ? "P" : "A");
  const grid = gridOf(v, key);
  if (!grid) return null;
  const lk = pick(lakaras.filter(l => grid[l]));
  if (!lk) return null;
  const cells: [number, number, NonNullable<VerbGrid[string][0][0]>][] = [];
  grid[lk].forEach((row, p) => row.forEach((c, n) => { if (c && c[0]) cells.push([p, n, c]); }));
  if (cells.length < 4) return null;
  const [p, n, c] = pick(cells);
  return {
    prompt: v.w, promptRoman: v.iast, tags: [prayogaLabel(v, key)[0], `${LAKARA[lk][0]} · ${LAKARA[lk][1]}`, PURUSHA[p], VACANA[n]],
    clue: `“${verbGloss(v, key, lk, p, n, lang, c[2])}”`,
    ask: "किं रूपम्? · Which form?", options: options(c[0], cells.map(x => x[2][0])), answer: c[0], optDeva: true, speak: c[0],
    also: c[1] ? `अपि साधु · Also correct: ${c[1]}` : undefined,
    flag: { kind: "verb", id: v.id, field: `${key}:${lk}:${p},${n}`, value: c[0], where: `${v.w} — ${prayogaLabel(v, key)[0]} ${LAKARA[lk][0]} ${PURUSHA[p]} ${VACANA[n]}` },
  };
};

const rootMeaningQ = (lang: string) => (): QuizItem | null => {
  const v = pick(VERBS);
  const ans = verbMeaning(v, lang);
  return {
    prompt: v.w, promptRoman: v.iast, tags: [v.gana.split(" ")[0], v.pada], clue: `${v.artha}`,
    ask: "धातोः अर्थः कः? · What does this root mean?", options: options(ans, VERBS.filter(x => x !== v).map(x => verbMeaning(x, lang))),
    answer: ans, optDeva: false, speak: v.w,
    flag: { kind: "verb", id: v.id, field: "meaning:" + lang, value: ans, where: `${v.w} — meaning` },
  };
};

const krtQ = (keys: string[] | null, lang = "en") => (): QuizItem | null => {
  const r = pick(KRT);
  const ks = (keys ?? Object.keys(r.f)).filter(k => r.f[k]?.[0]);
  if (ks.length < 4) return null;
  const k = pick(ks); const [form, enGloss] = r.f[k];
  const v = VERBS.find(x => x.w === r.w);
  const gloss = krtGloss(k, lang, enGloss, v ? verbMeaning(v, lang) : r.en, r.w);
  return {
    prompt: r.w, tags: [r.gana.split(" ")[0]], clue: `${r.en}`,
    ask: `“${gloss}” — किं पदम्? · Which word?`, options: options(form, ks.map(x => r.f[x][0])), answer: form, optDeva: true, speak: form,
    also: `प्रत्ययः · suffix: ${k}`,
    flag: { kind: "krt", id: r.id, field: k, value: form, where: `${r.w} + ${k}` },
  };
};

/** sentences with one avyaya blanked out */
const AVY_SENTS = SENTENCES.map(s => {
  const toks = tokens(s); if (toks.length < 2) return null;
  const i = toks.findIndex(t => AVY.has(t.replace(/[।॥?!,.]/g, "")) && t.replace(/[।॥?!,.]/g, "") !== "नाम");
  return i < 0 ? null : { s, toks, i, word: toks[i].replace(/[।॥?!,.]/g, "") };
}).filter(Boolean) as { s: Sentence; toks: string[]; i: number; word: string }[];

const avyayaFillQ = () => (): QuizItem | null => {
  const x = pick(AVY_SENTS);
  const a = AVYAYA.find(v => v.sa === x.word)!;
  const same = AVYAYA.filter(v => v.cat !== a.cat).map(v => v.sa);
  const punct = x.toks[x.i].slice(x.word.length);
  return {
    prompt: "", sentence: x.toks.map((t, j) => j === x.i ? "___" + punct : t).join(" "), tags: [AVYAYA_CATS[a.cat]?.[0] ?? a.cat],
    clue: `“${x.s.en}”`, ask: "रिक्तस्थानं पूरय · Fill the blank", options: options(x.word, same), answer: x.word, optDeva: true, speak: x.s.sa,
    flag: { kind: "sentence", id: x.s.id, field: "sa", value: x.s.sa, where: `${x.s.id} — sentence` },
  };
};

const avyayaQ = (lang: string) => (): QuizItem | null => {
  const a = pick(AVYAYA); const ans = avyayaMeaning(a, lang);
  return {
    prompt: a.sa, tags: [AVYAYA_CATS[a.cat]?.[0] ?? a.cat], ask: "अर्थः कः? · What does it mean?",
    options: options(ans, AVYAYA.filter(x => x !== a).map(x => avyayaMeaning(x, lang))), answer: ans, optDeva: false, speak: a.sa,
    flag: { kind: "avyaya", id: a.sa, field: "meaning:" + lang, value: ans, where: `${a.sa} — meaning` },
  };
};

const mix = (n: number, makers: (() => QuizItem | null)[]) => repeat(n, () => pick(makers)());
const buildItems = (n: number, min: number, max: number, lang: string): BuildItem[] =>
  take(SENTENCES.filter(s => { const k = tokens(s).length; return k >= min && k <= max; }), n).map(s => ({
    toks: tokens(s), clue: sentMeaning(s, lang), clueR: sentRoman(s, lang), tags: [s.cat_sa], ask: "वाक्यं रचय · Tap the words in the right order",
    answer: s.sa, speak: s.sa, flag: { kind: "sentence", id: s.id, field: "sa", value: s.sa, where: `${s.id} — sentence` },
  }));
/** पदच्छेदः: the śloka is shown, the words are tiles */
const padacchedaItems = (n: number, maxWords: number): BuildItem[] =>
  take(PADACCHEDA.filter(p => p.padas.length <= maxWords), n).map(p => ({
    toks: p.padas, show: p.sloka, clue: "", tags: ["पदच्छेदः"], ask: "पदच्छेदं कुरु · Split the śloka: tap its words in order",
    answer: p.padas.join(" "), speak: p.sloka, flag: { kind: "sentence", id: p.id, field: "padaccheda", value: p.padas.join(", "), where: `${p.id} — padaccheda` },
  }));
/** अन्वयः: put the verse's words into prose order */
const anvayaItems = (n: number, lang: string): BuildItem[] =>
  // RV 1.5–1.8 are lists of genitives whose order is free, so they are not used as puzzles
  take(PADYA.verses.filter(v => v.anvaya && !/^RV-1\.[5-8]$/.test(v.id) && anvayaTokens(v).length <= 14), n).map(v => ({
    toks: anvayaTokens(v), show: v.verse, clue: padyaMeaning(v, lang), clueR: padyaRoman(v, lang), tags: ["अन्वयः", v.source], ask: "अन्वयं कुरु · Put the words in prose order (anvaya)",
    answer: anvayaTokens(v).join(" "), speak: v.anvaya, flag: { kind: "sentence", id: v.id, field: "anvaya", value: v.anvaya, where: `${v.id} — anvaya` },
  }));
/** कारकम्: which role does this word play in the verse? */
const KARAKA_CORE = ["कर्ता", "कर्म", "करणम्", "सम्प्रदानम्", "अपादानम्", "अधिकरणम्"];
const karakaQ = () => (): QuizItem | null => {
  const rows = PADYA.verses.flatMap(v => v.karaka.filter(k => KARAKA_CORE.includes(k.role) && k.word.length < 30).map(k => ({ v, k })));
  const { v, k } = pick(rows);
  return {
    prompt: k.word, mark: k.word, sentence: v.anvaya, tags: ["कारकम्", v.source], clue: "",
    ask: "अस्य पदस्य किं कारकम्? · What role does this word play in the verse?", options: shuffle([k.role, ...take(KARAKA_CORE.filter(r => r !== k.role), 3)]),
    answer: k.role, optDeva: true, speak: k.word,
    flag: { kind: "sentence", id: v.id, field: "karaka", value: `${k.word} = ${k.role}`, where: `${v.id} — kāraka` },
  };
};
// ── व्याकरणम् ─────────────────────────────────────────────────
/** सन्धिः: which sandhi joined these two? */
const sandhiQ = (groups: string[]) => (): QuizItem | null => {
  const rules = GRAMMAR.sandhi.rules.filter(r => groups.includes(r.group) && r.ex.some(e => e.game));
  const r = pick(rules); const e = pick(r.ex.filter(x => x.game));
  const others = shuffle(GRAMMAR.sandhi.rules.filter(x => x.id !== r.id && groups.includes(x.group))).slice(0, 3).map(x => x.name);
  return {
    prompt: e.r, sentence: `${e.a} + ${e.b} → ${e.r}`, tags: [GRAMMAR.sandhi.groups[r.group][0], e.scope === "int" ? "अन्तरङ्गः" : "बहिरङ्गः"], clue: "",
    ask: "कः सन्धिः? · Which sandhi joined them?", options: shuffle([r.name, ...others]), answer: r.name, optDeva: true, speak: e.r,
    also: `${r.sutra} — ${r.what}`,
    flag: { kind: "grammar", id: `sandhi:${r.id}`, field: "example", value: `${e.a} + ${e.b} = ${e.r}`, where: `${r.name} — example` },
  };
};
/** सन्धिविच्छेदः: split the joined form */
const splitQ = () => (): QuizItem | null => {
  const all = GRAMMAR.sandhi.rules.flatMap(r => r.ex.filter(e => e.game).map(e => ({ r, e })));
  const { r, e } = pick(all);
  const same = all.filter(x => x.e.a === e.a && x.e.b !== e.b).map(x => `${x.e.a} + ${x.e.b}`);
  // wrong splits: the same pieces with the vowel/visarga change undone the wrong way
  const wrong = new Set<string>(same);
  const tweak: [RegExp, string][] = [[/ा$/, ""], [/ः$/, ""], [/([^ःं्])$/, "$1ः"], [/्$/, ""], [/ि$/, "ी"], [/ी$/, "ि"], [/ु$/, "ू"], [/े$/, ""]];
  for (const [re, to] of shuffle(tweak)) { const a2 = e.a.replace(re, to); if (a2 !== e.a) wrong.add(`${a2} + ${e.b}`); }
  for (const [re, to] of [[/^अ/, "आ"], [/^आ/, "अ"], [/^इ/, "ई"], [/^उ/, "ऊ"], [/^ए/, "इ"]] as [RegExp, string][]) { const b2 = e.b.replace(re, to); if (b2 !== e.b) wrong.add(`${e.a} + ${b2}`); }
  const ans = `${e.a} + ${e.b}`; wrong.delete(ans);
  for (const w of [...wrong]) if (/ःः|््|ाा/.test(w)) wrong.delete(w);
  const opts = shuffle([...wrong]).slice(0, 3); if (opts.length < 2) return null;
  return {
    prompt: e.r, tags: ["सन्धिविच्छेदः", r.name], clue: "",
    ask: "विच्छेदं कुरु · Which two pieces were joined?", options: shuffle([ans, ...opts]), answer: ans, optDeva: true, speak: e.r,
    also: `${r.name} · ${r.sutra}`,
    flag: { kind: "grammar", id: `sandhi:${r.id}`, field: "example", value: `${e.a} + ${e.b} = ${e.r}`, where: `${r.name} — example` },
  };
};
/** समासः: which of the four kinds? */
const MAJORS = ["अव्ययीभावः", "तत्पुरुषः", "द्वन्द्वः", "बहुव्रीहिः"];
const samasaQ = () => (): QuizItem | null => {
  const e = pick(GRAMMAR.samasa.ex.filter(x => MAJORS.includes(x.m) && x.t !== "एकशेषः"));
  return {
    prompt: e.w, tags: ["समासः"], clue: `विग्रहः: ${e.l}`,
    ask: "कः समासः? · Which kind of compound?", options: MAJORS, answer: e.m, optDeva: true, speak: e.w,
    also: `${e.t}${e.a ? " · " + e.a : ""}`,
    flag: { kind: "grammar", id: `samasa:${e.w}`, field: "type", value: `${e.w} = ${e.t}`, where: `${e.w} — samāsa` },
  };
};
/** तत्पुरुषभेदः: which kind of tatpuruṣa? */
const TP = ["द्वितीयातत्पुरुषः", "तृतीयातत्पुरुषः", "चतुर्थीतत्पुरुषः", "पञ्चमीतत्पुरुषः", "षष्ठीतत्पुरुषः", "सप्तमीतत्पुरुषः", "नञ्तत्पुरुषः", "कर्मधारयः", "उपपदसमासः"];
const tatpurushaQ = () => (): QuizItem | null => {
  const e = pick(GRAMMAR.samasa.ex.filter(x => TP.includes(x.t)));
  return {
    prompt: e.w, tags: ["तत्पुरुषः"], clue: `विग्रहः: ${e.l}`,
    ask: "कः तत्पुरुषः? · Which kind of tatpuruṣa?", options: options(e.t, TP), answer: e.t, optDeva: true, speak: e.w,
    also: e.a + (e.n ? ` — ${e.n}` : ""),
    flag: { kind: "grammar", id: `samasa:${e.w}`, field: "type", value: `${e.w} = ${e.t}`, where: `${e.w} — samāsa` },
  };
};
/** विग्रहः: compound ↔ its vigraha */
const vigrahaPairs = (): MemoryPair[] => take(GRAMMAR.samasa.ex.filter(x => x.l.length < 26 && x.w.length < 14 && x.t !== "एकशेषः"), 6).map(e => ({ a: e.w, b: e.l, bSa: true }));
/** कृत्प्रत्ययः: which suffix made this word? */
const pratyayaQ = () => (): QuizItem | null => {
  const r = pick(KRT); const ks = Object.keys(r.f).filter(k => r.f[k]?.[0]); if (ks.length < 4) return null;
  const k = pick(ks); const form = r.f[k][0];
  const forms = new Set(ks.filter(x => r.f[x][0] === form)); if (forms.size > 1) return null;   // e.g. यत्/ण्यत् giving the same word
  const pr = GRAMMAR.pratyaya.list.find(x => x.p === k);
  return {
    prompt: form, tags: [r.w], clue: `${r.w} + ?`,
    ask: "कः प्रत्ययः? · Which kṛt suffix made this word?", options: options(k, ks), answer: k, optDeva: true, speak: form,
    also: pr ? `${pr.p} → ${pr.rem} · ${pr.sutra} — ${pr.artha}` : k,
    flag: { kind: "krt", id: r.id, field: k, value: form, where: `${r.w} + ${k}` },
  };
};

/** अशुद्धिशोधनम्: which sentence is correct? */
const errorQ = () => (): QuizItem | null => {
  const e = pick(ERRORS);
  return {
    prompt: "", sentence: e.wrong.replace(/\s*[।?]\s*$/, "") + " ।", tags: ["अशुद्धिशोधनम्"], clue: "This sentence has a mistake.",
    ask: "शुद्धं वाक्यं किम्? · Which is the correct sentence?", options: shuffle([e.right, e.wrong]), answer: e.right, optDeva: true, speak: e.right,
    flag: { kind: "sentence", id: e.id, field: "error-pair", value: `${e.wrong} → ${e.right}`, where: `${e.id} — error correction` },
  };
};

// ── the journey ────────────────────────────────────────────────
export const STATIONS: Station[] = [
  // ───────────── बालः ─────────────
  { id: "b1", region: "BAALA", kind: "memory", title: "शब्दाः", en: "Words & meanings", icon: "🌸", lives: null, hints: false,
    blurb: "Flip the cards and match each Sanskrit word with its meaning.",
    pairs: lang => take(BAALA_NOUNS.filter(w => wordMeaning(w, lang)), 6).map(w => ({ a: headForm(w), b: firstSense(wordMeaning(w, lang), 22) })) },
  { id: "b2", region: "BAALA", kind: "quiz", title: "शब्दार्थः", en: "Word meanings", icon: "📖", lives: 3, hints: true, rounds: 8,
    blurb: "See a word, pick its meaning. Tap 🔊 to hear it.",
    items: lang => repeat(8, meaningQ(BAALA_NOUNS, lang)) },
  { id: "b3", region: "BAALA", kind: "quiz", title: "प्रथमा विभक्तिः", en: "Naming forms", icon: "🌿", lives: 3, hints: true, rounds: 8,
    blurb: "One, two, many: रामः, रामौ, रामाः. Pick the right naming (प्रथमा) form.",
    items: lang => repeat(8, formQ(BAALA_NOUNS, [0], lang)) },
  { id: "b4", region: "BAALA", kind: "memory", title: "वचनानि", en: "One and many", icon: "✨", lives: null, hints: false,
    blurb: "Match each word (one) with its plural (many): बालकः ↔ बालकाः.",
    pairs: () => take(BAALA_NOUNS.filter(w => w.d[2]?.[0]), 6).map(w => ({ a: w.d[0][0], b: w.d[2][0], aSub: "एकम्", bSub: "बहूनि", bSa: true })) },
  { id: "b5", region: "BAALA", kind: "quiz", title: "शब्दरूपाणि", en: "Noun forms", icon: "🧩", lives: 3, hints: true, rounds: 8,
    blurb: "रामेण, रामाय, रामस्य… pick the form for the case and number shown.",
    items: lang => repeat(8, formQ(BAALA_NOUNS, [0, 1, 2, 3, 4, 5, 6], lang)) },
  { id: "b6", region: "BAALA", kind: "quiz", title: "धात्वर्थः", en: "Verb roots", icon: "🌱", lives: 3, hints: true, rounds: 8,
    blurb: "गम्, पठ्, लिख्… pick what each root means.",
    items: lang => repeat(8, rootMeaningQ(lang)) },
  { id: "b7", region: "BAALA", kind: "quiz", title: "लट्-लकारः", en: "Present tense", icon: "🔥", lives: 3, hints: true, rounds: 8,
    blurb: "भवति, भवतः, भवन्ति… pick the present-tense form for the person and number.",
    items: lang => repeat(8, verbQ(["lat"], "kartari", lang)) },
  { id: "b8", region: "BAALA", kind: "memory", title: "अव्ययानि", en: "Little words", icon: "🔗", lives: null, hints: false,
    blurb: "कुत्र, कदा, अत्र… words that never change. Match each with its meaning.",
    pairs: lang => take(AVYAYA, 6).map(a => ({ a: a.sa, b: firstSense(avyayaMeaning(a, lang), 22) })) },
  { id: "b9", region: "BAALA", kind: "build", title: "वाक्यरचना", en: "Build sentences", icon: "💬", lives: 3, hints: true, rounds: 6,
    blurb: "Read the meaning, then tap the words in the right order to make the Sanskrit sentence.",
    items: lang => buildItems(6, 3, 3, lang) },
  { id: "b10", region: "BAALA", kind: "quiz", title: "बाल-परीक्षा", en: "Bāla challenge", icon: "👑", boss: true, lives: 3, hints: true, rounds: 10, timeLimit: 30,
    blurb: "A bit of everything from बालः — against the clock.",
    items: lang => mix(10, [meaningQ(BAALA_NOUNS, lang), formQ(BAALA_NOUNS, [0, 1, 2, 3, 4, 5, 6], lang), verbQ(["lat"], "kartari", lang), avyayaQ(lang)]) },

  // ───────────── अध्येता ─────────────
  { id: "a1", region: "ADHYETA", kind: "quiz", title: "लङ्-लोट्-लृट्", en: "Past, command, future", icon: "🕰️", lives: 3, hints: true, rounds: 8,
    blurb: "अभवत्, भवतु, भविष्यति — past, command and future forms.",
    items: lang => repeat(8, verbQ(["lan", "lot", "lrt"], "kartari", lang)) },
  { id: "a2", region: "ADHYETA", kind: "quiz", title: "सर्वविभक्तयः", en: "All eight cases", icon: "🎯", lives: 3, hints: true, rounds: 8,
    blurb: "Every case, including सम्बोधनम् (हे …), for all kinds of nouns.",
    items: lang => repeat(8, formQ(NOUNS, [0, 1, 2, 3, 4, 5, 6, 7], lang)) },
  { id: "a3", region: "ADHYETA", kind: "quiz", title: "सर्वनामानि", en: "Pronouns & numbers", icon: "🔢", lives: 3, hints: true, rounds: 8,
    blurb: "सः, सा, तत्, अहम्, त्वम्, एकः, द्वौ… pick the right form.",
    items: lang => repeat(8, formQ(PRON_NUM, [0, 1, 2, 3, 4, 5, 6], lang)) },
  { id: "a4", region: "ADHYETA", kind: "quiz", title: "कृदन्तानि", en: "Participles", icon: "🌾", lives: 3, hints: true, rounds: 8,
    blurb: "गत्वा (having gone), गन्तुम् (to go), गतः (gone)… pick the word for the meaning.",
    items: lang => repeat(8, krtQ(BAALA_KRT, lang)) },
  { id: "a5", region: "ADHYETA", kind: "quiz", title: "अव्ययपूरणम्", en: "Fill the little word", icon: "🧷", lives: 3, hints: true, rounds: 8,
    blurb: "A sentence is missing its अव्यय. Pick the word that fits.",
    items: () => repeat(8, avyayaFillQ()) },
  { id: "a6", region: "ADHYETA", kind: "build", title: "दीर्घवाक्यानि", en: "Longer sentences", icon: "🧱", lives: 3, hints: true, rounds: 6,
    blurb: "Four-word sentences — word order and endings both matter.",
    items: lang => buildItems(6, 4, 8, lang) },
  { id: "a6b", region: "ADHYETA", kind: "quiz", title: "अशुद्धिशोधनम्", en: "Spot the mistake", icon: "🔍", lives: 3, hints: false, rounds: 8,
    blurb: "Two sentences, one has a mistake in number, gender, person, tense or case. Pick the correct one.",
    items: () => repeat(8, errorQ()) },
  { id: "a8", region: "ADHYETA", kind: "quiz", title: "स्वरसन्धिः", en: "Vowel sandhi", icon: "🔗", lives: 3, hints: true, rounds: 8,
    blurb: "दधि + अत्र → दध्यत्र. See two words joined, name the sandhi: यण्, गुण, वृद्धि, दीर्घ…",
    items: () => repeat(8, sandhiQ(["svara"])) },
  { id: "a9", region: "ADHYETA", kind: "quiz", title: "समासः", en: "Four kinds of compound", icon: "🧩", lives: 3, hints: true, rounds: 8,
    blurb: "राजपुरुषः, उपकृष्णम्, रामलक्ष्मणौ, पीताम्बरः — read the vigraha and say which of the four it is.",
    items: () => repeat(8, samasaQ()) },
  { id: "a10", region: "ADHYETA", kind: "memory", title: "विग्रहः", en: "Compound & its vigraha", icon: "🪢", lives: null, hints: false,
    blurb: "Match each compound with the phrase it stands for.",
    pairs: () => vigrahaPairs() },
  { id: "a7", region: "ADHYETA", kind: "quiz", title: "अध्येतृ-परीक्षा", en: "Adhyetā challenge", icon: "👑", boss: true, lives: 3, hints: true, rounds: 10, timeLimit: 30,
    blurb: "Cases, pronouns, tenses and participles — against the clock.",
    items: lang => mix(10, [formQ(NOUNS, [0, 1, 2, 3, 4, 5, 6, 7], lang), formQ(PRON_NUM, [0, 1, 2, 3, 4, 5, 6], lang), verbQ(["lan", "lot", "lrt"], "kartari", lang), krtQ(BAALA_KRT, lang), avyayaFillQ()]) },

  // ───────────── निपुणः ─────────────
  { id: "n1", region: "NIPUNA", kind: "quiz", title: "दशलकाराः", en: "All ten lakāras", icon: "🌀", lives: 3, hints: true, rounds: 8,
    blurb: "लिट्, लुङ्, आशीर्लिङ्, लृङ्… every tense and mood.",
    items: lang => repeat(8, verbQ(["vidhilin", "lut", "lit", "lun", "asirlin", "lrn"], "kartari", lang)) },
  { id: "n2", region: "NIPUNA", kind: "quiz", title: "कर्मणिप्रयोगः", en: "Passive voice", icon: "🔄", lives: 3, hints: true, rounds: 8,
    blurb: "पठ्यते, लिख्यते, क्रियते — the passive (कर्मणि) forms.",
    items: lang => repeat(8, verbQ(["lat", "lan", "lot", "vidhilin", "lrt"], "karmani", lang)) },
  { id: "n3", region: "NIPUNA", kind: "quiz", title: "सर्वकृदन्तानि", en: "Every kṛdanta", icon: "🧬", lives: 3, hints: true, rounds: 8,
    blurb: "All twenty suffixes: णमुल्, ण्वुल्, तृच्, घञ्, क्तिन्…",
    items: lang => repeat(8, krtQ(null, lang)) },
  { id: "n3b", region: "NIPUNA", kind: "build", title: "पदच्छेदः", en: "Split the śloka", icon: "📜", lives: 3, hints: true, rounds: 5,
    blurb: "Rāmāyaṇa ślokas with sandhi. Undo the sandhi: tap each word in the right order.",
    items: () => padacchedaItems(5, 12) },
  { id: "n3c", region: "NIPUNA", kind: "build", title: "अन्वयः", en: "Verse to prose order", icon: "🪶", lives: 3, hints: true, rounds: 5,
    blurb: "Kālidāsa and Vālmīki: arrange a verse's words in prose (anvaya) order — verb, doer, object and their qualifiers.",
    items: lang => anvayaItems(5, lang) },
  { id: "n3d", region: "NIPUNA", kind: "quiz", title: "कारकम्", en: "Roles in a verse", icon: "🎯", lives: 3, hints: true, rounds: 8,
    blurb: "In a real verse, who does it, to what, with what, for whom, from where, in what? Name the kāraka.",
    items: () => repeat(8, karakaQ()) },
  { id: "n5", region: "NIPUNA", kind: "quiz", title: "सर्वसन्धयः", en: "Every sandhi", icon: "⛓️", lives: 3, hints: true, rounds: 8,
    blurb: "Vowel, consonant and visarga sandhi: श्चुत्व, ष्टुत्व, अनुस्वार, सत्व, रुत्व…",
    items: () => mix(8, [sandhiQ(["svara", "vyanjana", "agama", "visarga"]), sandhiQ(["vyanjana", "visarga"])]) },
  { id: "n6", region: "NIPUNA", kind: "quiz", title: "सन्धिविच्छेदः", en: "Split the sandhi", icon: "✂️", lives: 3, hints: true, rounds: 8,
    blurb: "गङ्गोदकम् = गङ्गा + उदकम्. Find the two pieces that were joined.",
    items: () => repeat(8, splitQ()) },
  { id: "n7", region: "NIPUNA", kind: "quiz", title: "तत्पुरुषभेदाः", en: "Kinds of tatpuruṣa", icon: "🧬", lives: 3, hints: true, rounds: 8,
    blurb: "द्वितीया to सप्तमी, नञ्, कर्मधारय, उपपद: name the tatpuruṣa from its vigraha.",
    items: () => repeat(8, tatpurushaQ()) },
  { id: "n8", region: "NIPUNA", kind: "quiz", title: "कृत्प्रत्ययः", en: "Which suffix?", icon: "🏷️", lives: 3, hints: true, rounds: 8,
    blurb: "गन्तुम्, गत्वा, गतः, गमनम्… — which kṛt suffix made the word?",
    items: () => repeat(8, pratyayaQ()) },
  { id: "n4", region: "NIPUNA", kind: "quiz", title: "निपुण-परीक्षा", en: "Nipuṇa challenge", icon: "👑", boss: true, lives: 2, hints: false, rounds: 10, timeLimit: 25,
    blurb: "The final test: any form of any word or root. Two lives, no hints.",
    items: lang => mix(10, [formQ(DECLINABLE, [0, 1, 2, 3, 4, 5, 6, 7], lang), verbQ(Object.keys(LAKARA), "kartari", lang), verbQ(["lat", "lrt"], "karmani", lang), krtQ(null, lang)]) },
];
