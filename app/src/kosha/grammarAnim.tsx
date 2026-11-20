// ═══════════════════════════════════════════════════════════════
//  kosha/grammarAnim.tsx — animated explanations for the व्याकरणम् page.
//  They animate the page's own texts and examples (app/src/data/grammar.json):
//    SandhiJoin      two words slide together; the meeting sounds light up and change into the result
//    SandhiExamples  plays every example of a sandhi rule one after another
//    ExampleScene    the four kinds of sandhi / the two places, from their example lines
//    StageFilm       the step-by-step stages, played as a film
//    CompoundScene   लौकिकविग्रहः → अलौकिकविग्रहः → the endings drop → the compound
//    DominanceScene  which word's meaning leads in the four kinds of compound
//  Players come from learn/anim.tsx; the reader's script setting is respected (useSa).
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GRAMMAR, type SandhiRule, type Samasa } from "../data";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import { useSteps, Controls, Morph } from "../learn/anim";
import "../learn/learn.css";
import "./grammar-anim.css";

type Sfn = (t: string | undefined | null) => string;
// ── sounds (वर्णाः), not written syllables: दधि = द् अ ध् इ ──
const SIGN2V: Record<string, string> = { "ा": "आ", "ि": "इ", "ी": "ई", "ु": "उ", "ू": "ऊ", "ृ": "ऋ", "ॄ": "ॠ", "ॢ": "ऌ", "ॣ": "ॡ", "े": "ए", "ै": "ऐ", "ो": "ओ", "ौ": "औ" };
const V2SIGN: Record<string, string> = Object.fromEntries(Object.entries(SIGN2V).map(([k, v]) => [v, k]));
const isCons = (c: string) => /[क-हक़-य़]/.test(c);
/** "दधि" → ["द्", "अ", "ध्", "इ"]; anusvāra, visarga, avagraha and spaces are sounds/marks of their own */
export function sounds(t: string): string[] {
  const c = [...t], out: string[] = [];
  for (let i = 0; i < c.length; i++) {
    const ch = c[i];
    if (isCons(ch)) {
      let base = ch; if (c[i + 1] === "़") { base += "़"; i++; }
      const nx = c[i + 1];
      if (nx === "्") { out.push(base + "्"); i++; }
      else if (nx && SIGN2V[nx]) { out.push(base + "्", SIGN2V[nx]); i++; }
      else out.push(base + "्", "अ");
    } else if (ch === "३" && out.length && !out[out.length - 1].endsWith("्")) out[out.length - 1] += ch;   // प्लुत mark stays with its vowel
    else out.push(ch);
  }
  return out;
}
/** back to writing: ["द्","अ","ध्"] → "दध्" */
export function write(ph: string[]): string {
  let s = "";
  for (let i = 0; i < ph.length; i++) {
    const p = ph[i], nx = ph[i + 1], v = nx?.replace("३", ""), pl = nx?.endsWith("३") ? "३" : "";
    if (p.endsWith("्") && v && (v === "अ" || V2SIGN[v])) { s += p.slice(0, -1) + (v === "अ" ? "" : V2SIGN[v]) + pl; i++; }
    else s += p;
  }
  return s;
}
const eq = (x: string[], y: string[], at = 0) => x.every((v, k) => y[at + k] === v);

/** a + b → r, sound by sound: the last sound(s) of a and the first sound of b meet and become `mid`.
 *  before: aKeep·aMeet + bMeet·bKeep    after: r (= aKeep·mid·rest) */
export function junction(a: string, b: string, r: string) {
  const R0 = r.split(/\s*\/\s*/)[0].trim();
  const A = sounds(a), B = sounds(b), R = sounds(R0);
  // as few sounds of a as possible: the rest must start the result unchanged (रामः: अः together if अ also changes)
  let k = 1; while (k < A.length && !eq(A.slice(0, A.length - k), R)) k++;
  const aKeep = A.slice(0, A.length - k), aMeet = A.slice(A.length - k);
  // the first sound of b meets; find where the rest of b carries on in the result
  let m = 1, j = -1;
  for (; m <= B.length; m++) {
    const bKeep = B.slice(m);
    if (!bKeep.length) { j = R.length; break; }
    const need = Math.min(2, bKeep.length);
    for (let x = aKeep.length; x < R.length; x++) if (eq(bKeep.slice(0, need), R, x)) { j = x; break; }
    if (j < 0 && need === 2) for (let x = aKeep.length; x < R.length; x++) if (R[x] === bKeep[0]) { j = x; break; }
    if (j >= 0) break;
  }
  if (j < 0) { m = B.length; j = R.length; }
  let mid = R.slice(aKeep.length, j).filter(x => x !== " ");
  const bm = B.slice(0, m);
  if (mid.length === bm.length && mid.every((x, i) => x === bm[i]) && aMeet.some(x => x !== " ")) mid = ["∅", ...mid];   // a's sound just drops (लोपः)
  return { aKeep: write(aKeep), aMeet: aMeet.filter(x => x !== " "), bMeet: B.slice(0, m), bKeep: write(B.slice(m)), mid, r: R0 };
}

/** the animation itself: replays whenever its key changes */
export const SandhiJoin: React.FC<{ a: string; b: string; r: string; S: Sfn; small?: boolean }> = ({ a, b, r, S, small }) => {
  const j = junction(a, b, r);
  const letters = (xs: string[]) => xs.map((x, i) => <React.Fragment key={i}>{i > 0 && <span className="ga-op">+</span>}<span className="ga-snd ks-l-sa">{S(x)}</span></React.Fragment>);
  return (
    <div className={`ga-join ${small ? "small" : ""}`} aria-label={`${a} + ${b} → ${r}`}>
      <div className="ga-row ga-before">
        <span className="ga-word ga-a"><span className="ks-l-sa">{S(j.aKeep)}</span>{j.aMeet.map((x, i) => <span key={i} className="ga-meet ks-l-sa">{S(x)}</span>)}</span>
        <span className="ga-plus">+</span>
        {b ? <span className="ga-word ga-b">{j.bMeet.map((x, i) => <span key={i} className="ga-meet ks-l-sa">{S(x)}</span>)}<span className="ks-l-sa">{S(j.bKeep)}</span></span>
           : <span className="ga-word ga-b ga-pause"><span className="ks-l-sa">{S("अवसानम्")}</span> <small>(pause)</small></span>}
      </div>
      <div className="ga-eq">
        <span className="ga-eq-in">{letters([...j.aMeet, ...j.bMeet])}</span>
        <span className="ga-eq-arrow">→</span>
        <span className="ga-eq-out">{j.mid.length ? letters(j.mid) : <span className="ga-snd">∅</span>}</span>
      </div>
      <button className="ga-row ga-after ks-l-sa" onClick={() => speak(j.r)} title="Listen">{S(j.r)} <small>🔊</small></button>
    </div>
  );
};

/** "X + Y → Z" (the example lines in the texts) */
const parseLine = (t: string) => { const m = t.match(/^(.+?)\s*\+\s*(.+?)\s*→\s*(.+)$/); return m ? { a: m[1].trim(), b: m[2].trim(), r: m[3].trim() } : null; };

/** a list of named example lines (the four kinds, the two places), one after another */
export const ExampleScene: React.FC<{ title: string; items: { name: string; en: string; ex: string }[] }> = ({ title, items }) => {
  const S = useSa();
  const ok = items.map(x => ({ ...x, p: parseLine(x.ex) })).filter(x => x.p);
  const s = useSteps(ok.length, 3200);
  const cur = ok[s.i];
  if (!cur) return null;
  return (
    <div className="an-scene">
      <div className="an-scene-title">🎬 {title}</div>
      <div className="ga-tabs">{ok.map((x, k) => <button key={x.name} className={k === s.i ? "on" : ""} onClick={() => s.go(k)}><span className="ks-l-sa">{S(x.name)}</span></button>)}</div>
      <div key={s.i}><SandhiJoin a={cur.p!.a} b={cur.p!.b} r={cur.p!.r} S={S} /></div>
      <p className="an-cap" key={`c${s.i}`}><b className="ks-l-sa">{S(cur.name)}</b> — {cur.en}</p>
      <Controls s={s} />
    </div>
  );
};

/** every example of one rule, played one after another; the table rows can start it at any example */
export const SandhiExamples: React.FC<{ rule: SandhiRule; at?: [number, number] }> = ({ rule, at }) => {
  const S = useSa();
  const s = useSteps(rule.ex.length, 2800);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {                                   // a tapped table row: jump to it and bring the player into view
    if (!at) return;
    s.go(at[0]);
    box.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [at?.[1]]);   // eslint-disable-line react-hooks/exhaustive-deps
  const e = rule.ex[s.i];
  return (
    <div className="an-scene" ref={box}>
      <div className="an-scene-title">🎬 {S(rule.name)} · watch the sounds meet</div>
      <div key={`${rule.id}-${s.i}`}><SandhiJoin a={e.a} b={e.b} r={e.r} S={S} /></div>
      <p className="an-cap ks-l-sa" key={`c${s.i}`}>{S(rule.sutra)}{e.note ? ` · ${S(e.note)}` : ""}</p>
      <Controls s={s} label={`${s.i + 1} / ${rule.ex.length}`} />
    </div>
  );
};

/** the step-by-step stages (हरे + इह → हर इह …) as films */
export const StageFilm: React.FC<{ st: { title: string; steps: [string, string][]; note: string } }> = ({ st }) => {
  const S = useSa();
  const s = useSteps(st.steps.length, 2200);
  const [f, why] = st.steps[s.i];
  return (
    <div className="an-film ga-film">
      <div className="ga-film-title ks-l-sa">{S(st.title)}</div>
      <div className="an-film-form"><Morph prev={s.i ? st.steps[s.i - 1][0] : undefined} cur={f} k={s.i} S={S} /></div>
      <p className="an-film-why ks-l-sa" key={`w${s.i}`}>{S(why)}</p>
      <Controls s={s} />
      {s.i === st.steps.length - 1 && <p className="ga-film-note ks-l-sa">{S(st.note)}</p>}
    </div>
  );
};

// ═══ समासः ═══
const SUP = new Set("सु औ जस् अम् औट् शस् टा भ्याम् भिस् ङे भ्यस् ङसि ङस् ओस् आम् ङि सुप्".split(" "));
/** "राजन् ङस् पुरुष सु" → [{stem: राजन्, sup: ङस्}, {stem: पुरुष, sup: सु}] */
export function parseAlaukika(a: string): { stem: string; sup?: string }[] {
  const out: { stem: string; sup?: string }[] = [];
  for (const t of a.split(/\s+/).filter(Boolean)) {
    if (SUP.has(t) && out.length && !out[out.length - 1].sup) out[out.length - 1].sup = t;
    else out.push({ stem: t });
  }
  return out;
}
const DOM = GRAMMAR.samasa.dominance.types;
/** the page's own dominance line for a major kind */
const dominanceOf = (m: string) => {
  const key = m.replace(/समासः$|ः$/, "").slice(0, 4);
  return DOM.find(t => t.name.startsWith(key))?.meaning_dominance ?? "";
};
const STEP_TITLES: [string, string][] = [
  ["लौकिकविग्रहः", "the phrase in ordinary words"],
  ["अलौकिकविग्रहः", "stems with their case endings"],
  ["सुपो धातुप्रातिपदिकयोः (2.4.71)", "the case endings inside the compound drop"],
  ["समस्तपदम्", "the stems join (with sandhi) into one word"],
];
export const CompoundScene: React.FC<{ e: Samasa; title?: string }> = ({ e, title }) => {
  const S = useSa();
  const parts = useMemo(() => parseAlaukika(e.a), [e.a]);
  const s = useSteps(e.a ? 4 : 2, 2300);
  const step = e.a ? s.i : (s.i === 0 ? 0 : 3);
  const dom = dominanceOf(e.m);
  return (
    <div className="an-scene">
      <div className="an-scene-title">🎬 {title ?? `${S(e.w)} · how the compound is made`}</div>
      <div className="ga-cstage" key={`${e.w}-${step}`}>
        {step === 0 && <div className="ga-phrase ks-l-sa">{e.l.split(/\s+/).map((w, k) => <span key={k} className="ga-pw" style={{ animationDelay: `${k * .15}s` }}>{S(w)}</span>)}</div>}
        {(step === 1 || step === 2) && <div className="ga-phrase">{parts.map((p, k) => (
          <span key={k} className="ga-unit" style={{ animationDelay: `${k * .15}s` }}>
            <span className="ga-stem ks-l-sa">{S(p.stem)}</span>
            {p.sup && <span className={`ga-sup ks-l-sa ${step === 2 ? "gone" : ""}`}>{S(p.sup)}</span>}
          </span>))}</div>}
        {step === 3 && <div className="ga-phrase">
          <button className="an-result ks-l-sa" onClick={() => speak(e.w)}>{S(e.w)} <small>🔊</small></button></div>}
      </div>
      <p className="an-cap" key={`c${step}`}><b className="ks-l-sa">{S(STEP_TITLES[step][0])}</b> — {STEP_TITLES[step][1]}
        {step === 3 && <><br /><span className="ks-l-sa">{S(e.t)}</span>{dom ? <> · <span className="ks-l-sa">{S(dom)}</span></> : null}</>}</p>
      <Controls s={s} />
    </div>
  );
};

/** one example per major kind, to open the samāsa tab */
export const CompoundIntro: React.FC = () => {
  const S = useSa();
  const picks = useMemo(() => ["राजपुरुषः", "यथाशक्ति", "हरिहरौ", "पीताम्बरः", "भूतपूर्वः"]
    .map(w => GRAMMAR.samasa.ex.find(e => e.w === w)).filter(Boolean) as Samasa[], []);
  const [k, setK] = useState(0);
  if (!picks.length) return null;
  return (
    <>
      <div className="ga-tabs">{picks.map((e, i) => <button key={e.w} className={i === k ? "on" : ""} onClick={() => setK(i)}><span className="ks-l-sa">{S(e.w)}</span> <small className="ks-l-sa">{S(e.m)}</small></button>)}</div>
      <CompoundScene key={picks[k].w} e={picks[k]} title="समासः कथं भवति? · How a compound is made" />
    </>
  );
};

/** which word's meaning leads: पूर्वपदम्, उत्तरपदम्, both, or something else */
const DOM_DEMO: [string, string, string, number[]][] = [
  // kind, first word, second word, which leads (0 first, 1 second, 2 something outside); examples are the page's own
  ["अव्ययीभावः", "उप", "गङ्गम्", [0]],
  ["तत्पुरुष", "विष्णु", "पत्नी", [1]],
  ["द्वन्द्वः", "पार्वती", "परमेश्वरौ", [0, 1]],
  ["बहुव्रीहिः", "पीत", "अम्बरः", [2]],
];
export const DominanceScene: React.FC = () => {
  const S = useSa();
  const s = useSteps(DOM_DEMO.length, 2600);
  const [kind, a, b, glow] = DOM_DEMO[s.i];
  const t = DOM.find(x => x.name.startsWith(kind.slice(0, 4)));
  const dom = t?.meaning_dominance ?? ""; const ex = t?.example_laukika ?? "";
  return (
    <div className="an-scene">
      <div className="an-scene-title">🎬 कस्य अर्थः प्रधानः? · Whose meaning leads</div>
      <div className="ga-dom" key={s.i}>
        <span className={`ga-dw ks-l-sa ${glow.includes(0) ? "lead" : ""}`}>{S(a)}</span>
        <span className={`ga-dw ks-l-sa ${glow.includes(1) ? "lead" : ""}`}>{S(b)}</span>
        {glow.includes(2) && <span className="ga-dw ga-third lead" aria-label="the thing described">👤</span>}
      </div>
      <p className="an-cap" key={`c${s.i}`}><b className="ks-l-sa">{S(t?.name ?? kind)}</b> · <span className="ks-l-sa">{S(ex)}</span><br /><span className="ks-l-sa">{S(dom)}</span></p>
      <Controls s={s} />
    </div>
  );
};
