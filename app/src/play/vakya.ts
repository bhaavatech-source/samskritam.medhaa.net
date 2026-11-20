// ═══════════════════════════════════════════════════════════════
//  play/vakya.ts — the sentence engine of वाक्यरचना (क्रीडाङ्गणम्).
//  Nothing is made here: every word form is looked up in app/src/data/vakya.json (tools/build_vakya.py:
//  words.json declensions, vidyut-prakriya tables). The engine only chooses words that go together
//  (data-source/25-vakya/vakya_lexicon_2026-11-20.py) and puts each in the case, gender, number, person
//  and tense its role needs:
//    doer → 1st case, verb agrees in person and number (two doers joined by च → dual / plural)
//    object / destination → 2nd · instrument, companion (with सह) → 3rd · recipient → 4th · source → 5th
//    owner → 6th · place → 7th · adjective → gender, case and number of its noun · यः … सः → gender and number of the noun
//  A sentence is a tree that also says which orders are correct: words of one phrase stay together
//  (adjective + noun, X सह, …-त्वा with its object, X Y च), phrases of a clause go in any order,
//  यदा- and यः- clauses come first.
// ═══════════════════════════════════════════════════════════════
import { shuffle } from "../data";

export type Noun = { w: string; g: "m" | "f" | "n"; en: string; pl: string; k: string; d: string[][]; [tag: string]: unknown };
export type Adj = { w: string; f: string; en: string; desc: string[]; d: Record<"m" | "n" | "f", string[][]> };
export type Verb = {
  key: string; f: Record<string, string[]>; ktvaF: string; tumF: string; pada: string; en: [string, string, string];
  ag: string[]; obj?: string[]; obj_ag?: string[]; dest?: number; loc?: string[]; src?: string[]; rec?: string[]; inst?: string[];
  com?: number; man: string[]; ktva?: number; tum?: number; purpose?: number; need_purpose?: number; need_loc?: number; thing_agent?: number;
};
export type VakyaData = {
  nouns: Noun[]; adj: Adj[]; verbs: Verb[]; pers: Record<"1" | "2", string[]>; rel: Record<"यद्" | "तद्", Record<"m" | "f" | "n", string[][]>>;
  man: Record<string, [string, string, string[] | null]>; time: [string, string, string[]][]; placeFor: Record<string, string[]>;
  owned: string[]; placeEn: Record<string, string>;
};

// ── cases, numbers ──
export const CASES = ["प्रथमा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी", "सप्तमी"];
export const CASE_EN = ["1st case (doer)", "2nd case (object)", "3rd case (with / by)", "4th case (to / for)", "5th case (from)", "6th case (of)", "7th case (in / at)"];
export const NUM_SA = ["एकवचनम्", "द्विवचनम्", "बहुवचनम्"];
const GEN_SA: Record<string, string> = { m: "पुंलिङ्गम्", f: "स्त्रीलिङ्गम्", n: "नपुंसकलिङ्गम्" };
export const TENSE: Record<string, [string, string]> = { lat: ["लट्", "present"], lan: ["लङ्", "past"], lrt: ["ऌट्", "future"], lot: ["लोट्", "command"], vidhilin: ["विधिलिङ्", "should"] };
const alts = (c: string) => c.split("|").filter(Boolean);
const main = (c: string) => alts(c)[0];
const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const chance = (p: number) => Math.random() < p;

// ── the sentence ──
export type NP = { n: Noun; num: number; adj?: Adj; poss?: NP };
export type Subj = { np?: NP; and?: NP; person: 1 | 2 | 3; pnum: number };
export type Clause = {
  subj: Subj; v: Verb; tense: string;
  obj?: NP; objAnd?: NP; loc?: NP; src?: NP; rec?: NP; inst?: NP; com?: NP; man?: string; time?: number;
  ktva: { v: Verb; obj?: NP; loc?: NP }[]; tum?: { v: Verb; obj?: NP };
};
export type Sentence = { main: Clause; when?: Clause; rel?: Clause };   // rel: its subject is main.subj (यः … सः)

/** a word as shown: form (main), every accepted form, and what it is */
export type Tok = { w: string; ok: string[]; why: string; stem?: string; kind: "noun" | "adj" | "verb" | "pron" | "avy"; slot: string;
  table?: string[][]; at?: [number, number]; g?: string };
export type Node = { t: "w"; tok: Tok } | { t: "seq"; c: Node[] } | { t: "free"; c: Node[] };

export class Engine {
  D: VakyaData;
  constructor(D: VakyaData) { this.D = D; }
  // ── who and what ──
  cls(n: Noun): string { return n.k === "per" ? "per" : (n.cls as string) || n.k; }
  is(n: Noun, item: string): boolean {
    const it = item.replace("!", "");
    if (it === "per!" || it === "per") return n.k === "per";
    return n.k === it || n.w === it || !!n[it] || (it === "eaters" && false);
  }
  canDo(v: Verb, n: Noun): boolean {
    if (v.thing_agent) return !!n.falls;
    if (n.k !== "per" && n.k !== "ani") return false;
    return v.ag.some(a => a === this.cls(n) || !!n[a]);
  }
  placeOk(cls: string, pk: string, list?: string[]): boolean {
    if (list && !list.includes(pk)) return false;
    const pf = this.D.placeFor[cls];
    return !pf || pf.includes(pk);   // persons and falling things: wherever the verb allows
  }
  objOk(v: Verb, n: Noun, cls: string): boolean {
    if (!v.obj || (v.obj_ag && !v.obj_ag.includes(cls))) return false;
    if (n.k === "foe" && !v.obj.some(o => o.startsWith("foe"))) return false;
    if (n.k === "time") return false;
    if (cls !== "per" && v.key === "दृश्" && !["per", "ani", "place", "tree"].includes(n.k)) return false;
    return v.obj.some(o => {
      const it = o.replace("!", "");
      if (it === "food") return n.k === "food" && ((n.eaters as string[]) ?? []).includes(cls);
      if (it === "drink") return n.k === "drink" && ((n.drinkers as string[]) ?? []).includes(cls);
      if (it === "place") return n.k === "place" && !["ground", "seat", "road"].includes(n.pk as string) && this.placeOk(cls, n.pk as string);
      if (it === "per") return n.k === "per";
      if (it === "ani") return n.k === "ani";
      return this.is(n, it);
    });
  }
  objNeeded(v: Verb): boolean { return !!v.obj?.some(o => o.endsWith("!")); }
  agentClasses(s: Subj): string[] { return s.np ? [s.np.n, s.and?.n].filter(Boolean).map(n => this.cls(n as Noun)) : ["per"]; }
  /** nouns used anywhere in the sentence (no word twice) */
  used(S: Sentence): Set<string> {
    const u = new Set<string>();
    const np = (x?: NP) => { if (x) { u.add(x.n.w); np(x.poss); } };
    for (const c of [S.main, S.when, S.rel]) if (c) {
      np(c.subj.np); np(c.subj.and); [c.obj, c.objAnd, c.loc, c.src, c.rec, c.inst, c.com].forEach(np);
      c.ktva.forEach(k => { np(k.obj); np(k.loc); }); np(c.tum?.obj);
    }
    return u;
  }
  pick(pred: (n: Noun) => boolean, used: Set<string>): Noun | undefined {
    const xs = this.D.nouns.filter(n => !used.has(n.w) && pred(n));
    return xs.length ? rnd(xs) : undefined;
  }
  num(n: Noun, p = [.6, .15, .25]): number {
    if (n.mass || n.one || n.k === "place" && chance(.85)) return 0;
    const r = Math.random(); return r < p[0] ? 0 : r < p[0] + p[1] ? 1 : 2;
  }
  // ── a new clause ──
  clause(used: Set<string>, opts: { tense?: string; noPron?: boolean; verb?: Verb } = {}): Clause | undefined {
    for (let tries = 0; tries < 60; tries++) {
      const v = opts.verb ?? rnd(this.D.verbs);
      let subj: Subj;
      const perOk = v.ag.includes("per");
      if (perOk && !opts.noPron && chance(.18)) subj = { person: chance(.5) ? 1 : 2, pnum: rnd([0, 0, 1, 2]) };
      else {
        const n = this.pick(x => this.canDo(v, x), used); if (!n) continue;
        subj = { np: { n, num: this.num(n) }, person: 3, pnum: 0 }; subj.pnum = subj.np!.num;
      }
      let tense = opts.tense ?? rnd(["lat", "lat", "lan", "lrt", "vidhilin"]);
      if (!opts.tense && subj.person === 2 && chance(.35)) tense = "lot";
      if (tense === "lot" && subj.person !== 2) continue;
      const c: Clause = { subj, v, tense, ktva: [] };
      const u2 = new Set(used); if (subj.np) u2.add(subj.np.n.w);
      const cls = this.agentClasses(subj)[0];
      if (v.need_purpose) { const t = this.addTum(c, u2); if (!t) continue; }
      if (this.objNeeded(v) || (v.obj && !v.dest && chance(.6))) {
        const o = this.pick(n => this.objOk(v, n, cls) && (!subj.np || n.w !== subj.np.n.w), u2);
        if (!o) { if (this.objNeeded(v)) continue; } else { c.obj = { n: o, num: this.num(o) }; u2.add(o.w); }
      }
      if (v.need_loc) { const l = this.locFor(c, u2); if (!l) continue; c.loc = l; }
      return c;
    }
    return undefined;
  }
  locFor(c: Clause, used: Set<string>, list = c.v.loc): NP | undefined {
    if (!list) return undefined;
    const cls = this.agentClasses(c.subj);
    const n = this.pick(x => (x.k === "place" || x.k === "tree") && cls.every(k => this.placeOk(k, x.pk as string, list)), used);
    return n ? { n, num: 0 } : undefined;
  }
  addTum(c: Clause, used: Set<string>): boolean {
    const cls = this.agentClasses(c.subj);
    const vs = this.D.verbs.filter(x => x.tum && x.key !== c.v.key && cls.every(k => x.ag.includes(k) || (x.ag.includes("per") && k === "per"))
      && !c.ktva.some(k => k.v.key === x.key)
      && (!c.v.dest || !c.obj || !x.loc || x.loc.includes(c.obj.n.pk as string)));
    for (const x of shuffle(vs)) {
      if (!cls.every(k => x.ag.includes(k))) continue;
      const t: { v: Verb; obj?: NP } = { v: x };
      if (x.obj && (this.objNeeded(x) || chance(.6))) {
        const o = this.pick(n => cls.every(k => this.objOk(x, n, k)) && (!c.subj.np || n.w !== c.subj.np.n.w), used);
        if (!o) { if (this.objNeeded(x)) continue; } else t.obj = { n: o, num: this.num(o) };
      }
      c.tum = t; return true;
    }
    return false;
  }
  // ── what can be added (वर्धय, and to make long sentences) ──
  ops(S: Sentence): { id: string; label: string; run: () => boolean }[] {
    const out: { id: string; label: string; run: () => boolean }[] = [];
    const used = () => this.used(S);
    const clauses: [string, Clause][] = [["main", S.main]];
    if (S.when) clauses.push(["when", S.when]);
    if (S.rel) clauses.push(["rel", S.rel]);
    for (const [cn, c] of clauses) {
      const subj = cn === "rel" ? S.main.subj : c.subj;
      const cls = this.agentClasses(subj);
      const isPer = cls.every(k => k === "per");
      // adjectives and owners on the noun phrases of this clause
      const nps: [string, NP][] = [];
      if (cn !== "rel" && c.subj.np && !(cn === "main" && S.rel)) nps.push(["subj", c.subj.np]);
      if (cn === "rel" && S.main.subj.np) nps.push(["subj", S.main.subj.np]);
      if (c.subj.and) nps.push(["and", c.subj.and]);
      for (const k of ["obj", "objAnd", "loc", "src", "rec", "inst", "com"] as const) { const x = c[k]; if (x) nps.push([k, x]); }
      c.ktva.forEach((k, i) => { if (k.obj) nps.push([`ktva${i}`, k.obj]); if (k.loc) nps.push([`ktvaloc${i}`, k.loc]); });
      if (c.tum?.obj) nps.push(["tum", c.tum.obj]);
      for (const [nk, np] of nps) {
        if (!np.adj) {
          const as = this.D.adj.filter(a => this.adjOk(a, np.n));
          if (as.length) out.push({ id: `${cn}.${nk}.adj`, label: "adjective", run: () => { np.adj = rnd(as); return true; } });
        }
        if (!np.poss && this.ownable(np.n)) {
          out.push({ id: `${cn}.${nk}.poss`, label: "owner", run: () => {
            const o = this.pick(n => n.k === "per" && n.w !== np.n.w && !(np.n.w === "पुत्र" && n.small) && !(np.n.kin && n.small), used());
            if (!o) return false; np.poss = { n: o, num: chance(.8) ? 0 : 2 }; return true;
          } });
        }
      }
      const vv = c.v;
      if (vv.obj && !c.obj && !vv.need_purpose) out.push({ id: `${cn}.obj`, label: vv.dest ? "where to" : "object", run: () => {
        const o = this.pick(n => cls.every(k => this.objOk(vv, n, k)) && (!subj.np || n.w !== subj.np.n.w)
          && (!vv.dest || !c.tum?.v.loc || c.tum.v.loc.includes(n.pk as string)), used());
        if (!o) return false; c.obj = { n: o, num: vv.dest ? 0 : this.num(o) }; return true;
      } });
      if (c.obj && !c.objAnd && !vv.dest && c.obj.n.k !== "abstract" && !c.obj.n.mass) out.push({ id: `${cn}.objAnd`, label: "a second object", run: () => {
        const o = this.pick(n => n.k === c.obj!.n.k && cls.every(k => this.objOk(vv, n, k)) && (!subj.np || n.w !== subj.np.n.w), used());
        if (!o) return false; c.objAnd = { n: o, num: this.num(o) }; return true;
      } });
      if (vv.loc && !c.loc) out.push({ id: `${cn}.loc`, label: "where", run: () => { const l = this.locFor(c, used()); if (!l) return false; c.loc = l; return true; } });
      const timeUsed = [S.main, S.when, S.rel].some(x => x && x.time !== undefined);
      const daily = [S.main, S.when, S.rel].some(x => x?.man === "daily" || x?.man === "always");
      if (c.time === undefined && !timeUsed) {
        const ts = this.D.time.map((t, i) => [t, i] as const).filter(([t]) => t[2].includes(c.tense));
        if (ts.length) out.push({ id: `${cn}.time`, label: "when", run: () => { c.time = rnd(ts)[1]; return true; } });
      }
      if (!c.man) {
        const ms = vv.man.filter(m => { const t = this.D.man[m]?.[2]; return (!t || t.includes(c.tense)) && !(daily && (m === "daily" || m === "always")); });
        if (ms.length) out.push({ id: `${cn}.man`, label: "how", run: () => { c.man = rnd(ms); return true; } });
      }
      if (vv.inst && !c.inst && isPer) out.push({ id: `${cn}.inst`, label: "with what", run: () => {
        const n = this.pick(x => vv.inst!.includes(x.w), used()); if (!n) return false;
        c.inst = { n, num: n.w === "पुष्प" ? 2 : 0 }; return true;
      } });
      if (vv.com && !c.com && isPer) out.push({ id: `${cn}.com`, label: "together with", run: () => {
        const n = this.pick(x => x.k === "per", used()); if (!n) return false; c.com = { n, num: chance(.75) ? 0 : 2 }; return true;
      } });
      if (vv.rec && !c.rec && c.obj) out.push({ id: `${cn}.rec`, label: "to whom", run: () => {
        const o = c.obj!.n;
        const n = this.pick(x => (o.k === "food" ? (o.eaters as string[]).includes(this.cls(x)) && (x.k === "per" || x.k === "ani")
          : o.k === "drink" ? (o.drinkers as string[]).includes(this.cls(x)) && (x.k === "per" || x.k === "ani") : x.k === "per")
          && (!subj.np || x.w !== subj.np.n.w), used());
        if (!n) return false; c.rec = { n, num: this.num(n, [.8, .05, .15]) }; return true;
      } });
      if (vv.src && !c.src) out.push({ id: `${cn}.src`, label: "from where", run: () => {
        const n = this.pick(x => vv.src!.some(s => s === "place" ? x.k === "place" && !["ground", "seat", "road"].includes(x.pk as string) && cls.every(k => this.placeOk(k, x.pk as string))
          && (!c.obj || x.w !== c.obj.n.w) : x.w === s || x.pk === s || !!x[s]) && (!subj.np || x.w !== subj.np.n.w), used());
        if (!n) return false; c.src = { n, num: 0 }; return true;
      } });
      if (c.ktva.length < (cn === "main" ? 2 : 1) && !vv.thing_agent) out.push({ id: `${cn}.ktva`, label: "an earlier action (…-त्वा)", run: () => {
        const vs = this.D.verbs.filter(x => x.ktva && x.key !== vv.key && !c.ktva.some(k => k.v.key === x.key) && c.tum?.v.key !== x.key && cls.every(k => x.ag.includes(k)));
        for (const x of shuffle(vs)) {
          const k: { v: Verb; obj?: NP; loc?: NP } = { v: x };
          if (x.obj && (this.objNeeded(x) || chance(.7))) {
            const o = this.pick(n => cls.every(kk => this.objOk(x, n, kk)) && (!subj.np || n.w !== subj.np.n.w), used());
            if (!o) { if (this.objNeeded(x)) continue; } else k.obj = { n: o, num: x.dest ? 0 : this.num(o) };
          } else if (x.loc && chance(.6)) { const l = this.locFor({ ...c, subj, v: x }, used(), x.loc); if (l) k.loc = l; }
          if (!k.obj && !k.loc && x.need_loc) continue;
          c.ktva.push(k); return true;
        }
        return false;
      } });
      if (vv.purpose && !c.tum) out.push({ id: `${cn}.tum`, label: "purpose (…-तुम्)", run: () => this.addTumInto(c, subj, used()) });
      // clause-level additions on the main clause
      if (cn === "main" && c.subj.np && !c.subj.and && !S.rel) out.push({ id: "main.and", label: "a second doer (… च)", run: () => {
        const a = c.subj.np!.n;
        const n = this.pick(x => this.cls(x) === this.cls(a) && x.k === a.k && this.canDo(vv, x) && this.fitsAll(c, x), used());
        if (!n) return false; c.subj.and = { n, num: this.num(n, [.75, .05, .2]) }; c.subj.pnum = 2 - (c.subj.np!.num === 0 && c.subj.and.num === 0 ? 1 : 0); return true;
      } });
      if (cn === "main" && !S.when && c.tense !== "lot") out.push({ id: "when", label: "a when-clause (यदा … तदा)", run: () => {
        const w = this.clause(used(), { tense: c.tense, noPron: true }); if (!w) return false;
        if (w.v.key === c.v.key) return false; S.when = w; return true;
      } });
      if (cn === "main" && !S.rel && c.subj.np && !c.subj.and && c.subj.person === 3) out.push({ id: "rel", label: "a who-clause (यः … सः)", run: () => {
        const vs = this.D.verbs.filter(x => x.key !== vv.key && !x.need_purpose && this.canDo(x, c.subj.np!.n));
        for (const x of shuffle(vs)) {
          const r: Clause = { subj: c.subj, v: x, tense: c.tense, ktva: [] };
          if (x.obj) {
            const o = this.pick(n => this.objOk(x, n, this.cls(c.subj.np!.n)) && n.w !== c.subj.np!.n.w, used());
            if (!o) { if (this.objNeeded(x)) continue; } else r.obj = { n: o, num: x.dest ? 0 : this.num(o) };
          } else if (x.loc) { const l = this.locFor(r, used()); if (!l) continue; r.loc = l; }
          S.rel = r; return true;
        }
        return false;
      } });
    }
    return out;
  }
  addTumInto(c: Clause, subj: Subj, used: Set<string>): boolean { const tmp = { ...c, subj }; if (!this.addTum(tmp, used)) return false; c.tum = tmp.tum; return true; }
  /** a second doer must fit everything already chosen for the first */
  fitsAll(c: Clause, x: Noun): boolean {
    const k = this.cls(x);
    if (c.obj && !this.objOk(c.v, c.obj.n, k)) return false;
    if (c.loc && !this.placeOk(k, c.loc.n.pk as string)) return false;
    if (c.inst || c.com) return k === "per";
    if (c.ktva.some(t => !t.v.ag.includes(k))) return false;
    if (c.tum && !c.tum.v.ag.includes(k)) return false;
    return true;
  }
  adjOk(a: Adj, n: Noun): boolean {
    return a.desc.some(d => d === "per!" ? n.k === "per" : d === "ani" ? n.k === "ani" : n.k === d || n.w === d || !!n[d]);
  }
  /** "the X's …": kin, things, a cow, horse, elephant or dog, a house, field, garden, chariot */
  ownable(n: Noun): boolean { return this.D.owned.some(o => o === n.w || (o === "kin" && !!n.kin) || (o === "thing" && n.k === "thing") || (n.k === "ani" && this.cls(n) === o)); }
  /** a sentence with min…max words */
  make(min: number, max: number, tries = 40): Sentence {
    let best: Sentence | null = null;
    for (let t = 0; t < tries; t++) {
      const c = this.clause(new Set()); if (!c) continue;
      const S: Sentence = { main: c };
      let guard = 0;
      while (this.count(S) < min && guard++ < 60) {
        const os = this.ops(S); if (!os.length) break;
        const big = this.count(S) + 6 <= max;
        const pool = os.filter(o => big || !["when", "rel", "main.ktva", "when.ktva"].includes(o.id));
        const o = rnd(pool.length ? pool : os); o.run();
      }
      const n = this.count(S);
      if (n >= min && n <= max) return S;
      if (!best || Math.abs(n - min) < Math.abs(this.count(best) - min)) best = S;
    }
    return best!;
  }
  count(S: Sentence): number { return this.flat(this.tree(S)).length; }

  // ── words ──
  nounTok(np: NP, cs: number, slot: string, why: string, dat = false): Tok {
    const c = np.n.d[np.num][cs];
    return { w: main(c), ok: [...alts(c), ...(dat ? alts(np.n.d[np.num][3]) : [])], why, stem: np.n.w, kind: "noun", slot, table: np.n.d, at: [np.num, cs], g: np.n.g };
  }
  adjTok(np: NP, cs: number, slot: string): Tok {
    const a = np.adj!; const c = a.d[np.n.g][np.num][cs];
    return { w: main(c), ok: alts(c), why: `${a.w}: agrees with ${main(np.n.d[np.num][cs])} — ${GEN_SA[np.n.g]}, ${CASES[cs]}, ${NUM_SA[np.num]}`,
      stem: a.w, kind: "adj", slot: slot + ".adj", table: a.d[np.n.g], at: [np.num, cs], g: np.n.g };
  }
  npNode(np: NP, cs: number, slot: string, why: string, dat = false): Node {
    const mods: Node[] = [];
    if (np.adj) mods.push({ t: "w", tok: this.adjTok(np, cs, slot) });
    if (np.poss) mods.push(this.npNode(np.poss, 5, slot + ".poss", "owner → 6th case (षष्ठी शेषे 2.3.50)"));
    const head: Node = { t: "w", tok: this.nounTok(np, cs, slot, why, dat) };
    return mods.length ? { t: "seq", c: [{ t: "free", c: mods }, head] } : head;
  }
  avy(w: string, slot: string, why: string): Node { return { t: "w", tok: { w, ok: [w], why, kind: "avy", slot } }; }
  verbIdx(s: Subj): number { return ({ 3: 0, 2: 1, 1: 2 } as const)[s.person] * 3 + s.pnum; }
  verbTok(c: Clause, slot: string): Tok {
    const s = c.subj; const i = this.verbIdx(s); const cell = c.v.f[c.tense][i];
    const who = s.person === 3 ? (s.and ? `two doers joined by च → ${NUM_SA[s.pnum]}` : `the doer is ${NUM_SA[s.pnum]}`) : `the doer is ${s.person === 1 ? "उत्तमपुरुषः (I / we)" : "मध्यमपुरुषः (you)"}, ${NUM_SA[s.pnum]}`;
    return { w: main(cell), ok: alts(cell), why: `${c.v.key}, ${TENSE[c.tense][0]} (${TENSE[c.tense][1]}): ${who}`, stem: c.v.key, kind: "verb", slot,
      table: [0, 1, 2].map(p => c.v.f[c.tense].slice(p * 3, p * 3 + 3)), at: [Math.floor(i / 3), i % 3] };
  }
  clauseNodes(c: Clause, tag: string, subjNode: Node | null): Node[] {
    const out: Node[] = [];
    if (subjNode) out.push(subjNode);
    if (c.time !== undefined) out.push(this.avy(this.D.time[c.time][0], `${tag}.time`, `when: ${this.D.time[c.time][1]}`));
    if (c.com) out.push({ t: "seq", c: [this.npNode(c.com, 2, `${tag}.com`, "with सह → 3rd case (सहयुक्तेऽप्रधाने 2.3.19)"), this.avy("सह", `${tag}.saha`, "together with")] });
    c.ktva.forEach((k, i) => {
      const parts: Node[] = [];
      if (k.obj) parts.push(this.npNode(k.obj, 1, `${tag}.ktva${i}`, k.v.dest
        ? "where to → 2nd case (कर्मणि द्वितीया 2.3.2); the 4th case is also right (गत्यर्थकर्मणि द्वितीयाचतुर्थ्यौ चेष्टायामनध्वनि 2.3.12)"
        : "its object → 2nd case (कर्मणि द्वितीया 2.3.2)", !!k.v.dest));
      if (k.loc) parts.push(this.npNode(k.loc, 6, `${tag}.ktvaloc${i}`, "where → 7th case (सप्तम्यधिकरणे च 2.3.36)"));
      const g = { t: "w" as const, tok: { w: main(k.v.ktvaF), ok: alts(k.v.ktvaF), why: `${k.v.key} + ${k.v.ktvaF.split("|")[0].endsWith("य") ? "ल्यप् (with a prefix: समासेऽनञ्पूर्वे क्त्वो ल्यप् 7.1.37)" : "क्त्वा"}: an earlier action of the same doer (समानकर्तृकयोः पूर्वकाले 3.4.21)`, stem: k.v.key, kind: "verb" as const, slot: `${tag}.ktvaV${i}` } };
      out.push(parts.length ? { t: "seq", c: [parts.length > 1 ? { t: "free", c: parts } : parts[0], g] } : g);
    });
    if (c.src) out.push(this.npNode(c.src, 4, `${tag}.src`, "from where → 5th case (अपादाने पञ्चमी 2.3.28)"));
    if (c.loc) out.push(this.npNode(c.loc, 6, `${tag}.loc`, "where → 7th case (सप्तम्यधिकरणे च 2.3.36)"));
    if (c.rec) out.push(this.npNode(c.rec, 3, `${tag}.rec`, "to whom → 4th case (चतुर्थी सम्प्रदाने 2.3.13)"));
    if (c.inst) out.push(this.npNode(c.inst, 2, `${tag}.inst`, "with what → 3rd case (कर्तृकरणयोस्तृतीया 2.3.18)"));
    if (c.obj) {
      const why = c.v.dest ? "where to → 2nd case (कर्मणि द्वितीया 2.3.2); the 4th case is also right (गत्यर्थकर्मणि द्वितीयाचतुर्थ्यौ चेष्टायामनध्वनि 2.3.12)"
        : "object → 2nd case (कर्मणि द्वितीया 2.3.2)";
      const o = this.npNode(c.obj, 1, `${tag}.obj`, why, !!c.v.dest);
      out.push(c.objAnd ? { t: "seq", c: [{ t: "free", c: [o, this.npNode(c.objAnd, 1, `${tag}.objAnd`, why)] }, this.avy("च", `${tag}.objca`, "and")] } : o);
    }
    if (c.tum) {
      const t = { t: "w" as const, tok: { w: main(c.tum.v.tumF), ok: alts(c.tum.v.tumF), why: `${c.tum.v.key} + तुमुन्: ${c.v.need_purpose ? "with a verb of wishing, the same doer (समानकर्तृकेषु तुमुन् 3.3.158)" : "the purpose (तुमुन्ण्वुलौ क्रियायां क्रियार्थायाम् 3.3.10)"}`, stem: c.tum.v.key, kind: "verb" as const, slot: `${tag}.tumV` } };
      out.push(c.tum.obj ? { t: "seq", c: [this.npNode(c.tum.obj, 1, `${tag}.tum`, "its object → 2nd case (कर्मणि द्वितीया 2.3.2)"), t] } : t);
    }
    if (c.man) out.push(this.avy(this.D.man[c.man][0], `${tag}.man`, `how: ${this.D.man[c.man][1]}`));
    out.push({ t: "w", tok: this.verbTok(c, `${tag}.verb`) });
    return out;
  }
  subjNode(c: Clause, tag: string): Node | null {
    const s = c.subj;
    if (!s.np) { const w = this.D.pers[String(s.person) as "1" | "2"][s.pnum]; return this.avy(w, `${tag}.subj`, `the doer: ${s.person === 1 ? "I / we" : "you"}`); }
    const a = this.npNode(s.np, 0, `${tag}.subj`, "the doer → 1st case (अभिहिते कर्तरि प्रथमा)");
    if (!s.and) return a;
    return { t: "seq", c: [{ t: "free", c: [a, this.npNode(s.and, 0, `${tag}.and`, "a second doer → 1st case (अभिहिते कर्तरि प्रथमा)")] }, this.avy("च", `${tag}.ca`, "and")] };
  }
  relPron(which: "यद्" | "तद्", np: NP, slot: string): Node {
    const c = this.D.rel[which][np.n.g][np.num][0];
    return { t: "w", tok: { w: main(c), ok: alts(c), why: `${which}: ${GEN_SA[np.n.g]}, ${NUM_SA[np.num]} like ${np.n.w}, 1st case (the doer of its clause)`, stem: which,
      kind: "pron", slot, table: this.D.rel[which][np.n.g], at: [np.num, 0], g: np.n.g } };
  }
  tree(S: Sentence): Node {
    const parts: Node[] = [];
    if (S.when) parts.push({ t: "seq", c: [this.avy("यदा", "when.yada", "when"), { t: "free", c: this.clauseNodes(S.when, "when", this.subjNode(S.when, "when")) }] });
    if (S.rel) {
      const np = S.main.subj.np!;
      parts.push({ t: "seq", c: [this.relPron("यद्", np, "rel.yah"), { t: "free", c: this.clauseNodes(S.rel, "rel", this.subjNode(S.main, "main")) }] });
      const head = [this.relPron("तद्", np, "main.sah")];
      if (S.when) head.unshift(this.avy("तदा", "main.tada", "then"));
      parts.push({ t: "seq", c: [...head, { t: "free", c: this.clauseNodes(S.main, "main", null) }] });
    } else {
      const body: Node = { t: "free", c: this.clauseNodes(S.main, "main", this.subjNode(S.main, "main")) };
      parts.push(S.when ? { t: "seq", c: [this.avy("तदा", "main.tada", "then"), body] } : body);
    }
    return parts.length === 1 ? parts[0] : { t: "seq", c: parts };
  }
  flat(n: Node): Tok[] { return n.t === "w" ? [n.tok] : n.c.flatMap(x => this.flat(x)); }

  // ── English ──
  npEn(np: NP, art = true): string {
    const n = np.n; const noun = np.num === 0 ? n.en : n.pl;
    const two = np.num === 1 ? "two " : "";
    const adj = np.adj ? np.adj.en + " " : "";
    if (np.poss) { const o = this.npEn(np.poss); return `${o.endsWith("s") && np.poss.num ? o + "'" : o + "'s"} ${two}${adj}${noun}`; }
    const a = !art || (n.mass && n.w !== "सत्य") ? "" : "the ";
    return `${a}${two}${adj}${noun}`;
  }
  subjEn(s: Subj): string {
    if (!s.np) return s.person === 1 ? ["I", "we two", "we"][s.pnum] : ["you", "you two", "you all"][s.pnum];
    return s.and ? `${this.npEn(s.np)} and ${this.npEn(s.and)}` : this.npEn(s.np);
  }
  verbEn(c: Clause, sub = false): string {
    const [b, s3, p] = c.v.en; const sg3 = c.subj.person === 3 && c.subj.pnum === 0;
    return c.tense === "lat" || (sub && c.tense === "lrt") ? (sg3 ? s3 : b) : c.tense === "lan" ? p : c.tense === "lrt" ? "will " + b : c.tense === "vidhilin" ? "should " + b : b;
  }
  placeEn(np: NP, to = false, from = false): string {
    const pk = np.n.pk as string;
    return `${from ? "from" : to ? "to" : (this.D.placeEn[pk] ?? "in the").split(" ")[0]} ${this.npEn(np)}`;
  }
  instEn(np: NP): string { return np.n.w === "रथ" ? `in ${this.npEn(np)}` : np.n.w === "अश्व" ? `on ${this.npEn(np)}` : `with ${this.npEn(np)}`; }
  actEn(v: Verb, obj?: NP, loc?: NP, form: "ing" | "to" = "to"): string {
    const base = v.en[0];
    const head = form === "to" ? `to ${base}` : `having ${v.en[2].replace(/^(\w+)( to)?$/, (_, w, t) => (PP[w] ?? w) + (t ?? ""))}`;
    return [head, obj ? (v.dest ? this.placeEn(obj, true) : this.npEn(obj)) : "", loc ? this.placeEn(loc) : ""].filter(Boolean).join(" ");
  }
  clauseEn(c: Clause, subj = true, rel = "", sub = false): string {
    const w: string[] = [];
    if (subj) w.push(this.subjEn(c.subj) + rel);
    w.push(this.verbEn(c, sub));
    if (c.obj) w.push(c.v.dest ? this.placeEn(c.obj, true) : c.objAnd ? `${this.npEn(c.obj)} and ${this.npEn(c.objAnd)}` : this.npEn(c.obj));
    if (c.rec) w.push(`to ${this.npEn(c.rec)}`);
    if (c.inst) w.push(this.instEn(c.inst));
    if (c.com) w.push(`with ${this.npEn(c.com)}`);
    if (c.src) w.push(c.src.n.k === "place" ? this.placeEn(c.src, false, true) : `from ${this.npEn(c.src)}`);
    if (c.loc) w.push(this.placeEn(c.loc));
    if (c.man) w.push(this.D.man[c.man][1]);
    if (c.tum) w.push(this.actEn(c.tum.v, c.tum.obj, undefined, "to"));
    if (c.time !== undefined) w.push(this.D.time[c.time][1]);
    let s = w.join(" ");
    if (c.ktva.length) s = c.ktva.map(k => this.actEn(k.v, k.obj, k.loc, "ing")).join(", ") + ", " + s;
    return s;
  }
  english(S: Sentence): string {
    const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
    if (S.main.tense === "lot") return `${cap(this.subjEn(S.main.subj))}, ${this.clauseEn(S.main, false)}!`;
    const rel = S.rel ? `, ${S.main.subj.np!.n.k === "per" ? "who" : "which"} ${this.clauseEn(S.rel, false)},` : "";
    let m = this.clauseEn(S.main, true, rel);
    if (S.when) m = `when ${this.clauseEn(S.when, true, "", true)}, ${m}`;
    return cap(m.replace(/,\s*,/g, ",").replace(/\s+/g, " ").trim()) + ".";
  }
}
// past participles for "having …" where they differ from the past tense
const PP: Record<string, string> = { ate: "eaten", drank: "drunk", went: "gone", came: "come", ran: "run", sang: "sung", spoke: "spoken", gave: "given",
  saw: "seen", wrote: "written", fell: "fallen", did: "done", sat: "sat" };

// ── writing the sentence: words apart, म् + consonant → ं ──
const VOWEL0 = /^[अआइईउऊऋॠऌएऐओऔ]/;
export function write(ws: string[]): string {
  return ws.map((w, i) => (w.endsWith("म्") && ws[i + 1] && !VOWEL0.test(ws[i + 1]) ? w.slice(0, -2) + "ं" : w)).join(" ") + "।";
}

// ── is this order correct? (phrases may move, words of a phrase stay together) ──
export function orderOk(root: Node, ws: string[]): boolean {
  const memo = new Map<string, number[]>();
  let id = 0; const ids = new Map<Node, number>();
  const nid = (n: Node) => { if (!ids.has(n)) ids.set(n, id++); return ids.get(n)!; };
  function ends(n: Node, i: number): number[] {
    const key = `${nid(n)}@${i}`; const m = memo.get(key); if (m) return m;
    let out: number[] = [];
    if (n.t === "w") out = ws[i] === n.tok.w ? [i + 1] : [];
    else if (n.t === "seq") {
      let cur = [i];
      for (const c of n.c) { const nx = new Set<number>(); for (const p of cur) for (const e of ends(c, p)) nx.add(e); cur = [...nx]; if (!cur.length) break; }
      out = cur;
    } else {
      const k = n.c.length; const res = new Set<number>(); const seen = new Set<string>();
      const go = (mask: number, p: number) => {
        const s = `${mask}:${p}`; if (seen.has(s)) return; seen.add(s);
        if (mask === (1 << k) - 1) { res.add(p); return; }
        for (let j = 0; j < k; j++) if (!(mask & (1 << j))) for (const e of ends(n.c[j], p)) go(mask | (1 << j), e);
      };
      go(0, i); out = [...res];
    }
    memo.set(key, out); return out;
  }
  return ends(root, 0).includes(ws.length);
}

// ── wrong forms of the same word (options, distractors, mistakes) ──
/** other cells of the word's own table whose forms differ from every accepted form */
export function wrongForms(t: Tok, n = 3, prefer?: "case" | "num"): string[] {
  if (!t.table || !t.at) return [];
  const bad = new Set(t.ok);
  const [r0, c0] = t.at;
  const cells: [number, number, string][] = [];
  t.table.forEach((row, r) => row.forEach((c, k) => { if (k < 7 && c && !alts(c).some(a => bad.has(a))) cells.push([r, k, main(c)]); }));
  const score = ([r, k]: [number, number, string]) => (prefer === "num" ? (k === c0 ? 0 : 2) : prefer === "case" ? (r === r0 ? 0 : 2) : (r === r0 || k === c0 ? 0 : 1)) + Math.random();
  const out: string[] = []; const seen = new Set<string>();
  for (const c of cells.sort((a, b) => score(a) - score(b))) { if (!seen.has(c[2])) { seen.add(c[2]); out.push(c[2]); } if (out.length >= n) break; }
  return out;
}
/** for a verb: the other persons and numbers of the same tense, and the same person in other tenses */
export function wrongVerb(t: Tok, v: Verb | undefined, n = 3): string[] {
  if (!v || !t.at) return wrongForms(t, n);
  const i = t.at[0] * 3 + t.at[1]; const bad = new Set(t.ok); const out: string[] = []; const seen = new Set<string>();
  const add = (c?: string) => { if (c && !alts(c).some(a => bad.has(a))) { const m = main(c); if (!seen.has(m)) { seen.add(m); out.push(m); } } };
  const tense = Object.keys(v.f).find(k => v.f[k][i] && alts(v.f[k][i]).some(a => bad.has(a))) ?? "lat";
  for (const j of shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8].filter(j => j !== i))) { if (out.length >= n - 1) break; add(v.f[tense][j]); }
  for (const k of shuffle(Object.keys(v.f).filter(k => k !== tense))) { if (out.length >= n) break; add(v.f[k][i]); }
  return out.slice(0, n);
}
