// ═══════════════════════════════════════════════════════════════
//  learn/Samanvaya.tsx — विभक्तिसमन्वयः (agreement of case and verb), shown
//  inside the existing chapters, not as a chapter of its own:
//    धातुरूपाणि → AgreementCard (person/number in कर्तरि, कर्मणि, भावे) and AdhyaharaCard
//    शब्दरूपाणि → PrathamaCard (when a noun is in प्रथमा; one प्रथमा per clause)
//  From the author's gold data (data-source/22-vibhakti-samanvaya, corrected 2026-11-15).
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { SAMANVAYA as D, VACANA } from "../data";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import "./learn.css";

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="ln-card"><h3>{title}</h3>{children}</section>
);
const Say: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;

type Voice = "kartari" | "karmani" | "bhave";
const PU = ["प्रथमपुरुषः", "मध्यमपुरुषः", "उत्तमपुरुषः"];
// rows प्रथम, मध्यम, उत्तम; the data lists मध्यम, उत्तम, प्रथम (the order of 1.4.105–108)
const fromData = (v: "kartari" | "karmani") => [2, 0, 1].map(i => D.persons[i][v]);
// भावे: the doer is in तृतीया and the verb never changes (3.4.69; प्रथमपुरुषैकवचनम्)
const BHAVE = [["तेन भूयते ।", "ताभ्यां भूयते ।", "तैः भूयते ।"], ["त्वया भूयते ।", "युवाभ्यां भूयते ।", "युष्माभिः भूयते ।"], ["मया भूयते ।", "आवाभ्यां भूयते ।", "अस्माभिः भूयते ।"]];
const RULE: Record<Voice, string> = {
  kartari: "The ending names the doer: the doer is in प्रथमा, the object in द्वितीया, and the verb takes the doer's person and number.",
  karmani: "The ending names the object: the object is in प्रथमा, the doer in तृतीया, and the verb takes the object's person and number.",
  bhave: "The ending names only the action (verbs without an object): the doer is in तृतीया and the verb is always प्रथमपुरुष एकवचन, whoever the doer is.",
};
const NAME: Record<Voice, string> = { kartari: "कर्तरि", karmani: "कर्मणि", bhave: "भावे" };

/** धातुरूपाणि: which word the verb ending names, in the three voices */
export const AgreementCard: React.FC = () => {
  const S = useSa();
  const [v, setV] = useState<Voice>("kartari");
  const rows = v === "bhave" ? BHAVE : fromData(v);
  const p = D.prayoga[v === "kartari" ? 0 : v === "karmani" ? 1 : 2];
  return (
    <Card title="प्रयोगः पुरुषः वचनं च · Which word the ending names">
      <p className="ln-sa">{S(D.definition)}</p>
      <p>{D.definition_en}</p>
      <div className="ks-chips" role="group" aria-label="Voice">
        {(["kartari", "karmani", "bhave"] as Voice[]).map(k =>
          <button key={k} className={v === k ? "on" : ""} onClick={() => setV(k)}>{S(NAME[k])} <small>{k === "kartari" ? "active" : k === "karmani" ? "passive" : "impersonal"}</small></button>)}
      </div>
      <p>{RULE[v]}</p>
      <div className="ln-table-wrap"><table className="ln-table sv-table">
        <thead><tr><th></th>{VACANA.map(x => <th key={x}>{S(x)}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={PU[i]}><th>{S(PU[i])}{v !== "bhave" && <small className="ln-sutra">{S(D.persons[[2, 0, 1][i]].rule)}</small>}</th>
            {r.map(t => <td key={t} className="ln-deva">{S(t)} <Say t={t} /></td>)}</tr>))}</tbody>
      </table></div>
      <div className="sv-voice">
        <p className="ln-sa"><b>{S(p.name)}</b> — {S(p.rules)}</p>
        <p className="sv-ok"><span aria-label="correct">✓</span> <b className="ln-deva">{S(p.ok)}</b> <Say t={p.ok} /></p>
        <p className="ln-note ln-sa">{S(p.ok_why)}</p>
        {p.bad.map(b => <React.Fragment key={b.text}>
          <p className="sv-bad"><span aria-label="wrong">✗</span> <b className="ln-deva">{S(b.text)}</b></p>
          <p className="ln-note ln-sa">{S(b.why)}</p>
        </React.Fragment>)}
      </div>
      <p className="ln-note">{S(D.vacana)}</p>
    </Card>
  );
};

/** शब्दरूपाणि: when a noun is in प्रथमा, and only one प्रथमा per clause */
export const PrathamaCard: React.FC = () => {
  const S = useSa();
  return (
    <Card title="प्रथमा कदा? · When a noun is in the first case">
      <p className="ln-sa">{S(D.principle)}</p>
      <p>{D.principle_en} So the doer is in प्रथमा in कर्तरि (रामः वनं जगाम) but in तृतीया in कर्मणि and भावे (रामेण वनं जग्मे, रामेण भूयते).</p>
      <h4>एकस्मिन् वाक्ये एका प्रथमा · One first case per clause</h4>
      <p className="ln-sa">{S(D.single.canonical_mandate)}</p>
      <p>{D.single.english_translation}</p>
      <ul>{D.single.exceptions.map(x => <li key={x.kind}><b className="ln-sa">{S(x.kind)}</b>: <span className="ln-deva">{S(x.example)}</span></li>)}</ul>
      <p className="ln-deva">{S(D.single.with_ca_va)}</p>
    </Card>
  );
};

/** धातुरूपाणि: the verb that is understood */
export const AdhyaharaCard: React.FC = () => {
  const S = useSa();
  return (
    <Card title="अध्याहारः · The verb that is not said">
      {D.adhyahara.map(a => <div key={a.en}>
        {a.maxim && <p className="ln-sa"><b>{S(a.maxim)}</b></p>}
        <p>{a.en}</p>
      </div>)}
      <p className="ln-note ln-sa">{S(D.circ)}</p>
      <p className="ln-note">{D.circ_en}</p>
    </Card>
  );
};
