// ═══════════════════════════════════════════════════════════════
//  learn/Prakriya.tsx — two बोधः chapters from Dr. B. Rajeswara Rao's Gold data:
//    प्रकृतिः प्रत्ययश्च — root, stem, suffix; the eleven kinds of suffix; the suffix chain
//    प्रक्रिया — the levels of a sentence (listener ↓, speaker ↑) and derivations step by step
//  Content: data-source/15-prakriya/prakriya.py → app/src/data/prakriya.json
// ═══════════════════════════════════════════════════════════════
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { PRAKRIYA } from "../data";
import { useSa } from "../i18n/script";
import { speak } from "../speech";

const P = PRAKRIYA.prakriti as any, K = PRAKRIYA.prakriya as any;
const Card: React.FC<{ title: string; tone?: string; children: React.ReactNode }> = ({ title, tone, children }) =>
  <section className={`ln-card ${tone ?? ""}`}><h3>{title}</h3>{children}</section>;

/** a derivation you can step through: one step at a time, or all at once */
export const Stepper: React.FC<{ start?: number }> = ({ start = 0 }) => {
  const S = useSa();
  const D = PRAKRIYA.derivations;
  const [i, setI] = useState(start);
  const [n, setN] = useState(1);
  const d = D[i];
  return (
    <div className="pk-stepper">
      <div className="pk-pick">{D.map((x, k) => <button key={x.w} className={k === i ? "on" : ""} onClick={() => { setI(k); setN(1); }}>{S(x.w)}</button>)}</div>
      <p className="pk-goal">{S(d.w)} <small>· {d.en}</small></p>
      <ol className="pk-steps">
        {d.steps.slice(0, n).map(([f, why], k) => (
          <li key={k} className={k === n - 1 ? "pk-new" : ""}><span className="pk-form">{S(f)}</span><span className="pk-why">{S(why)}</span></li>))}
      </ol>
      <div className="ln-demo-bar">
        <button className="pk-btn" disabled={n >= d.steps.length} onClick={() => setN(n + 1)}>अग्रे · Next step ▸</button>
        <button className="pk-btn ghost" onClick={() => setN(d.steps.length)}>सर्वम् · Show all</button>
        <button className="pk-btn ghost" onClick={() => setN(1)}>पुनः · Again</button>
        <button className="pk-btn ghost" onClick={() => speak(d.w)}>🔊</button>
      </div>
    </div>
  );
};

export const PrakritiPratyaya: React.FC = () => {
  const S = useSa();
  const [m, setM] = useState(1);
  return (
    <div className="ln-body">
      <Card title="व्याकरणं किमर्थम्? · Why grammar at all">
        <p className="ln-center ln-verse">{S(P.intro_sa)}</p>
        <p>{P.intro_en}</p>
      </Card>
      <Card title="त्रयः · Three invented units" tone="ln-key">
        <p className="ln-deva">{S(P.three_sa)}</p>
        <p>{P.three_en}</p>
        <div className="ln-eq"><span className="ln-stem">{S("प्रकृतिः")}</span> + <span className="ln-suf">{S("प्रत्ययः")}</span> = <span className="ln-word">{S("पदम्")}</span>
          <small>base (root or stem) + suffix = a finished word</small></div>
      </Card>
      <Card title="धातुः · The root — seven kinds">
        <p className="ln-deva">{S(P.dhatu_def)}</p>
        <div className="ln-table-wrap"><table className="ln-table"><tbody>{P.dhatu_kinds.map(([sa, en, eg]: string[], k: number) =>
          <tr key={k}><th>{k + 1}. {S(sa)}</th><td>{en}</td><td className="ln-deva">{S(eg)}</td></tr>)}</tbody></table></div>
      </Card>
      <Card title="प्रातिपदिकम् · The stem — five kinds">
        <p className="ln-deva">{S(P.pratipadika_def)}</p>
        <div className="ln-table-wrap"><table className="ln-table"><tbody>{P.pratipadika_kinds.map(([sa, en, eg, more]: string[], k: number) =>
          <tr key={k}><th>{k + 1}. {S(sa)}</th><td>{en}</td><td className="ln-deva">{S(eg)}{more ? <><br /><small>{S(more)}</small></> : null}</td></tr>)}</tbody></table></div>
      </Card>
      <Card title="प्रत्ययः · The suffix">
        <p className="ln-deva">{S(P.pratyaya_def)}</p>
        <div className="pk-family">{P.trc_family.map((w: string) => <span key={w}>{S(w)}</span>)}<b>→ {S("तृच्")}</b></div>
        <p>{P.pratyaya_en}</p>
      </Card>
      <Card title="एकादश प्रत्ययप्रकाराः · Eleven kinds — what each suffix turns into what" tone="ln-key">
        <div className="pk-kinds">{P.kinds.map(([sa, en, ex, eg]: string[], k: number) => (
          <div key={k} className="pk-kind"><span className="ln-k-num">{k + 1}</span><b>{S(sa)}</b><small>{en}</small>
            <span className="pk-kind-ex">{S(ex)}</span><span className="ln-k-eg">{S(eg)}</span></div>))}</div>
        <p className="ln-note-cell">Pāṇini groups the same suffixes in six blocks: {P.panini_groups.map((g: string) => S(g)).join(" · ")}.</p>
      </Card>
      <Card title="प्रकृतिः · The base">
        <p className="ln-deva">{S(P.prakriti_def)}</p>
        <p>Since there are eleven kinds of suffix, there are eleven kinds of base as well.</p>
      </Card>
      <Card title="प्रत्ययमाला · A chain of suffixes" tone="ln-key">
        <p className="pk-goal">{S(P.mala.title)}</p>
        <ol className="pk-steps">{P.mala.steps.slice(0, m).map(([f, add, en]: string[], k: number) => (
          <li key={k} className={k === m - 1 ? "pk-new" : ""}><span className="pk-form">{S(f)}</span><span className="pk-why">{S(add)} — {en}</span></li>))}</ol>
        <div className="ln-demo-bar">
          <button className="pk-btn" disabled={m >= P.mala.steps.length} onClick={() => setM(m + 1)}>+ प्रत्ययः · Add the next suffix ▸</button>
          <button className="pk-btn ghost" onClick={() => setM(1)}>पुनः · Again</button>
        </div>
        <p className="ln-note-cell">Other chains:</p>
        <ul className="pk-patterns">{P.mala.patterns.map((p: string) => <li key={p}>{S(p)}</li>)}</ul>
      </Card>
      <Card title="अपदं न प्रयुञ्जीत · Only finished words are spoken">
        <p className="ln-center ln-verse">{S(P.apada_sa)}</p>
        <p>{P.apada_en}</p>
        <div className="ln-two">
          <div><b>{S("सुप्")}</b> — 21 endings<div className="ln-table-wrap"><table className="ln-table"><tbody>{P.sup.map((r: string[]) =>
            <tr key={r[3]}><th>{S(r[3])}</th>{r.slice(0, 3).map((x, j) => <td key={j} className="ln-deva">{S(x)}</td>)}</tr>)}</tbody></table></div></div>
          <div><b>{S("तिङ्")}</b> — 18 endings<div className="ln-table-wrap"><table className="ln-table"><tbody>{P.tin.map((r: string[], k: number) =>
            <tr key={k}><th>{k < 3 ? S("परस्मैपदम्") : S("आत्मनेपदम्")}</th>{r.map((x, j) => <td key={j} className="ln-deva">{S(x)}</td>)}</tr>)}</tbody></table></div></div>
        </div>
      </Card>
      <Card title="पदनिष्पत्तिः · Watch a word being made">
        <p>Choose a word and add one operation at a time. Each step names the sūtra that makes it.</p>
        <Stepper />
        <p className="ln-note-cell">{S(P.closing_sa)}</p>
      </Card>
    </div>
  );
};

export const Prakriya: React.FC = () => {
  const S = useSa();
  const [dir, setDir] = useState<"down" | "up">("down");
  const [lv, setLv] = useState(1);
  const levels = (K.levels as { n: string; en: string; parts: [string, string][] }[]);
  const order = dir === "down" ? levels : [...levels].reverse();
  return (
    <div className="ln-body">
      <Card title="प्रक्रिया किम्? · What a derivation is">
        <p className="ln-deva">{S(K.intro_sa)}</p>
        <p>{K.intro_en}</p>
        <p className="ln-deva">{S(K.nirvacana_sa)}</p>
      </Card>
      <Card title="स्तराः · The levels of a sentence" tone="ln-key">
        <p className="pk-goal">{S(K.sentence)} <small>· {K.meaning}</small></p>
        <div className="pk-dir">
          <button className={dir === "down" ? "on" : ""} onClick={() => { setDir("down"); setLv(1); }}>👂 {S("श्रोतृरीत्या")} · as the listener ↓</button>
          <button className={dir === "up" ? "on" : ""} onClick={() => { setDir("up"); setLv(1); }}>🗣️ {S("वक्तृरीत्या")} · as the speaker ↑</button>
        </div>
        <div className="pk-levels">{order.slice(0, lv).map((L, k) => (
          <div key={L.n} className={`pk-level ${k === lv - 1 ? "pk-new" : ""}`}>
            <div className="pk-level-h"><b>{S(L.n)}</b><small>{L.en}</small></div>
            <div className="pk-parts">{L.parts.map(([a, b], j) => <span key={j} className="pk-part"><span className="ln-stem">{S(a)}</span>{b && <span className="ln-suf">{S(b)}</span>}</span>)}</div>
          </div>))}</div>
        <div className="ln-demo-bar">
          <button className="pk-btn" disabled={lv >= order.length} onClick={() => setLv(lv + 1)}>{dir === "down" ? "↓ अधः · One level down" : "↑ उपरि · One level up"}</button>
          <button className="pk-btn ghost" onClick={() => setLv(order.length)}>सर्वम् · All levels</button>
        </div>
        <p>{K.speaker_en}</p>
        <p className="ln-note-cell">{K.levels_note}</p>
        <div className="ln-table-wrap"><table className="ln-table"><tbody>{K.vakya_pada.map(([sa, en]: string[]) => <tr key={sa}><th>{S(sa)}</th><td>{en}</td></tr>)}</tbody></table></div>
      </Card>
      <Card title="अदृश्यं कल्पितम् · When the parts cannot be heard at all">
        <p className="pk-goal">{S(K.hidden.sentence)} <small>· {K.hidden.en}</small></p>
        <div className="ln-table-wrap"><table className="ln-table"><tbody>
          <tr><th>{S("प्रथमः स्तरः")}</th><td className="ln-deva">{S(K.hidden.l1)}</td></tr>
          <tr><th>{S("द्वितीयः स्तरः")}</th><td className="ln-deva">{S(K.hidden.l2)}</td></tr></tbody></table></div>
        <p>{K.hidden.note}</p>
        <p className="ln-center ln-verse">{S(K.advaita)}</p>
      </Card>
      <Card title="प्रक्रियाभेदाः · Which level each kind of derivation explains">
        <div className="ln-table-wrap"><table className="ln-table"><tbody>{K.kinds.map(([sa, where, en]: string[]) =>
          <tr key={sa}><th>{S(sa)}</th><td>{where}</td><td>{en}</td></tr>)}</tbody></table></div>
        <div className="ln-two">
          <div><b>{S("सुबन्तप्रकाराः")}</b><ul className="pk-patterns">{K.subanta_kinds.map((x: string) => <li key={x}>{S(x)}</li>)}</ul></div>
          <div><b>{S("तिङन्तप्रकाराः")}</b><ul className="pk-patterns">{K.tinanta_kinds.map((x: string) => <li key={x}>{S(x)}</li>)}</ul></div>
        </div>
        <p className="ln-deva">{S(K.primacy_sa)}</p>
      </Card>
      <Card title="धातुः किम्? · What stays the same is the root">
        <div className="pk-family">{K.gam_family.map((w: string) => <span key={w}>{S(w)}</span>)}<b>→ {S("गम्")}</b></div>
        <p>{K.gam_en}</p>
        <p>{K.ktavatu_en}</p>
      </Card>
      <Card title="प्रत्ययाः कुतः? · Where the suffixes come from">
        <div className="ln-two">
          <div><b>{S("धातुभ्यः")}</b> — {K.from_dhatu.map((x: string) => S(x)).join(" · ")}<br /><small>{S(K.from_dhatu_where)}</small>
            <div className="ln-table-wrap"><table className="ln-table"><tbody>{K.krt_by_meaning.map(([sa, en, eg]: string[]) =>
              <tr key={sa}><th>{S(sa)}</th><td>{en}</td><td className="ln-deva">{S(eg)}</td></tr>)}</tbody></table></div></div>
          <div><b>{S("प्रातिपदिकेभ्यः")}</b> — {K.from_pratipadika.map((x: string) => S(x)).join(" · ")}<br /><small>{S(K.from_pratipadika_where)}</small>
            <p className="ln-deva">{S(K.agama_adesha)}</p></div>
        </div>
      </Card>
      <Card title="पदनिष्पत्तिः · Every word, step by step">
        <Stepper start={9} />
      </Card>
      <Card title="विमर्शः · Changes made to the Gold text" tone="ln-check rv-only">
        <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>where</th><th>Gold text</th><th>now</th></tr></thead>
          <tbody>{PRAKRIYA.fixes.map(([w, a, b], k) => <tr key={k}><td>{w}</td><td className="ln-deva">{a}</td><td className="ln-deva">{b}</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
};
