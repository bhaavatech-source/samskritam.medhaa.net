// ═══════════════════════════════════════════════════════════════
//  sahitya/scan.ts — laghu / guru scansion of Devanagari verse.
//  Same rules as tools/build_sahitya.py:
//    a syllable is guru (ऽ) if its vowel is long, or it has anusvāra / visarga,
//    or it is followed by a conjunct (two or more consonants, across word breaks);
//    otherwise it is laghu (।). The last syllable of a pāda may count either way.
// ═══════════════════════════════════════════════════════════════

const V_IND = "अआइईउऊऋॠऌएऐओऔ";
const LONG_IND = "आईऊॠएऐओऔ";
const MAT: Record<string, number> = { "ा": 1, "ि": 0, "ी": 1, "ु": 0, "ू": 1, "ृ": 0, "ॄ": 1, "ॢ": 0, "े": 1, "ै": 1, "ो": 1, "ौ": 1 };
const isC = (c: string) => c >= "क" && c <= "ह";

export type Syl = { t: string; g: boolean };

/** split one pāda (or any line) into syllables, each marked guru or laghu */
export function syllables(line: string): Syl[] {
  const s = line.replace(/[^ऀ-ॣ\s]/g, "").replace(/ऽ/g, "");
  const out: Syl[] = [];
  let pend = "";                       // consonants (and spaces) waiting for their vowel
  const n = s.length;
  for (let i = 0; i < n; i++) {
    const c = s[i];
    if (/\s/.test(c)) { if (out.length && !pend) out[out.length - 1].t += " "; else pend += " "; continue; }
    if (V_IND.includes(c)) { out.push({ t: pend + c, g: LONG_IND.includes(c) }); pend = ""; }
    else if (isC(c)) {
      if (s[i + 1] === "्") {
        // a final consonant with virama at the end of a word stays with the previous syllable
        const nextIsBreak = i + 2 >= n || /\s/.test(s[i + 2]);
        if (nextIsBreak && out.length && !pend.trim()) { out[out.length - 1].t += c + "्"; i++; continue; }
        pend += c + "्"; i++; continue;
      }
      if (MAT[s[i + 1]] !== undefined) { out.push({ t: pend + c + s[i + 1], g: MAT[s[i + 1]] === 1 }); i++; }
      else out.push({ t: pend + c, g: false });
      pend = "";
    } else if ("ंःँ".includes(c)) {
      if (out.length) { out[out.length - 1].t += c; if (c !== "ँ") out[out.length - 1].g = true; }
      continue;
    } else continue;
    // is the syllable just made followed by a conjunct?
    let k = 0;
    for (let j = i + 1; j < n; j++) {
      const d = s[j];
      if (/\s/.test(d) || "ंःँ".includes(d)) continue;
      if (isC(d)) { k++; if (s[j + 1] === "्") { j++; continue; } }
      break;
    }
    if (k >= 2) out[out.length - 1].g = true;
  }
  if (pend.trim() && out.length) out[out.length - 1].t += pend.trim();
  return out;
}

export const pattern = (line: string) => syllables(line).map(x => (x.g ? "ऽ" : "।")).join("");
export const matras = (p: string) => [...p].reduce((a, c) => a + (c === "ऽ" ? 2 : 1), 0);

const GANA: Record<string, string> = { "।ऽऽ": "य", "ऽऽऽ": "म", "ऽऽ।": "त", "ऽ।ऽ": "र", "।ऽ।": "ज", "ऽ।।": "भ", "।।।": "न", "।।ऽ": "स" };
/** य-मा-ता-रा-ज-भा-न-स-ल-गाः: groups of three, then ल / ग for what is left */
export function ganas(p: string): { g: string; name: string }[] {
  const out: { g: string; name: string }[] = [];
  let i = 0;
  for (; i + 3 <= p.length; i += 3) out.push({ g: p.slice(i, i + 3), name: GANA[p.slice(i, i + 3)] });
  for (; i < p.length; i++) out.push({ g: p[i], name: p[i] === "ऽ" ? "ग" : "ल" });
  return out;
}

export type Metre =
  | { kind: "sama" | "daNDaka"; pat: string }
  | { kind: "upajati" | "ardhasama"; pats: string[] }
  | { kind: "matra"; matra: number[] }
  | { kind: "anushtup" };

const fits = (p: string, pat: string) => p.length === pat.length && p.slice(0, -1) === pat.slice(0, -1);
const VIPULA: Record<string, string> = { "।ऽऽ": "पथ्या", "।।।": "न-विपुला", "ऽ।।": "भ-विपुला", "ऽऽऽ": "म-विपुला", "ऽ।ऽ": "र-विपुला" };

/** split a verse into its pādas. Lines and daṇḍas both separate; a 16-syllable half of a śloka is two pādas. */
export function padas(verse: string): string[] {
  return verse.split(/[\n।॥|]+/).map(x => x.replace(/[०-९\d]/g, "").trim()).filter(x => pattern(x).length > 0);
}

export type Match = { id: string; note?: string };
type V = { id: string; metre: Metre };

/** which of the known vṛttas a verse is in (null if none fits) */
export function identify(verse: string, vrittas: V[]): Match | null {
  const ps = padas(verse).map(pattern);
  if (!ps.length) return null;
  for (const v of vrittas) {
    const m = v.metre;
    if (m.kind === "anushtup") {
      const qs = ps.flatMap(p => (p.length === 16 ? [p.slice(0, 8), p.slice(8)] : [p]));
      if (qs.length !== 4 || qs.some(q => q.length !== 8)) continue;
      const evenOk = [1, 3].every(i => qs[i][4] === "।" && qs[i][5] === "ऽ" && qs[i][6] === "।");
      const odd = [0, 2].map(i => VIPULA[qs[i].slice(4, 7)]);
      if (evenOk && odd.every(Boolean)) {
        const vip = odd.map((x, i) => (x !== "पथ्या" ? `${i * 2 + 1}: ${x}` : "")).filter(Boolean);
        return { id: v.id, note: vip.length ? `विपुला · ${vip.join(", ")}` : "पथ्यावक्त्रम्" };
      }
    } else {
      // a half-verse may be written on one line: then split it into its two pādas
      const four = ps.length === 4 ? ps : ps.length === 2 && m.kind === "sama" && ps.every(p => p.length === 2 * m.pat.length)
        ? ps.flatMap(p => [p.slice(0, m.pat.length), p.slice(m.pat.length)])
        : ps.length === 2 && m.kind === "ardhasama" && ps.every(p => p.length === m.pats[0].length + m.pats[1].length)
        ? ps.flatMap(p => [p.slice(0, m.pats[0].length), p.slice(m.pats[0].length)]) : null;
      if (!four) continue;
      if (m.kind === "sama" && four.every(p => fits(p, m.pat))) return { id: v.id };
      if (m.kind === "upajati" && four.every(p => m.pats.some(x => fits(p, x))) && !m.pats.some(x => four.every(p => fits(p, x)))) return { id: v.id };
      if (m.kind === "ardhasama" && four.every((p, i) => fits(p, m.pats[i % 2]))) return { id: v.id };
    }
  }
  // mātrā metres: two halves, counted in mātrās (the last syllable may be lengthened)
  if (ps.length === 2) {
    const ok = (want: number, p: string) => matras(p) === want || (p.endsWith("।") && matras(p) + 1 === want);
    for (const v of vrittas) if (v.metre.kind === "matra" && v.metre.matra.every((x, i) => ok(x, ps[i]))) return { id: v.id };
  }
  return null;
}
