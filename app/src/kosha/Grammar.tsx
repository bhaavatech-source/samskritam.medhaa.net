// ═══════════════════════════════════════════════════════════════
//  kosha/Grammar.tsx — व्याकरणकोशः: सन्धिः, समासः, कृत्प्रत्ययाः, उपसर्गाः
//  Data: app/src/data/grammar.json (tools/build_grammar.py, from the Gold
//  files with the 2026-11-08 corrections). Explanations are in English with
//  the Sanskrit terms; every example has a ⚑.
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { GRAMMAR, KRT, VERBS, LANGS, verbMeaning, type SandhiRule, type Samasa, type KrtPratyaya } from "../data";
import { FlagButton } from "../FlagUI";
import { useLang } from "../settings";
import { useSa } from "../i18n/script";
import { krtGloss } from "../i18n/forms";
import { ListDetail, Tabs, Speak, KsTop, RomS } from "./Kosha";
import "./kosha.css";

const G = GRAMMAR;

// ── सन्धिः ──
const SandhiTab: React.FC = () => {
  const S = useSa();
  const [grp, setGrp] = useState<string>("all");
  const rules = G.sandhi.rules.filter(r => grp === "all" || r.group === grp);
  return (
    <>
      <details className="ks-method" open>
        <summary>सन्धिः किम्? · What sandhi is</summary>
        <p className="gr-sloka">{S(G.sandhi.definition)}</p>
        <p>Sandhi is what happens where two sounds meet — the last sound of one piece and the first of the next. It is one of four things:</p>
        <table className="ks-karaka"><tbody>{G.sandhi.kinds.map(k => <tr key={k.name}><td className="ks-l-sa">{S(k.name)}</td><td>{k.en}</td><td className="ks-l-sa">{S(k.ex)}</td></tr>)}</tbody></table>
        <p className="ks-note-plain">{S(G.sandhi.not_sandhi)}</p>
        <h4>Two places where sandhi happens</h4>
        <table className="ks-karaka"><tbody>{G.sandhi.layers.map(k => <tr key={k.name}><td className="ks-l-sa">{S(k.name)}</td><td>{k.en}</td><td className="ks-l-sa">{S(k.ex)}</td></tr>)}</tbody></table>
        <h4>Three questions that unlock every sandhi</h4>
        <ol>{G.sandhi.questions.map(q => <li key={q.q}><b>{S(q.q)}</b> — {q.en}</li>)}</ol>
        <h4>Step by step: why the rules do not undo each other</h4>
        {G.sandhi.stages.map(st => (
          <div key={st.title} className="gr-stage"><b>{S(st.title)}</b>
            <ol>{st.steps.map(([f, why], i) => <li key={i}><span className="ks-l-sa">{S(f)}</span> — {S(why)}</li>)}</ol>
            <p className="ks-note-plain">{S(st.note)}</p></div>))}
      </details>
      <div className="ks-chips gr-filter">
        {[["all", "सर्वे · all"], ...Object.entries(G.sandhi.groups).map(([k, [sa, en]]) => [k, `${sa} · ${en}`])].map(([k, l]) =>
          <button key={k} className={`ks-tag ${grp === k ? "on" : ""}`} onClick={() => setGrp(k)}>{S(l)}</button>)}
      </div>
      <ListDetail<SandhiRule> items={rules} idOf={r => r.id} kind="grammar" placeholder="Search a rule or an example…"
        search={r => [r.name, r.en, r.sutra, ...r.ex.map(e => `${e.a} ${e.b} ${e.r}`)].join(" ")}
        label={r => <><span className="ks-l-sa">{S(r.name)}</span><span className="ks-l-en">{r.en}</span></>}
        detail={r => (
          <div className="ks-card">
            <div className="ks-head"><h3>{S(r.name)}</h3><span className="ks-sub">{S(G.sandhi.groups[r.group][0])} · {r.en}</span></div>
            <p className="gr-sutra">{S(r.sutra)}</p>
            <p>{S(r.what)}</p>
            <h4>उदाहरणानि · Examples ({r.ex.length})</h4>
            <table className="ks-karaka gr-ex"><tbody>{r.ex.map((e, i) => (
              <tr key={i}><td className="ks-l-sa">{S(e.a)} + {S(e.b)}</td><td>→</td><td className="ks-l-sa gr-res">{S(e.r)} <Speak t={e.r.split(" / ")[0]} /></td>
                <td className="ks-l-en">{e.scope === "int" ? "अन्तरङ्गः" : e.scope === "exc" ? "अपवादः" : "बहिरङ्गः"}{e.note ? ` · ${S(e.note)}` : ""}</td>
                <td><FlagButton t={{ kind: "grammar", id: `sandhi:${r.id}`, field: "example", value: `${e.a} + ${e.b} = ${e.r}`, where: `${r.name} — example` }} /></td></tr>))}</tbody></table>
          </div>)} />
    </>
  );
};

// ── समासः ──
const MAJ = ["अव्ययीभावः", "तत्पुरुषः", "द्वन्द्वः", "बहुव्रीहिः", "केवलसमासः"];
const SamasaTab: React.FC = () => {
  const S = useSa();
  const [m, setM] = useState("all");
  const d = G.samasa;
  const items = d.ex.filter(e => m === "all" || e.m === m);
  return (
    <>
      <details className="ks-method">
        <summary>समासः किम्? · What a compound is, and its kinds</summary>
        <p><b>{S(d.definition.term)}</b> — {S(d.definition.etymology)} {S(d.definition.meaning)}</p>
        <p>{S(d.definition.reason_for_compounding)}</p>
        <h4>{S("विग्रहवाक्यम्")} · the phrase a compound stands for</h4>
        <p>{S(d.vigraha.definition)}</p>
        {d.vigraha.types.map(t => <p key={t.type}><b>{S(t.type)}</b> — {S(t.details)}</p>)}
        <h4>{S(d.dominance.title)}</h4>
        <p>{S(d.dominance.details)}</p>
        <table className="ks-karaka"><tbody>{d.dominance.types.map(t => (
          <tr key={t.name}><td className="ks-l-sa"><b>{S(t.name)}</b></td><td>{S(t.meaning_dominance)}{t.example_laukika ? <><br /><span className="ks-l-sa">{S(t.example_laukika)}</span></> : null}</td>
            <td className="ks-l-en">{(t.sub_types ?? []).map(x => typeof x === "string" ? S(x) : S(x.name)).join(" · ")}</td></tr>))}</tbody></table>
        <h4>{S(d.occurrence.title)}</h4>
        {d.occurrence.types.map(t => <p key={t.name}><b>{S(t.name)}</b> — {S(t.definition)}</p>)}
        <h4>{S(d.count.title)}</h4>
        {d.count.types.map(t => <p key={t.name}><b>{S(t.name)}</b> — {S(t.definition)} {t.note ? S(t.note) : ""}</p>)}
        <h4>{S(d.pos.title)}</h4>
        <p className="gr-sloka">{S(d.pos.shloka)}</p>
        <table className="ks-karaka"><tbody>{d.pos.types.map(t => <tr key={t.combination}><td>{S(t.combination)}</td><td className="ks-l-sa">{S(t.example)}</td></tr>)}</tbody></table>
        {Object.values(d.notes).map((n, i) => <p key={i} className="ks-note-plain">{S(n)}</p>)}
      </details>
      <div className="ks-chips gr-filter">
        {["all", ...MAJ].map(k => <button key={k} className={`ks-tag ${m === k ? "on" : ""}`} onClick={() => setM(k)}>
          {k === "all" ? `सर्वे · all (${d.ex.length})` : `${S(k)} (${d.ex.filter(e => e.m === k).length})`}</button>)}
      </div>
      <ListDetail<Samasa> items={items} idOf={e => e.w + e.l} kind="grammar" placeholder="Search a compound or its vigraha…"
        search={e => [e.w, e.l, e.a, e.t].join(" ")}
        label={e => <><span className="ks-l-sa">{S(e.w)}</span><span className="ks-l-en">{S(e.t)}</span></>}
        detail={e => (
          <div className="ks-card">
            <div className="ks-head"><h3>{S(e.w)}</h3><Speak t={e.w} /><span className="ks-sub">{S(e.m)}</span></div>
            <table className="ks-karaka"><tbody>
              <tr><td>{S("लौकिकविग्रहः")}<br /><span className="ks-l-en">the phrase</span></td><td className="ks-l-sa gr-res">{S(e.l)} <Speak t={e.l} /></td></tr>
              {e.a && <tr><td>{S("अलौकिकविग्रहः")}<br /><span className="ks-l-en">stems + endings</span></td><td className="ks-l-sa">{S(e.a)}</td></tr>}
              <tr><td>{S("समासनाम")}<br /><span className="ks-l-en">kind</span></td><td className="ks-l-sa">{S(e.t)}</td></tr>
            </tbody></table>
            {e.n && <p className="ks-note-plain">{S(e.n)}</p>}
            <FlagButton t={{ kind: "grammar", id: `samasa:${e.w}`, field: "entry", value: `${e.w} | ${e.l} | ${e.a} | ${e.t}`, where: `${e.w} — samāsa` }} label="Report" />
          </div>)} />
    </>
  );
};

// ── कृत्प्रत्ययाः ──
const PratyayaTab: React.FC = () => {
  const S = useSa(); const lang = useLang();
  const P = G.pratyaya;
  return (
    <>
      <details className="ks-method">
        <summary>कृत्प्रत्ययाः · Suffixes that make words straight from a root</summary>
        <ul>{P.intro.map((x, i) => <li key={i}>{S(x)}</li>)}</ul>
      </details>
      <ListDetail<KrtPratyaya> items={P.list} idOf={x => x.p} kind="krt" placeholder="Search a suffix: क्त्वा, तुमुन्…"
        search={x => [x.p, x.rem, x.sutra, x.artha].join(" ")}
        label={x => <><span className="ks-l-sa">{S(x.p)}</span><span className="ks-l-en">→ {S(x.rem)} · {P.kinds[x.kind][1]}</span></>}
        detail={x => {
          const rows = KRT.filter(r => r.f[x.p]?.[0]);
          return (
            <div className="ks-card">
              <div className="ks-head"><h3>{S(x.p)}</h3><span className="ks-sub">{S(P.kinds[x.kind][0])} · {P.kinds[x.kind][1]}</span></div>
              <table className="ks-karaka"><tbody>
                <tr><td>{S("इत्")} <span className="ks-l-en">letters that drop</span></td><td className="ks-l-sa">{S(x.it)}</td></tr>
                <tr><td>{S("शिष्टः")} <span className="ks-l-en">what is added</span></td><td className="ks-l-sa">{S(x.rem)}</td></tr>
                <tr><td>{S("सूत्रम्")}</td><td className="ks-l-sa">{S(x.sutra)}</td></tr>
                <tr><td>{S("अर्थः")} <span className="ks-l-en">meaning</span></td><td>{S(x.artha)}</td></tr>
              </tbody></table>
              {rows.length > 0 && <><h4>{rows.length} {S("धातवः")} · roots with this suffix ({LANGS[lang]})</h4>
                <div className="ks-table-wrap"><table className="ks-table ks-krt"><tbody>{rows.map(r => {
                  const v = VERBS.find(y => y.w === r.w); const gl = krtGloss(x.p, lang, r.f[x.p][1], v ? verbMeaning(v, lang) : r.en, r.w);
                  return <tr key={r.id}><th>{S(r.w)}</th><td className="ks-form">{S(r.f[x.p][0])}</td><td dir="auto">{gl}<RomS t={gl} l={lang} /></td></tr>;
                })}</tbody></table></div></>}
            </div>);
        }} />
    </>
  );
};

// ── उपसर्गाः ──
const UpasargaTab: React.FC = () => {
  const S = useSa();
  const U = G.upasarga;
  return (
    <div className="ks-card">
      <p className="gr-sloka">{S(U.sloka)}</p>
      <p>{U.sloka_en}</p>
      <table className="ks-karaka"><tbody>{U.three.map(([sa, en, ex]) => <tr key={sa}><td className="ks-l-sa"><b>{S(sa)}</b></td><td>{en}</td><td className="ks-l-sa">{S(ex)}</td></tr>)}</tbody></table>
      <h4>{S("हृ")} + 7 {S("उपसर्गाः")} · one root, seven meanings</h4>
      <div className="ks-chips">{U.hr.map(([u, w, en]) => <span key={w} className="ks-tag">{S(u)} → <b>{S(w)}</b> · {en}</span>)}</div>
      <p className="ks-note-plain">{S(U.cls)} {S(U.pada)}</p>
      <p className="ks-note-plain">{S(U.nature)}</p>
      <h4>२० {S("उपसर्गाः")}</h4>
      <table className="ks-karaka"><tbody>{U.list.map(u => (
        <tr key={u.u}><td className="ks-l-sa"><b>{S(u.u)}</b></td><td>{u.en}</td>
          <td>{u.ex.map(([w, m]) => <span key={w} className="gr-upex"><span className="ks-l-sa">{S(w)}</span> <span className="ks-l-en">{m}</span></span>)}</td>
          <td><FlagButton t={{ kind: "grammar", id: `upasarga:${u.u}`, field: "entry", value: `${u.u}: ${u.en}`, where: `${u.u} — upasarga` }} /></td></tr>))}</tbody></table>
    </div>
  );
};

export const GrammarBook: React.FC = () => {
  const [tab, setTab] = useState("s");
  const r = G.sandhi.rules;
  return (
    <div className="ks">
      <KsTop title="व्याकरणकोशः" en="Sandhi, compounds & suffixes" sub={`${r.length} sandhi rules with ${r.reduce((a, x) => a + x.ex.length, 0)} examples, ${G.samasa.ex.length} compounds, ${G.pratyaya.list.length} kṛt suffixes and the 20 upasargas.`} />
      <Tabs tabs={[["s", "सन्धिः · Sandhi"], ["m", "समासः · Compounds"], ["p", "कृत्प्रत्ययाः · Suffixes"], ["u", "उपसर्गाः · Prefixes"]]} on={tab} set={setTab} />
      {tab === "s" ? <SandhiTab /> : tab === "m" ? <SamasaTab /> : tab === "p" ? <PratyayaTab /> : <UpasargaTab />}
    </div>
  );
};
