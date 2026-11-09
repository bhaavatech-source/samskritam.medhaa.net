// ═══════════════════════════════════════════════════════════════
//  i18n/roman.ts — Latin-letter reading of a meaning, so a learner can
//  pronounce the Telugu / Arabic / Japanese… line, not only see it.
//  • Indic scripts (hi mr bn or te kn ta ml): rule-based, ISO 15919 style
//    (ē/ō long, e/o short in Dravidian languages; Hindi/Marathi drop the
//    silent inherent "a" the way they are spoken: रामों को → rāmoṁ ko).
//  • Russian: everyday Latin spelling (zh, kh, ts, ch, sh, shch, yu, ya).
//  • Korean: Revised Romanization with linking and nasal assimilation.
//  • Arabic, Chinese, Japanese cannot be read by rule (no short vowels /
//    no phonetic script), so their readings are written by hand in
//    data-source/11-romanization and passed in as `given`.
// ═══════════════════════════════════════════════════════════════

import { ZH_WORDS, JA_KANJI, AR_WORDS } from "./romanDict";

/** readings registered by generators (kṛdanta meanings in ar/zh/ja): key = lang + "\0" + text */
export const READINGS = new Map<string, string>();

export const ROMAN_LANGS = new Set(["hi", "mr", "bn", "or", "te", "kn", "ta", "ml", "ru", "ko", "ar", "zh", "ja"]);
const DRAVIDIAN = new Set(["te", "kn", "ta", "ml"]);

// ── Indic ────────────────────────────────────────────────────────
const BASE: Record<string, number> = { hi: 0x0900, mr: 0x0900, bn: 0x0980, or: 0x0b00, ta: 0x0b80, te: 0x0c00, kn: 0x0c80, ml: 0x0d00 };
const V: Record<number, string> = { 0x05: "a", 0x06: "ā", 0x07: "i", 0x08: "ī", 0x09: "u", 0x0a: "ū", 0x0b: "r̥", 0x60: "r̥̄", 0x0c: "l̥",
  0x0e: "e", 0x0f: "ē", 0x10: "ai", 0x12: "o", 0x13: "ō", 0x14: "au", 0x11: "ô", 0x0d: "ê" };
const M: Record<number, string> = { 0x3e: "ā", 0x3f: "i", 0x40: "ī", 0x41: "u", 0x42: "ū", 0x43: "r̥", 0x44: "r̥̄", 0x46: "e", 0x47: "ē", 0x48: "ai",
  0x4a: "o", 0x4b: "ō", 0x4c: "au", 0x57: "au", 0x49: "ô", 0x45: "ê" };
const C: Record<number, string> = { 0x15: "k", 0x16: "kh", 0x17: "g", 0x18: "gh", 0x19: "ṅ", 0x1a: "c", 0x1b: "ch", 0x1c: "j", 0x1d: "jh", 0x1e: "ñ",
  0x1f: "ṭ", 0x20: "ṭh", 0x21: "ḍ", 0x22: "ḍh", 0x23: "ṇ", 0x24: "t", 0x25: "th", 0x26: "d", 0x27: "dh", 0x28: "n", 0x29: "ṉ",
  0x2a: "p", 0x2b: "ph", 0x2c: "b", 0x2d: "bh", 0x2e: "m", 0x2f: "y", 0x30: "r", 0x31: "ṟ", 0x32: "l", 0x33: "ḷ", 0x34: "ḻ", 0x35: "v",
  0x36: "ś", 0x37: "ṣ", 0x38: "s", 0x39: "h", 0x5f: "y", 0x5c: "ṛ", 0x5d: "ṛh", 0x58: "q", 0x59: "x", 0x5a: "ġ", 0x5b: "z", 0x5e: "f", 0x71: "y" };
const NUKTA: Record<string, string> = { "ḍ": "ṛ", "ḍh": "ṛh", "k": "q", "kh": "x", "g": "ġ", "j": "z", "ph": "f", "y": "y" };
const CHILLU: Record<string, string> = { "ൺ": "ṇ", "ൻ": "n", "ർ": "r", "ൽ": "l", "ൾ": "ḷ", "ൿ": "k", "ൔ": "m", "ൕ": "y", "ൖ": "ḻ" };

type Syl = { c: string; v: string | null; inherent: boolean };   // one akṣara: consonant(s) + vowel

function indicWord(word: string, lang: string): string {
  const base = BASE[lang]; const drav = DRAVIDIAN.has(lang);
  const syl: Syl[] = []; let out = ""; const flush = () => { out += syl.map(s => s.c + (s.v ?? "")).join(""); syl.length = 0; };
  const chars = [...word];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (CHILLU[ch]) { syl.push({ c: CHILLU[ch], v: "", inherent: false }); continue; }
    const o = ch.codePointAt(0)! - base;
    if (ch === "।" || ch === "॥") { flush(); out += "."; continue; }
    if (o < 0 || o > 0x7f) { flush(); out += ch; continue; }
    if (C[o] !== undefined) {
      let c = C[o];
      if (lang === "bn" && o === 0x2c) c = "b";          // ব is "b" (and "v" in Sanskrit loans)
      if (lang === "or" && o === 0x2f) c = "j";          // ଯ is "j" in Odia
      syl.push({ c, v: lang === "bn" || lang === "or" ? "ô" : "a", inherent: true }); continue;
    }
    const last = syl[syl.length - 1];
    if (o === 0x3c) { if (last) last.c = NUKTA[last.c] ?? last.c; continue; }            // nukta
    if (o === 0x4d) {                                                                    // virama: drop the a, join the next consonant
      if (last) { last.v = ""; last.inherent = false; }
      continue;
    }
    if (M[o] !== undefined) {
      let v = M[o]; if (!drav && v === "ē") v = "e"; if (!drav && v === "ō") v = "o";
      if (last) { last.v = v; last.inherent = false; } continue;
    }
    if (V[o] !== undefined) { let v = V[o]; if (!drav && v === "ē") v = "e"; if (!drav && v === "ō") v = "o"; syl.push({ c: "", v, inherent: false }); continue; }
    if (o === 0x02) { const l = syl[syl.length - 1]; if (l) l.v = (l.v ?? "") + "ṁ"; else out += "ṁ"; continue; }   // anusvāra
    if (o === 0x01) { const l = syl[syl.length - 1]; if (l) l.v = (l.v ?? "") + "̐"; continue; }                    // candrabindu
    if (o === 0x03) { const l = syl[syl.length - 1]; if (l) l.v = (l.v ?? "") + "ḥ"; else out += "ḥ"; continue; }   // visarga
    if (o >= 0x66 && o <= 0x6f) { flush(); out += String(o - 0x66); continue; }        // digits
    if (o === 0x64 || o === 0x65) { flush(); out += "."; continue; }                   // danda
    flush(); out += ch;
  }
  // silent inherent "a" — Hindi / Marathi: final, and medial in V C a C V; Bengali: final only
  if (lang === "hi" || lang === "mr" || lang === "bn") {
    const n = syl.length;
    if (n > 1 && syl[n - 1].inherent && syl[n - 1].c) syl[n - 1].v = "";
    if (lang !== "bn") for (let k = n - 2; k >= 1; k--) {
      const s = syl[k], prev = syl[k - 1], next = syl[k + 1];
      if (s.inherent && s.c && prev.v && next.c && next.v) { s.v = ""; k--; }   // skip the neighbour: never two in a row
    }
  }
  flush();
  return out;
}

const indic = (text: string, lang: string) => {
  const r = text.split(/(\s+)/).map(w => (/\s/.test(w) ? w : indicWord(w, lang))).join("");
  return lang === "ml" ? r.replace(/nṟ/g, "nt").replace(/ṟṟ/g, "tt") : r;      // Malayalam ന്റ is said "nt" (എന്റെ ente)
};

// ── Russian ──────────────────────────────────────────────────────
const RU: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "'", э: "e", ю: "yu", я: "ya" };
const russian = (t: string) => [...t].map(ch => {
  const lo = ch.toLowerCase(); const r = RU[lo]; if (r === undefined) return ch;
  return ch !== lo && r ? r[0].toUpperCase() + r.slice(1) : r;
}).join("");

// ── Korean (Revised Romanization) ───────────────────────────────
const KI = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const KV = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const KF = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];
// a final consonant moved onto a following silent ㅇ (linking): 안녕하세요, 먹어요 → meogeoyo
const KLINK = ["", "g", "kk", "ks", "n", "nj", "n", "d", "r", "lg", "lm", "lb", "ls", "lt", "lp", "r", "m", "b", "ps", "s", "ss", "ng", "j", "ch", "k", "t", "p", ""];
const korean = (t: string) => {
  const cs = [...t]; let out = "";
  const dec = (ch: string) => { const c = ch.codePointAt(0)! - 0xac00; return c >= 0 && c < 11172 ? [Math.floor(c / 588), Math.floor((c % 588) / 28), c % 28] : null; };
  for (let i = 0; i < cs.length; i++) {
    const d = dec(cs[i]); if (!d) { out += cs[i]; continue; }
    const [ini, vow, fin] = d; const nx = i + 1 < cs.length ? dec(cs[i + 1]) : null;
    let initial = KI[ini];
    const prev = i > 0 ? dec(cs[i - 1]) : null;
    if (prev && prev[2] && ini === 11) initial = "";                       // handled by the linking below
    if (prev && ini === 5 && (prev[2] === 8 || prev[2] === 4)) initial = "l";               // ㄹ+ㄹ → ll
    else if (prev && ini === 5 && prev[2]) initial = "n";      // ㅁ/ㅇ/ㄱ+ㄹ → n
    out += initial + KV[vow];
    if (!fin) continue;
    if (nx && nx[0] === 11) { out += KLINK[fin]; continue; }               // linking onto ㅇ
    let f = KF[fin];
    if (nx && (nx[0] === 2 || nx[0] === 6)) f = f === "k" ? "ng" : f === "t" ? "n" : f === "p" ? "m" : f;   // nasal assimilation
    if (nx && nx[0] === 5 && f === "n") f = "l";                           // ㄴ+ㄹ → ll
    out += f;
  }
  return out;
};

// ── Chinese: longest match over a word list (pinyin grouped by word) ──
const ZH_MAX = Math.max(...Object.keys(ZH_WORDS).map(k => k.length));
const PUNCT: Record<string, string> = { "，": ",", "。": ".", "；": ";", "！": "!", "？": "?", "（": "(", "）": ")", "、": ",", "：": ":", "「": "\"", "」": "\"", "…": "…", "〜": "~", "・": " / ", "　": " ", "،": ",", "؟": "?", "؛": ";" };
const isHan = (c: string) => /[\u3400-\u9fff々]/.test(c);
function chinese(t: string): string | null {
  const parts: string[] = []; let i = 0;
  while (i < t.length) {
    let hit = "";
    for (let L = Math.min(ZH_MAX, t.length - i); L > 0; L--) { const w = t.slice(i, i + L); if (ZH_WORDS[w]) { hit = w; break; } }
    if (hit) { parts.push(" " + ZH_WORDS[hit] + " "); i += hit.length; continue; }
    const c = t[i]; if (isHan(c)) return null;          // a character we have no reading for: show nothing rather than half
    parts.push(PUNCT[c] ?? c); i++;
  }
  return tidy(parts.join(""));
}
const tidy = (s: string) => s.replace(/([^\s(\[])\(/g, "$1 (").replace(/\s+/g, " ").replace(/\s+([,.;:!?)\]])/g, "$1").replace(/([(\[])\s+/g, "$1").trim();

// ── Japanese: kana by rule (Hepburn), kanji runs from the word list ──
const KANA: Record<string, string> = {};
(() => {
  const rows = "a i u e o|ka ki ku ke ko|sa shi su se so|ta chi tsu te to|na ni nu ne no|ha hi fu he ho|ma mi mu me mo|ya - yu - yo|ra ri ru re ro|wa - - - wo|ga gi gu ge go|za ji zu ze zo|da ji zu de do|ba bi bu be bo|pa pi pu pe po".split("|").map(r => r.split(" "));
  const hira = ["あいうえお", "かきくけこ", "さしすせそ", "たちつてと", "なにぬねの", "はひふへほ", "まみむめも", "や ゆ よ", "らりるれろ", "わ   を", "がぎぐげご", "ざじずぜぞ", "だぢづでど", "ばびぶべぼ", "ぱぴぷぺぽ"];
  hira.forEach((r, i) => [...r].forEach((ch, j) => { if (ch !== " " && rows[i][j] !== "-") { KANA[ch] = rows[i][j]; KANA[String.fromCharCode(ch.charCodeAt(0) + 0x60)] = rows[i][j]; } }));
  for (const [k, v] of Object.entries({ "ん": "n", "ぁ": "a", "ぃ": "i", "ぅ": "u", "ぇ": "e", "ぉ": "o", "ゐ": "i", "ゑ": "e", "ゔ": "vu" })) { KANA[k] = v; KANA[String.fromCharCode(k.charCodeAt(0) + 0x60)] = v; }
  KANA["を"] = "o"; KANA["ヲ"] = "o";
})();
const SMALL_Y: Record<string, string> = { "ゃ": "a", "ゅ": "u", "ょ": "o", "ャ": "a", "ュ": "u", "ョ": "o" };
const SMALL_V: Record<string, string> = { "ァ": "a", "ィ": "i", "ゥ": "u", "ェ": "e", "ォ": "o" };
const PARTICLES = ["から", "まで", "より", "の", "が", "を", "に", "で", "と", "へ", "は", "も", "よ"];
export const kanaRomaji = (t: string) => kana(t).replace(/\s+/g, " ").trim();
function kana(t: string): string {
  let o = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i], nx = t[i + 1];
    if (c === "っ" || c === "ッ") { const r = KANA[nx] ?? ""; o += r.startsWith("ch") ? "t" : r[0] ?? ""; continue; }
    if (c === "ー") { o = o.replace(/[aeiou]$/, v => ({ a: "ā", e: "ē", i: "ī", o: "ō", u: "ū" } as Record<string, string>)[v]); continue; }
    let r = KANA[c]; if (r === undefined) { o += PUNCT[c] ?? c; continue; }
    if (nx && SMALL_Y[nx]) { r = /^(shi|chi|ji)$/.test(r) ? r.slice(0, -1) + SMALL_Y[nx] : r.slice(0, -1) + "y" + SMALL_Y[nx]; i++; }
    else if (nx && SMALL_V[nx]) { r = r.replace(/[aeiou]$/, "") + SMALL_V[nx]; i++; }
    if (c === "ん" || c === "ン") { o += /^[aeiouy]/.test(KANA[nx] ?? "") ? "n'" : "n"; continue; }
    o += r;
  }
  return o.replace(/ou(?![aeiou])/g, "ō").replace(/oo/g, "ō").replace(/uu/g, "ū");
}
function japanese(t: string): string | null {
  // tokens: kanji runs, hiragana runs, katakana runs, everything else
  const toks = t.match(/[\u3400-\u9fff々]+|[\u3040-\u309f]+|[\u30a0-\u30ffー]+|[^\u3040-\u30ff\u3400-\u9fff々]+/g) ?? [];
  const out: string[] = [];
  for (let k = 0; k < toks.length; k++) {
    const tk = toks[k];
    if (isHan(tk[0])) {
      const next = toks[k + 1] ?? "";
      const r = JA_KANJI[tk + next[0]] ?? JA_KANJI[tk]; if (r === undefined) return null;
      out.push((out.length && !/[\s(（]$/.test(out[out.length - 1]) ? " " : "") + r); continue;
    }
    if (/^[\u3040-\u309f]/.test(tk)) {                // okurigana and particles
      const glued = k > 0 && /^[\u3400-\u9fff々]/.test(toks[k - 1]);
      const p = PARTICLES.find(x => tk === x || (tk.length > x.length && tk.endsWith(x) && !/^[\u3040-\u309f]/.test(toks[k + 1] ?? "")));
      let body = tk, part = "";
      if (p && (tk !== p || k > 0)) { body = tk.slice(0, tk.length - p.length); part = p; }
      if (body === "お" || body === "ご") { out.push(" " + kana(body)); continue; }            // honorific prefix glues forward
      out.push((glued ? "" : " ") + kana(body) + (part ? " " + (part === "は" ? "wa" : part === "へ" ? "e" : kana(part)) : ""));
      continue;
    }
    if (/^[\u30a0-\u30ff]/.test(tk)) { out.push(" " + kana(tk)); continue; }
    out.push([...tk].map(c => PUNCT[c] ?? c).join(""));
  }
  return tidy(out.join("").replace(/ (o|go) (?=\S)/g, " $1"));
}

// ── Arabic: word list with full vowels (exact spelling first, then without marks) ──
const strip = (w: string) => w.replace(/[\u064b-\u0652\u0670]/g, "");
const AR_BARE: Record<string, string> = {};
for (const [k, v] of Object.entries(AR_WORDS)) { const b = strip(k); if (!(b in AR_BARE)) AR_BARE[b] = v; }
function arabic(t: string): string | null {
  let ok = true;
  const r = t.replace(/[\u0621-\u0652\u0670\u0640]+/g, w => { const v = AR_WORDS[w] ?? AR_BARE[strip(w)]; if (v === undefined) { ok = false; return w; } return v; })
    .replace(/[،؟؛]/g, c => PUNCT[c]);
  return ok ? tidy(r.replace(/(\S)\s*-\s*(hu|hum|hā|ī|nā|ka|kum)\b/g, "$1-$2")) : null;
}

/** The Latin reading of `text` in `lang`, or "" when none is needed or possible. `given` = a hand-written reading (ar/zh/ja). */
export function romanize(text: string, lang: string, given?: string): string {
  if (!text) return "";
  if (given) return given;
  const reg = READINGS.get(lang + "\u0000" + text); if (reg) return reg;
  if (BASE[lang] !== undefined) return indic(text, lang);
  if (lang === "ru") return russian(text);
  if (lang === "ko") return korean(text);
  if (lang === "zh") return chinese(text) ?? "";
  if (lang === "ja") return japanese(text) ?? "";
  if (lang === "ar") return arabic(text) ?? "";
  return "";
}
