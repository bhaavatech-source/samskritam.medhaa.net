// ═══════════════════════════════════════════════════════════════
//  search/FormFinder.tsx — shows what a typed word is: which root or noun, which
//  lakāra / vibhakti, person and number, and which upasargas it carries.
//  Used by the search boxes of धातुकोशः and शब्दकोशः and by अन्विष्यताम्.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useState } from "react";
import { LAKARA, VACANA, VIBHAKTI, VIBHAKTI_EN, VACANA_EN, PRAYOGA } from "../data";
import { useSa } from "../i18n/script";
import { analyseVerb, analyseNoun, loadRoots, toDeva, UPASARGAS, type VerbAnalysis, type NounHit, type RootRow } from "./forms";
import "./forms.css";

const UP = Object.fromEntries(UPASARGAS);
const KRT: Record<string, [string, string]> = {
  ktvA: ["क्त्वा", "having done"], lyap: ["ल्यप्", "having done"], tumun: ["तुमुन्", "to do"], Ramul: ["णमुल्", "doing repeatedly"],
  kta: ["क्त", "done (past participle)"], ktavatu: ["क्तवतु", "one who has done"], Satf: ["शतृ", "doing (present participle)"],
  SAnac: ["शानच्", "doing (present participle)"], tavyat: ["तव्यत्", "to be done"], anIyar: ["अनीयर्", "to be done"], yat: ["यत्", "to be done"],
  Ryat: ["ण्यत्", "to be done"], kyap: ["क्यप्", "to be done"], tfc: ["तृच्", "doer"], Rvul: ["ण्वुल्", "doer"], lyuw: ["ल्युट्", "the act of"],
  ktin: ["क्तिन्", "the act / state of"], GaY: ["घञ्", "the act of"], ac: ["अच्", "doer / act"], ap: ["अप्", "the act of"],
  izRuc: ["इष्णुच्", "tending to"], kvip: ["क्विप्", "doer (root noun)"],
};
/** first letter of a two-letter prayoga code (see search/forms.ts) */
const SANADI: Record<string, [string, string]> = { c: ["णिजन्तम्", "causative"], s: ["सन्नन्तम्", "desiderative"] };
const PURUSHA_SHORT = ["प्रथमपुरुषः", "मध्यमपुरुषः", "उत्तमपुरुषः"];
/** one word of a sentence: Devanāgarī letters only, no punctuation */
export const cleanWord = (q: string) => q.trim().replace(/[।॥|,.;:!?'"()\d०-९]/g, "").split(/\s+/).filter(Boolean);

type Result = { verbs: VerbAnalysis[]; nouns: NounHit[]; roots: RootRow[] };

export const FormFinder: React.FC<{ q: string; onRoot?: (mdh: string) => void; onWord?: (id: string) => void; onIds?: (ids: string[]) => void; nouns?: boolean; verbs?: boolean }> =
  ({ q, onRoot, onWord, onIds, nouns = true, verbs = true }) => {
  const S = useSa();
  const [res, setRes] = useState<Result | null>(null);
  const word = cleanWord(q).length === 1 && /[ऀ-ॿ]/.test(q) ? cleanWord(q)[0] : "";
  useEffect(() => {
    let live = true;
    if (!word) { setRes(null); onIds?.([]); return; }
    const t = setTimeout(async () => {
      const [vs, roots] = verbs ? await Promise.all([analyseVerb(word), loadRoots()]) : [[], []] as [VerbAnalysis[], RootRow[]];
      const ns = nouns ? analyseNoun(word) : [];
      if (!live) return;
      setRes({ verbs: vs, nouns: ns, roots });
      onIds?.([...new Set([...vs.flatMap(a => a.hits.map(h => roots[h.root][3])), ...ns.map(n => n.w.id)])]);
    }, 200);
    return () => { live = false; clearTimeout(t); };
  }, [word, nouns, verbs]);   // eslint-disable-line react-hooks/exhaustive-deps
  if (!word || !res) return null;
  const { verbs: vs, nouns: ns, roots } = res;
  const openRoot = (id: string) => (onRoot ? onRoot(id) : (location.hash = `verbs/${id}`));
  const openWord = (id: string) => (onWord ? onWord(id) : (location.hash = `words/${id}`));
  if (!vs.length && !ns.length) return (
    <div className="ff ff-none"><b>{S(word)}</b> — no verb or noun form found. <span className="ks-l-en">Forms are known for {roots.length || 356} verb roots (also causative and desiderative, with any of the 22 upasargas) and the nouns of शब्दकोशः. Check the spelling (for example ं or म्).</span></div>);
  return (
    <div className="ff">
      <p className="ff-title">{S("रूपविश्लेषणम्")} · What “{S(word)}” is</p>
      {vs.map((a, i) => {
        const pre = a.prefixes.map(p => UP[p] ?? p);
        const byRoot = new Map<number, typeof a.hits>();
        a.hits.forEach(h => byRoot.set(h.root, [...(byRoot.get(h.root) ?? []), h]));
        return [...byRoot.entries()].map(([r, hs]) => (
          <div key={`${i}-${r}`} className="ff-row">
            <p className="ff-split">{pre.length > 0 && <>{S(pre.join(" + "))} + </>}{a.base ? <b>{S(toDeva(a.base))}</b> : <>{S(roots[r][1])} → <b>{S(word)}</b></>}
              {a.declined && <span className="ks-l-en"> — {S(word)} is another case or gender of it</span>}{a.checked ? <span className="ff-ok" title="Confirmed by the root's vidyut-prakriya forms">✓</span>
                : <span className="ff-maybe" title="Two upasargas: the split is shown, but this combination is not in the tables">?</span>}</p>
            <p className="ff-root"><button className="sh-link" onClick={() => openRoot(roots[r][3])}>{S(roots[r][1])}</button> <span className="ks-l-en">{roots[r][2]}</span></p>
            <ul className="ff-cells">{hs.map((h, j) => <li key={j}>{SANADI[h.prayoga[0]] && h.prayoga.length === 2 &&
                <><b>{S(SANADI[h.prayoga[0]][0])}</b> <span className="ks-l-en">{SANADI[h.prayoga[0]][1]}</span> · </>}{h.prayoga.endsWith("k")
              ? <>{S("कृदन्तम्")} · {S(KRT[h.slot]?.[0] ?? h.slot)} <span className="ks-l-en">{KRT[h.slot]?.[1] ?? ""}</span></>
              : <>{S(LAKARA[h.slot]?.[0] ?? h.slot)} <span className="ks-l-en">{LAKARA[h.slot]?.[1]}</span> · {S(PURUSHA_SHORT[Math.floor(h.cell / 3)] ?? "")} {S(VACANA[h.cell % 3] ?? "")} · {S(PRAYOGA[h.prayoga.slice(-1) as "P"]?.[0] ?? h.prayoga)}</>}</li>)}</ul>
          </div>));
      })}
      {ns.map((n, i) => (
        <div key={`n${i}`} className="ff-row">
          <p className="ff-root"><button className="sh-link" onClick={() => openWord(n.w.id)}>{S(n.w.w)}</button> <span className="ks-l-en">{S(n.w.cat === "pronoun" ? "सर्वनाम" : "नाम")}</span></p>
          <ul className="ff-cells"><li>{S(VIBHAKTI[n.vib])} <span className="ks-l-en">{VIBHAKTI_EN[n.vib]}</span> · {S(VACANA[n.vac])} <span className="ks-l-en">{VACANA_EN[n.vac]}</span></li></ul>
        </div>))}
      {vs.length > 0 && <p className="ks-l-en ff-note">Verb forms: vidyut-prakriya forms of {roots.length} roots, with their causatives and desideratives, plain or with any of the 22 upasargas (✓ = confirmed by those forms).</p>}
    </div>
  );
};
