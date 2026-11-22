// ═══════════════════════════════════════════════════════════════
//  search/forms.ts — "which word is this?" for any inflected form.
//
//  Verbs: app/public/forms/ (tools/build_form_index.py) maps every unprefixed tiṅanta and
//  kṛdanta form of the 356 roots to its root, lakāra, person and number. A prefixed form
//  (अवाप, समागच्छति, प्राहरत्) is split here: the upasargas are taken off, with the sandhi
//  at the joint undone, the rest is looked up, and the whole word is then checked against
//  that root's own vidyut-prakriya table (app/public/rupa/<code>.json).
//  Nouns: every declined form in शब्दकोशः.
// ═══════════════════════════════════════════════════════════════
import { WORDS, type Word } from "../data";

// ── Devanāgarī ⇄ SLP1 ──
const V: Record<string, string> = { "अ": "a", "आ": "A", "इ": "i", "ई": "I", "उ": "u", "ऊ": "U", "ऋ": "f", "ॠ": "F", "ऌ": "x", "ॡ": "X", "ए": "e", "ऐ": "E", "ओ": "o", "औ": "O" };
const M: Record<string, string> = { "ा": "A", "ि": "i", "ी": "I", "ु": "u", "ू": "U", "ृ": "f", "ॄ": "F", "ॢ": "x", "ॣ": "X", "े": "e", "ै": "E", "ो": "o", "ौ": "O" };
const CD = "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळ", CS = "kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL";
const C: Record<string, string> = {}; const CR: Record<string, string> = {};
for (let i = 0; i < CD.length; i++) { C[CD[i]] = CS[i]; CR[CS[i]] = CD[i]; }
const VR: Record<string, string> = {}; const MR: Record<string, string> = {};
for (const [k, v] of Object.entries(V)) VR[v] = k;
for (const [k, v] of Object.entries(M)) MR[v] = k;

export function toSlp(s: string): string {
  let o = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (C[ch]) {
      o += C[ch]; const nx = s[i + 1];
      if (nx === "्") { i++; continue; }
      if (nx && M[nx]) { o += M[nx]; i++; continue; }
      o += "a"; continue;
    }
    if (V[ch]) o += V[ch]; else if (ch === "ं") o += "M"; else if (ch === "ः") o += "H"; else if (ch === "ँ") o += "~";
  }
  return o;
}
export function toDeva(s: string): string {
  let o = ""; let prev = false;
  for (const ch of s) {
    if (CR[ch]) { if (prev) o += "्"; o += CR[ch]; prev = true; }
    else if (VR[ch]) { o += prev ? MR[ch] ?? "" : VR[ch]; prev = false; }
    else { if (prev) o += "्"; o += ch === "M" ? "ं" : ch === "H" ? "ः" : ch === "~" ? "ँ" : ch; prev = false; }
  }
  return prev ? o + "्" : o;
}

// ── the index ──
/** prayoga codes with c (णिच्, causative) or s (सन्, desiderative) in front: cP, cK, ck, sP … */
export const isSanadi = (prayoga: string) => prayoga.length === 2;
export type VerbHit = { root: number; prayoga: string; slot: string; cell: number };
export type RootRow = [string, string, string, string, 1?];   // code, lemma, meaning, MDH id, 1 = takes no other upasarga
const url = (f: string) => new URL(f, document.baseURI).href;
let rootsP: Promise<RootRow[]> | null = null;
export const loadRoots = () => (rootsP ??= fetch(url("forms/roots.json")).then(r => (r.ok ? r.json() : [])));
const shards = new Map<string, Promise<Record<string, [number, string, string, number][]>>>();
/** same as xhash() in tools/build_form_index.py; MAIN_N and X_N as there */
const xhash = (f: string, n: number) => { let h = 0; for (const c of f) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h % n; };
const MAIN_N = 200, X_N = 100;
const shardKey = (f: string) => "m" + String(xhash(f, MAIN_N)).padStart(3, "0");
// the Verb-book data names kṛt suffixes in Devanāgarī, the vidyut tables in SLP1: one name each
const KRT_SLP: Record<string, string> = { "क्त्वा": "ktvA", "ल्यप्": "lyap", "तुमुन्": "tumun", "णमुल्": "Ramul", "शतृ": "Satf", "शानच्": "SAnac",
  "क्त": "kta", "क्तवतु": "ktavatu", "तव्यत्": "tavyat", "अनीयर्": "anIyar", "यत्": "yat", "ण्यत्": "Ryat", "क्यप्": "kyap", "ण्वुल्": "Rvul",
  "तृच्": "tfc", "ल्युट्": "lyuw", "क्तिन्": "ktin", "घञ्": "GaY", "अच्": "ac", "अप्": "ap", "इष्णुच्": "izRuc", "क्विप्": "kvip" };
const dedupe = (hs: VerbHit[]) => hs.filter((h, i) => hs.findIndex(x => x.root === h.root && x.prayoga === h.prayoga && x.slot === h.slot && x.cell === h.cell) === i);
function lookup(f: string): Promise<VerbHit[]> {
  if (!f) return Promise.resolve([]);
  const k = shardKey(f);
  if (!shards.has(k)) shards.set(k, fetch(url(`forms/${k}.json`)).then(r => (r.ok ? r.json() : {})).catch(() => ({})));
  return shards.get(k)!.then(d => dedupe((d[f] ?? []).map(([root, prayoga, slot, cell]) => ({ root, prayoga, slot: KRT_SLP[slot] ?? slot, cell }))));
}
// prefixed forms that the splitter below cannot get back (ल्यप्, ṇatva/ṣatva inside the word, …),
// stored whole by tools/build_form_index.py in x00 … x99.json
const xshards = new Map<string, Promise<Record<string, [number, string, string, number, string][]>>>();
function lookupWhole(f: string) {
  const k = "x" + String(xhash(f, X_N)).padStart(2, "0");
  if (!xshards.has(k)) xshards.set(k, fetch(url(`forms/${k}.json`)).then(r => (r.ok ? r.json() : {})).catch(() => ({})));
  return xshards.get(k)!.then(d => d[f] ?? []);
}
type Table = Record<string, { t: Record<string, Record<string, string[]>>; k: Record<string, string> }>;
const tables = new Map<string, Promise<Table | null>>();
const loadTable = (code: string) => {
  if (!tables.has(code)) tables.set(code, fetch(url(`rupa/${code}.json`)).then(r => (r.ok ? r.json() : null)).catch(() => null));
  return tables.get(code)!;
};

// ── upasargas and the sandhi at their joint ──
export const UPASARGAS: [string, string][] = [["pra", "प्र"], ["parA", "परा"], ["apa", "अप"], ["sam", "सम्"], ["anu", "अनु"], ["ava", "अव"],
  ["nis", "निस्"], ["nir", "निर्"], ["dus", "दुस्"], ["dur", "दुर्"], ["vi", "वि"], ["AN", "आ"], ["ni", "नि"], ["aDi", "अधि"], ["api", "अपि"],
  ["ati", "अति"], ["su", "सु"], ["ud", "उद्"], ["aBi", "अभि"], ["prati", "प्रति"], ["pari", "परि"], ["upa", "उप"]];
const VOWELS = "aAiIuUfFxXeEoO";
const isV = (c: string) => VOWELS.includes(c);
/** every way `q` can begin with upasarga `p` (keep the same as strip() in tools/build_form_index.py): [rest of the word, as the bare form would begin] */
const NATVA = new Set(["pra", "parA", "nir", "dur", "pari", "prati"]);   // र् in the upasarga: न → ण at the start of the root
const SATVA = new Set(["ni", "vi", "aBi", "pari", "prati", "anu", "su", "aDi", "api", "ati", "upa", "nis", "dus"]);   // स → ष
function strip(q: string, p: string): string[] {
  const out: string[] = [];
  for (const x of [...strip0(q, p), ...joint(q, p)]) {
    out.push(x);
    if (x[0] === "R" && NATVA.has(p)) out.push("n" + x.slice(1));
    if (x[0] === "z" && SATVA.has(p)) out.push("s" + x.slice(1));
    if (x.startsWith("cC")) out.push(x.slice(1));                   // आ/वि + छ → आच्छ, विच्छ
  }
  return out;
}
/** निर्/दुर् + र → नीर/दूर (निस् + रोचते = नीरोचते) */
function joint(q: string, p: string): string[] {
  if (!["nis", "nir", "dus", "dur"].includes(p)) return [];
  const long = p[0] === "n" ? "nI" : "dU";
  return q.startsWith(long + "r") ? [q.slice(long.length)] : [];
}
function strip0(q: string, p: string): string[] {
  const out: string[] = [];
  const body = p === "AN" ? "A" : p;
  const last = body[body.length - 1];
  if (isV(last)) {
    const stem = body.slice(0, -1);
    if (q.startsWith(body) && q.length > body.length && !isV(q[body.length])) out.push(q.slice(body.length));   // प्र + भवति
    if (!q.startsWith(stem)) return out;
    const r = q.slice(stem.length);
    if ("aA".includes(last)) {
      const pairs: [string, string[]][] = [["A", ["a", "A"]], ["e", ["i", "I", "e"]], ["o", ["u", "U", "o"]], ["E", ["e", "E"]], ["O", ["o", "O"]], ["Ar", ["f"]], ["ar", ["f"]]];
      for (const [surf, starts] of pairs) if (r.startsWith(surf)) for (const s0 of starts) out.push(s0 + r.slice(surf.length));
    } else if ("iI".includes(last)) {
      if (r.startsWith("I")) out.push("i" + r.slice(1), "I" + r.slice(1));
      if (r.startsWith("y") && isV(r[1] ?? "") && !"iI".includes(r[1])) out.push(r.slice(1));
    } else if ("uU".includes(last)) {
      if (r.startsWith("U")) out.push("u" + r.slice(1), "U" + r.slice(1));
      if (r.startsWith("v") && isV(r[1] ?? "") && !"uU".includes(r[1])) out.push(r.slice(1));
    }
    return out;
  }
  // consonant-final: सम्, उद्, निस्/निर्, दुस्/दुर्
  const SURF: Record<string, string[]> = {
    sam: ["sam", "saM", "saN", "saY", "saR", "san"], ud: ["ud", "ut", "uc", "uj", "uq", "un", "ul", "uw"],
    nis: ["nis", "niH", "niS", "niz", "nir"], nir: ["nir", "niH", "niS", "niz", "nis"],
    dus: ["dus", "duH", "duS", "duz", "dur"], dur: ["dur", "duH", "duS", "duz", "dus"],
  };
  for (const s of SURF[p] ?? [p]) if (q.startsWith(s) && q.length > s.length) {
    const r = q.slice(s.length);
    out.push(r);
    if (p === "ud" && s === "ud" && r.startsWith("D")) out.push("h" + r.slice(1));        // उद् + हरति = उद्धरति
    if (p === "ud" && s === "ut" && (r[0] === "T" || r[0] === "t")) out.push("s" + r);       // उद् + स्था = उत्था, उद् + स्तम्भ = उत्तम्भ
  }
  return out;
}

/** A causative or desiderative is not in a prefixed table of its own. Where the joint could take ṇatva or
 *  ṣatva (प्र + नद् → प्रण…, अभि + सिच् → अभिष…), the root's plain prefixed forms show whether it does,
 *  and the typed word has to agree (प्रणादयति, not प्रनादयति). */
async function sameJoint(code: string, p: string, q: string): Promise<boolean> {
  const t = await loadTable(code);
  const e = t?.[p]; if (!e) return true;
  const first = Object.values(e.t ?? {}).map(m => m.lat?.[0] ?? "").find(Boolean) ?? Object.values(e.k ?? {}).find(Boolean) ?? "";
  const plain = strip0(first.split("|")[0], p)[0] ?? "", typed = strip0(q, p);
  const changes = (x: string) => (NATVA.has(p) && "nR".includes(x[0] ?? "")) || (SATVA.has(p) && "sz".includes(x[0] ?? ""));
  if (!changes(plain) || !typed.some(changes)) return true;
  const mark = (x: string) => (x[0] === "R" || x[0] === "z");
  return typed.some(x => changes(x) && mark(x) === mark(plain));
}
export type VerbAnalysis = { prefixes: string[]; base: string; hits: VerbHit[]; checked: boolean; declined?: string };
const PK: Record<string, string> = { P: "kartari_P", A: "kartari_A", K: "karmani", B: "bhave" };
// a participle in -त / -तवत् / -अनीय … is indexed in its dictionary form (गतः); the other cases and genders
// of an a-stem are taken back to it: गतम्, गता, गतेन, गतानि → गतः
const PARTICIPLES = new Set(["kta", "tavyat", "anIyar", "yat", "Ryat", "kyap", "SAnac"]);
const A_ENDINGS = ["Ani", "AnAm", "eByaH", "AByAm", "ena", "Aya", "asya", "ezu", "AyAH", "AyAm", "ayA", "AByaH", "Asu", "AH", "am", "At", "e", "O", "An", "EH", "A", "Am"];
/** analyse one word as a verb form: as it is, with up to two upasargas taken off, and (for kṛdantas) in another case */
export async function analyseVerb(word: string): Promise<VerbAnalysis[]> {
  const out = await analyseBare(word);
  if (out.length) return out;
  const q = toSlp(word.trim());
  for (const e of A_ENDINGS) if (q.endsWith(e) && q.length > e.length + 1) {
    const stem = q.slice(0, -e.length) + "aH";
    const r = (await analyseBare(toDeva(stem))).map(a => ({ ...a, hits: a.hits.filter(h => h.prayoga.endsWith("k") && PARTICIPLES.has(h.slot)), declined: toDeva(stem) })).filter(a => a.hits.length);
    if (r.length) return r;
  }
  return [];
}
async function analyseBare(word: string): Promise<VerbAnalysis[]> {
  const q = toSlp(word.trim());
  if (q.length < 2) return [];
  const cands: { prefixes: string[]; base: string }[] = [{ prefixes: [], base: q }];
  for (const [p1] of UPASARGAS) for (const r1 of strip(q, p1)) {
    cands.push({ prefixes: [p1], base: r1 });
    for (const [p2] of UPASARGAS) for (const r2 of strip(r1, p2)) cands.push({ prefixes: [p1, p2], base: r2 });
  }
  const roots = await loadRoots();
  const out: VerbAnalysis[] = [];
  const whole = new Map<string, VerbHit[]>();
  for (const [root, prayoga, slot, cell, key] of await lookupWhole(q)) {
    const l = whole.get(key) ?? []; l.push({ root, prayoga, slot, cell }); whole.set(key, l);
  }
  for (const [key, hits] of whole) {
    out.push({ prefixes: key.split(","), base: "", hits, checked: true });   // shown as प्र + भू → प्रभूय
  }
  for (const c of cands) {
    const hits = await lookup(c.base);
    if (!hits.length) continue;
    if (!c.prefixes.length) { out.push({ ...c, hits, checked: true }); continue; }
    // the root's own table says whether the prefixed form really is this one
    const ok: VerbHit[] = [], maybe: VerbHit[] = [];
    for (const h of hits) {
      // causatives and desideratives were made with every single upasarga; a split back to the plain form is theirs
      if (isSanadi(h.prayoga)) { if (c.prefixes.length === 1 && !roots[h.root][4] && await sameJoint(roots[h.root][0], c.prefixes[0], q)) ok.push(h); continue; }
      const e = (await loadTable(roots[h.root][0]))?.[c.prefixes.join(",")];
      if (!e) { maybe.push(h); continue; }
      const cell = h.prayoga === "k" ? e.k?.[h.slot] ?? "" : (e.t?.[PK[h.prayoga]]?.[h.slot] ?? [])[h.cell] ?? "";
      if (cell.split("|").includes(q)) ok.push(h);
    }
    if (ok.length) out.push({ ...c, hits: ok, checked: true });
    else if (maybe.length) out.push({ ...c, hits: maybe, checked: false });
  }
  // an unconfirmed split is dropped when a confirmed reading of the same root exists
  return out.filter(a => a.checked || !out.some(b => b.checked && b.hits.some(h => a.hits.some(x => x.root === h.root))));
}

// ── nouns ──
export type NounHit = { w: Word; vib: number; vac: number };
let nounIx: Map<string, NounHit[]> | null = null;
export function analyseNoun(word: string): NounHit[] {
  if (!nounIx) {
    nounIx = new Map();
    for (const w of WORDS) (w.d ?? []).forEach((row, vac) => row.forEach((cell, vib) => {
      for (const f of String(cell ?? "").split(/\s*[|/,]\s*/)) if (f) {
        const l = nounIx!.get(f) ?? []; l.push({ w, vib, vac }); nounIx!.set(f, l);
      }
    }));
  }
  return nounIx.get(word.trim()) ?? [];
}
