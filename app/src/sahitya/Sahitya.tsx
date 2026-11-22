// ═══════════════════════════════════════════════════════════════
//  sahitya/Sahitya.tsx — साहित्यम् · Literature
//  Tabs: पद्यविश्लेषणम्, रघुवंशम्, पदच्छेदः, अलङ्काराः, छन्दांसि.
//  (पदच्छेदः and पद्यविश्लेषणम् used to sit in वाक्यकोशः.)
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import {
  PADACCHEDA, PADYA, LANGS, padyaMeaning, padyaRoman, loadAlankara, loadChandas, pick4,
  type Alankara, type Chandas, type Vritta, type Padya, type ChandasClass,
} from "../data";
import { FlagButton } from "../FlagUI";
import { useLang } from "../settings";
import { useSa } from "../i18n/script";
import { ListDetail, Tabs, Speak, KsTop, Rom } from "../kosha/Kosha";
import { PadacchedaIntro, PadyaIntro } from "../kosha/Intro";
import { syllables, ganas, matras, padas, identify, type Match, type Metre } from "./scan";
import "../kosha/kosha.css";
import "./sahitya.css";

const TABS: [string, string][] = [
  ["v", "पद्यविश्लेषणम् · Verse analysis"], ["r", "रघुवंशम् · Raghuvaṃśa"], ["p", "पदच्छेदः · Ślokas"],
  ["a", "अलङ्काराः · Figures of speech"], ["c", "छन्दांसि · Metres"],
];
const tabFromHash = () => { const t = location.hash.slice(1).split("/")[1]; return TABS.some(([k]) => k === t) ? t : "v"; };

/** load chandas once; every tab that needs metres shares it */
function useChandas() {
  const [c, setC] = useState<Chandas | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { loadChandas().then(setC, e => setErr(String(e.message ?? e))); }, []);
  return { c, err };
}

/** one line of verse, syllable by syllable, guru / laghu marked underneath */
const ScanLine: React.FC<{ line: string }> = ({ line }) => {
  const S = useSa();
  const syl = syllables(line);
  const p = syl.map(x => (x.g ? "ऽ" : "।")).join("");
  return (
    <div className="sh-scan">
      <div className="sh-syls">{syl.map((x, i) => (
        <span key={i} className={x.g ? "g" : "l"}><b>{S(x.t.trim())}</b><i>{S(x.g ? "ऽ" : "।")}</i></span>))}</div>
      <div className="sh-ganas">{ganas(p).map((g, i) => <span key={i} title={g.g}>{S(g.name)}</span>)}
        <em>{S(`${p.length} अक्षराणि · ${matras(p)} मात्राः`)}</em></div>
    </div>
  );
};

/** "छन्दः: अनुष्टुप् (पथ्यावक्त्रम्)" for any verse */
/** every metre the page knows: the 30 described in detail, then Vṛttaratnākara's sama and ardhasama metres */
type Known = { id: string; name: string; metre: Metre };
const knownCache = new WeakMap<Chandas, Known[]>();
function knownMetres(c: Chandas): Known[] {
  let k = knownCache.get(c);
  if (!k) {
    k = [
      ...c.vrittas.map(v => ({ id: v.id, name: v.name.sa, metre: v.metre })),
      ...c.classes.flatMap(cl => cl.vrittas.filter(e => e.pattern && !e.detail).map(e => ({ id: `VR3-${e.vr}`, name: e.name, metre: { kind: "sama" as const, pat: e.pattern } }))),
      ...c.ardhasama.map((a, i) => ({ id: `VR4-${i}`, name: a.name, metre: { kind: "ardhasama" as const, pats: a.pats } })),
    ];
    knownCache.set(c, k);
  }
  return k;
}

/** "छन्दः: अनुष्टुप् (पथ्यावक्त्रम्)" for any verse */
const MetreTag: React.FC<{ verse: string; c: Chandas | null; onOpen?: (id: string) => void }> = ({ verse, c, onOpen }) => {
  const S = useSa();
  if (!c) return null;
  const all = knownMetres(c);
  const m: Match | null = identify(verse, all);
  const v = m && all.find(x => x.id === m.id);
  return (
    <p className="sh-metre">छन्दः · Metre: {v
      ? <>{onOpen ? <button className="sh-link" onClick={() => onOpen(v.id)}>{S(v.name)}</button> : <b>{S(v.name)}</b>}
          {m?.note && <span className="ks-l-en"> ({S(m.note)})</span>}</>
      : <span className="ks-l-en">not one of the {all.length} metres known here</span>}</p>
  );
};

// ── पद्यविश्लेषणम् ─────────────────────────────────────────────
export const PadyaDetail: React.FC<{ v: Padya; c: Chandas | null; openMetre: (id: string) => void }> = ({ v, c, openMetre }) => {
  const S = useSa(); const lang = useLang();
  return (
    <div className="ks-card">
      <div className="ks-head"><h3 className="ks-sent ks-verse">{S(v.verse.replace(/([।|]+)\s*/, "$1\n"))}</h3><Speak t={v.verse} /></div>
      <p className="ks-sub">{S(v.source)}</p>
      <MetreTag verse={v.verse} c={c} onOpen={openMetre} />
      <h4>१ · पदच्छेदः · The words</h4>
      <div className="ks-padas">{v.padaccheda.map((w, k) => <span key={k}>{S(w)}</span>)}</div>
      {v.anvaya && <><h4>२ · अन्वयः · Prose order</h4>
        <p className="ks-anvaya">{S(v.anvaya)} <Speak t={v.anvaya} />
          <FlagButton t={{ kind: "sentence", id: v.id, field: "anvaya", value: v.anvaya, where: `${v.id} — anvaya` }} /></p></>}
      <h4>३ · अर्थः · Meaning</h4>
      <p className="ks-main-meaning" dir="auto">{padyaMeaning(v, lang)} <FlagButton t={{ kind: "sentence", id: v.id, field: "meaning:" + lang, value: padyaMeaning(v, lang), where: `${v.id} — verse meaning (${LANGS[lang]})` }} /></p>
      <Rom t={padyaRoman(v, lang)} />
      {lang !== "en" && <p className="ks-note-plain">English: {v.m.en}</p>}
      {v.artha_sa && <p className="ks-note-plain">{S(v.artha_sa)}</p>}
      {v.karaka.length > 0 && <><h4>४ · कारकाणि · Who does what</h4>
        <table className="ks-karaka"><tbody>{v.karaka.map((k, i) => (
          <tr key={i}><td className="ks-l-sa">{S(k.word)}</td><td>{S(k.role)}{k.of ? <span className="ks-l-en"> → {S(k.of)}</span> : null}</td>
            <td className="ks-l-en">{k.note ? S(k.note) : ""}</td>
            <td><FlagButton t={{ kind: "sentence", id: v.id, field: "karaka", value: `${k.word} = ${k.role}`, where: `${v.id} — kāraka` }} /></td></tr>))}</tbody></table></>}
      {v.words.length > 0 && <><h4>५ · पदपरिचयः · Each word's form</h4>
        <table className="ks-karaka"><tbody>{v.words.map((w, i) => <tr key={i}><td className="ks-l-sa">{S(w.word)}</td><td>{S(w.form)}</td></tr>)}</tbody></table></>}
      <h4>६ · छन्दः · Scansion</h4>
      {padas(v.verse).map((l, i) => <ScanLine key={i} line={l} />)}
      {v.notes.filter(Boolean).map((n, i) => <p key={i} className="ks-note-plain">{S(n)}</p>)}
      <p className="ks-id">{v.id}</p>
    </div>
  );
};

const PadyaTab: React.FC<{ c: Chandas | null; initial: string | null; openMetre: (id: string) => void }> = ({ c, initial, openMetre }) => {
  const S = useSa(); const lang = useLang();
  return (<>
    <PadyaIntro />
    <details className="ks-method"><summary>पद्यविश्लेषणस्य क्रमः · How to analyse a verse ({PADYA.method.length} steps)</summary>
      <ol>{PADYA.method.map(m => <li key={m.n}><b>{S(m.title.replace(/\s*\(.*\)$/, ""))}</b> <span className="ks-l-en">{m.title.match(/\((.*)\)/)?.[1]}</span><p>{S(m.details)}</p></li>)}</ol></details>
    <ListDetail key={initial ?? ""} items={PADYA.verses} idOf={v => v.id} kind="sentence" placeholder="Search a verse or a word…" initial={initial}
      search={v => [v.verse, v.anvaya, v.source, padyaMeaning(v, lang), ...v.padaccheda].join(" ")}
      label={v => <><span className="ks-l-sa ks-l-sent">{S(v.verse.split(/[।|]/)[0])}</span><span className="ks-l-en">{S(v.source)}</span></>}
      detail={v => <PadyaDetail v={v} c={c} openMetre={openMetre} />} />
  </>);
};

// ── रघुवंशम्: the first canto, read in order ────────────────────
const RaghuTab: React.FC<{ c: Chandas | null; analyse: (id: string) => void; openMetre: (id: string) => void }> = ({ c, analyse, openMetre }) => {
  const S = useSa(); const lang = useLang();
  const verses = useMemo(() => PADYA.verses.filter(v => v.id.startsWith("RV-")), []);
  return (<>
    <details className="ks-intro" open><summary>रघुवंशम् · Kālidāsa's Raghuvaṃśa, canto 1 (verses 1–70)</summary>
      <p>{S("कालिदासस्य रघुवंशं महाकाव्यम्")} — Kālidāsa's epic of the kings of Raghu's line. Verses 1–70 of the first canto are read here in order,
        in order, with its meaning and metre. Each verse opens in full in पद्यविश्लेषणम्: its words, prose order, kārakas and the form of every word.</p></details>
    <ol className="sh-reader">{verses.map(v => (
      <li key={v.id}>
        <p className="sh-r-verse">{S(v.verse.replace(/([।|]+)\s*/, "$1\n"))}<Speak t={v.verse} /></p>
        <p className="sh-r-mean" dir="auto">{padyaMeaning(v, lang)}</p>
        <p className="sh-r-foot"><span className="ks-l-en">{S(v.source)}</span>
          <MetreTag verse={v.verse} c={c} onOpen={openMetre} />
          <button className="sh-link" onClick={() => analyse(v.id)}>पूर्णविश्लेषणम् · Full analysis →</button></p>
      </li>))}</ol>
  </>);
};

// ── पदच्छेदः ────────────────────────────────────────────────────
const PadacchedaTab: React.FC = () => {
  const S = useSa();
  return (<>
    <PadacchedaIntro />
    <ListDetail items={PADACCHEDA} idOf={p => p.id} kind="sentence" placeholder="Search a śloka or a word…"
      search={p => [p.sloka, ...p.padas, p.id].join(" ")}
      label={p => <><span className="ks-l-sa ks-l-sent">{S(p.sloka.split(/[।|]/)[0])}</span></>}
      detail={p => (
        <div className="ks-card">
          <div className="ks-head"><h3 className="ks-sent">{S(p.sloka)}</h3><Speak t={p.sloka} /></div>
          <h4>पदच्छेदः · The words</h4>
          <div className="ks-padas">{p.padas.map((w, k) => <span key={k}>{S(w)}</span>)}</div>
          <FlagButton t={{ kind: "sentence", id: p.id, field: "padaccheda", value: p.padas.join(", "), where: `${p.id} — padaccheda` }} label="Report" />
          <p className="ks-id">{p.id} · Vālmīki Rāmāyaṇa (Gold data)</p>
        </div>)} />
  </>);
};

// ── अलङ्काराः ───────────────────────────────────────────────────
const Verse: React.FC<{ t: string }> = ({ t }) => { const S = useSa(); return <p className="sh-verse">{S(t)} <Speak t={t.replace(/\n/g, " ")} /></p>; };

export const AlankaraDetail: React.FC<{ a: Alankara }> = ({ a }) => {
  const S = useSa(); const lang = useLang();
  const L = a.lakshana, E = a.primary_example;
  const same = E.sloka_sa.startsWith(L.sloka_sa.split("\n")[0].split("।")[0].trim());
  return (
    <div className="ks-card">
      <div className="ks-head"><h3>{S(a.name.sa)}</h3><Speak t={a.name.sa} /></div>
      <p className="ks-sub">{a.name.iast} · {a.name.en} · {S(a.category)}</p>
      <h4>लक्षणम् · Definition</h4>
      {!same && <Verse t={L.sloka_sa} />}
      {same && <p className="ks-note-plain">{S(L.sloka_sa)}</p>}
      <p className="ks-main-meaning" dir="auto">{pick4(L, "meaning_", lang)}
        <FlagButton t={{ kind: "grammar", id: `alankara:${a.id}`, field: "lakshana:" + lang, value: pick4(L, "meaning_", lang), where: `${a.name.sa} — definition` }} /></p>
      {["te", "hi", "sa"].includes(lang) && <p className="ks-note-plain">English: {L.meaning_en}</p>}
      <p className="sh-src">{S(L.source_reference)}</p>
      <h4>उदाहरणम् · Example</h4>
      <Verse t={E.sloka_sa} />
      <p className="sh-src">{S(E.source_reference)}</p>
      <p className="ks-anvaya"><b>अन्वयः · </b>{S(E.anvaya)}</p>
      <p className="ks-main-meaning" dir="auto">{pick4(E, "bhaava_", lang)}</p>
      <h4>समन्वयः · How the figure works here</h4>
      <p dir="auto">{pick4(a.alankara_samanvaya, "", lang)}
        <FlagButton t={{ kind: "grammar", id: `alankara:${a.id}`, field: "samanvaya:" + lang, value: pick4(a.alankara_samanvaya, "", lang), where: `${a.name.sa} — samanvaya` }} /></p>
      {a.elements && <><h4>अङ्गानि · Elements</h4>
        <table className="ks-karaka"><tbody>{a.elements.map(e => <tr key={e.element_sa}><td className="ks-l-sa">{S(e.element_sa)}</td><td dir="auto">{pick4(e, "element_", lang)}</td></tr>)}</tbody></table></>}
      {a.types && <><h4>भेदाः · Kinds</h4>
        <table className="ks-karaka"><tbody>{a.types.map(t => <tr key={t.type_name_sa}><td className="ks-l-sa">{S(t.type_name_sa)}</td>
          <td dir="auto"><b>{t.type_name_en}</b><br />{S(pick4(t, "description_", lang))}</td></tr>)}</tbody></table></>}
      {a.anya_udaharanani && <><h4>अन्यानि उदाहरणानि · More examples</h4>
        {a.anya_udaharanani.map((x, i) => <div key={i} className="sh-more"><Verse t={x.sloka_sa} /><p className="sh-src">{S(x.source_reference)}</p><p className="ks-l-en">{x.note_en}</p></div>)}</>}
      <details className="sh-fix"><summary>शोधनम् · What was corrected in this entry ({a.shodhana_tippani.length})</summary>
        <ul>{a.shodhana_tippani.map((n, i) => <li key={i}>{S(n)}</li>)}</ul></details>
      <p className="ks-id">{a.id}</p>
    </div>
  );
};

const AlankaraTab: React.FC = () => {
  const S = useSa(); const lang = useLang();
  const [d, setD] = useState<Alankara[] | null>(null); const [ed, setEd] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { loadAlankara().then(x => { setD(x.alankaras); setEd(x.base_edition); }, e => setErr(String(e.message ?? e))); }, []);
  if (err) return <p className="ks-none">{err}</p>;
  if (!d) return <p className="ks-none">Loading…</p>;
  return (<>
    <details className="ks-intro"><summary>अलङ्काराः · What is an alaṅkāra?</summary>
      <p>{S("शब्दार्थयोः प्रसिद्ध्या वा कवेः प्रौढिवशेन वा । हारादिवदलङ्कारः सन्निवेशो मनोहरः ॥")} <span className="ks-l-en">(चन्द्रालोकः ५.१)</span></p>
      <p>An alaṅkāra is a charming arrangement of sound or sense, like a necklace on the body of poetry. Figures of sound (शब्दालङ्काराः)
        play with letters — अनुप्रासः, यमकम्; figures of meaning (अर्थालङ्काराः) play with ideas — उपमा, रूपकम्, उत्प्रेक्षा.</p>
      <p className="ks-l-en">Definitions and examples follow {S(ed)}. Most of Jayadeva's verses give the definition in the first half and an example in the second.</p></details>
    <ListDetail items={d} idOf={a => a.id} kind="grammar" placeholder="Search a figure: उपमा, simile…"
      search={a => [a.name.sa, a.name.iast, a.name.en, a.name.te, a.name.hi, a.lakshana.sloka_sa, a.primary_example.sloka_sa, pick4(a.lakshana, "meaning_", lang)].join(" ")}
      label={a => <><span className="ks-l-sa">{S(a.name.sa)}</span><span className="ks-l-en">{a.name.en}</span></>}
      detail={a => <AlankaraDetail a={a} />} />
  </>);
};

// ── छन्दांसि ────────────────────────────────────────────────────
const Scanner: React.FC<{ c: Chandas; openMetre: (id: string) => void }> = ({ c, openMetre }) => {
  const [t, setT] = useState("वागर्थाविव सम्पृक्तौ वागर्थप्रतिपत्तये ।\nजगतः पितरौ वन्दे पार्वतीपरमेश्वरौ ॥");
  const lines = padas(t);
  return (
    <details className="ks-intro" open><summary>प्रस्तारः · Scan any verse</summary>
      <p className="ks-l-en">Type or paste a verse in Devanagari, one pāda or one half-verse per line. Each syllable is marked guru (ऽ) or laghu (।) and grouped into gaṇas;
        the metre is named when it is one of the {knownMetres(c).length} known here (Vṛttaratnākara and the 30 described in detail). The last syllable of a pāda may be either.</p>
      <textarea className="sh-input" rows={4} value={t} onChange={e => setT(e.target.value)} lang="sa" aria-label="Verse to scan" />
      {lines.map((l, i) => <ScanLine key={i} line={l} />)}
      {lines.length > 0 && <MetreTag verse={t} c={c} onOpen={openMetre} />}
      {lines.length > 0 && !identify(t, knownMetres(c)) && <p className="ks-l-en">Tip: a śloka half has 16 syllables; other metres usually have one pāda per line.</p>}
    </details>
  );
};

export const VrittaDetail: React.FC<{ v: Vritta }> = ({ v }) => {
  const S = useSa(); const lang = useLang();
  const g = v.gana_structure, E = v.primary_example;
  const sym = [g.symbols, g.symbols_pada_1_3 && `१, ३: ${g.symbols_pada_1_3}`, g.symbols_pada_2_4 && `२, ४: ${g.symbols_pada_2_4}`,
    g.symbols_odd && `विषमपादे: ${g.symbols_odd}`, g.symbols_even && `समपादे: ${g.symbols_even}`].filter(Boolean) as string[];
  return (
    <div className="ks-card">
      <div className="ks-head"><h3>{S(v.name.sa)}</h3><Speak t={v.name.sa} /></div>
      <p className="ks-sub">{v.name.iast} · {S(v.chandas_class.metrical_type)} · {S(v.chandas_class.name_sa)} ({S(String(v.chandas_class.syllables_per_pada))})</p>
      <h4>गणाः · Pattern</h4>
      {(g.ganas_sa || g.description_sa) && <p>{S(g.ganas_sa ?? g.description_sa ?? "")}</p>}
      {sym.map((s, i) => <p key={i} className="sh-sym">{S(s)}</p>)}
      <p><b>यतिः · Pause: </b>{S(v.yati.yati_sa)} <span className="ks-l-en" dir="auto">— {pick4(v.yati, "yati_", lang)}</span></p>
      <h4>लक्षणम् · Definition</h4>
      <Verse t={v.lakshana.sloka_sa} />
      <p className="sh-src">{S(v.lakshana.source_reference)}</p>
      {v.vr_check && <div className="sh-vr">
        {v.vr_check.vr && <p><b>{S(v.vr_check.vr)}</b> <span className="ks-l-en">(Kashi Sanskrit Series ed., 1927)</span></p>}
        {v.vr_check.line && <Verse t={v.vr_check.line} />}
        {v.vr_check.en && <p className="ks-l-en">{v.vr_check.en}</p>}
      </div>}
      <p className="ks-main-meaning" dir="auto">{pick4(v.lakshana, "meaning_", lang)}
        <FlagButton t={{ kind: "grammar", id: `chandas:${v.id}`, field: "lakshana:" + lang, value: pick4(v.lakshana, "meaning_", lang), where: `${v.name.sa} — definition` }} /></p>
      <h4>उदाहरणम् · Example</h4>
      {E ? <>
        <Verse t={E.sloka_sa} />
        <p className="sh-src">{S(E.source_reference)}</p>
        {padas(E.sloka_sa).map((l, i) => <ScanLine key={i} line={l} />)}
        <p className="ks-anvaya"><b>अन्वयः · </b>{S(E.anvaya)}</p>
        <p className="ks-main-meaning" dir="auto">{pick4(E, "bhaava_", lang)}
          <FlagButton t={{ kind: "grammar", id: `chandas:${v.id}`, field: "example", value: E.sloka_sa, where: `${v.name.sa} — example` }} /></p>
        {v.prastara_and_samanvaya && <p className="ks-note-plain" dir="auto">{pick4(v.prastara_and_samanvaya, "", lang)}</p>}
      </> : v.example_note && <p className="ks-note">{S(v.example_note.sa)} — {v.example_note.en}</p>}
      <p className="ks-id">{v.id}</p>
    </div>
  );
};

const GanaChips: React.FC<{ ganas: string; pattern: string }> = ({ ganas: g, pattern }) => {
  const S = useSa();
  return <span className="sh-gchips">{g.split(" ").filter(Boolean).map((x, i) => <b key={i}>{S(x)}</b>)}<i>{S(pattern)}</i></span>;
};

/** one class of the 26, with every metre Vṛttaratnākara lists under it */
export const ClassDetail: React.FC<{ cl: ChandasClass; c: Chandas; openDetail: (id: string) => void }> = ({ cl, c, openDetail }) => {
  const S = useSa(); const lang = useLang();
  const grp = c.groups[cl.group];
  return (
    <div className="ks-card">
      <div className="ks-head"><h3>{S(cl.name)}</h3><Speak t={cl.name} /></div>
      <p className="ks-sub">{S([cl.alt, cl.alt2].filter(Boolean).join(" · "))}{(cl.alt || cl.alt2) ? " · " : ""}{S(grp.sa)}</p>
      <table className="ks-karaka sh-facts"><tbody>
        <tr><td>{S("प्रतिपादम् अक्षराणि")}</td><td>{cl.n} <span className="ks-l-en">syllables in a pāda</span></td></tr>
        <tr><td>{S("चतुर्षु पादेषु")}</td><td>{cl.n * 4} <span className="ks-l-en">syllables in a verse of four pādas</span></td></tr>
        <tr><td>{S("प्रस्तारः")}</td><td>{cl.patterns.toLocaleString("en-IN")} <span className="ks-l-en">possible guru/laghu patterns of one pāda (2<sup>{cl.n}</sup>, VR ch. 6)</span></td></tr>
        {cl.vedic && <tr><td>{S("वैदिकम्")}</td><td>{cl.vedic.vedic_syllables}</td></tr>}
      </tbody></table>
      <p className="ks-l-en">{grp.note_en}</p>
      {cl.vedic && <p className="ks-main-meaning" dir="auto">{pick4(cl.vedic, "", lang)}</p>}
      <h4>वृत्तानि · Metres of this class in Vṛttaratnākara ({cl.vrittas.length})</h4>
      <div className="sh-vlist">{cl.vrittas.map(e => (
        <div key={e.vr} className="sh-vitem">
          <p className="sh-vname"><b>{S(e.name)}</b> <span className="ks-l-en">VR 3.{e.vr}</span>
            {e.yati && <span className="ks-l-en"> · {S("यतिः")} {S(e.yati)}</span>}
            {e.detail && <button className="sh-link" onClick={() => openDetail(e.detail!)}>विवरणम् · details →</button>}</p>
          {e.pattern && <GanaChips ganas={e.ganas} pattern={e.pattern} />}
          <p className="sh-vline">{S(e.line)} <Speak t={e.line} /></p>
          {e.aliases && <p className="ks-l-en">{S(e.aliases.join(" · "))}</p>}
          {e.note && <p className="ks-l-en">{e.note}</p>}
        </div>))}</div>
      {cl.vrittas.some(e => e.pattern) && <p className="ks-l-en">Each definition above is itself written in the metre it defines — scan it in प्रस्तारः to see.</p>}
    </div>
  );
};

type ClassItem = { id: string; label: string; en: string; cl?: ChandasClass; other?: "dandaka" | "ardhasama" | "vishama" | "jati" };

const OtherDetail: React.FC<{ kind: NonNullable<ClassItem["other"]>; c: Chandas }> = ({ kind, c }) => {
  const S = useSa();
  if (kind === "dandaka") return (
    <div className="ks-card"><div className="ks-head"><h3>{S("दण्डकाः")}</h3></div>
      <p className="ks-l-en">{c.groups.dandaka.note_en}</p>
      {c.dandaka.map(d => <div key={d.vr} className="sh-vitem"><p className="sh-vname"><b>{S(d.name)}</b> <span className="ks-l-en">VR 3.{d.vr} · {S(d.ganas)}</span></p>
        <p className="sh-vline">{S(d.line)}</p></div>)}</div>);
  if (kind === "ardhasama") return (
    <div className="ks-card"><div className="ks-head"><h3>{S("अर्धसमवृत्तानि")}</h3></div>
      <p className="ks-l-en">Pādas 1 and 3 share one pattern, 2 and 4 another (VR ch. 4).</p>
      {c.ardhasama.map(a => <div key={a.name} className="sh-vitem"><p className="sh-vname"><b>{S(a.name)}</b></p>
        <p>{S(a.ganas)}</p><p className="sh-sym">{a.pats.map(p => S(p)).join("  |  ")}</p></div>)}</div>);
  if (kind === "vishama") return (
    <div className="ks-card"><div className="ks-head"><h3>{S("विषमवृत्तानि")}</h3></div>
      <p className="ks-l-en">All four pādas differ (VR ch. 5). The best known is उद्गता.</p>
      <div className="ks-padas">{c.vishama.map(n => <span key={n}>{S(n)}</span>)}</div></div>);
  return (
    <div className="ks-card"><div className="ks-head"><h3>{S("जातयः · मात्रावृत्तानि")}</h3></div>
      <p className="ks-l-en">Counted in mātrās, not syllables — laghu 1, guru 2 (VR ch. 2). आर्या and गीतिः are described in detail under वृत्तानि.</p>
      <div className="ks-padas">{c.jati.map(n => <span key={n}>{S(n)}</span>)}</div></div>);
};

const ClassesView: React.FC<{ c: Chandas; initial: string | null; openDetail: (id: string) => void }> = ({ c, initial, openDetail }) => {
  const S = useSa();
  const items: ClassItem[] = [
    ...c.classes.map(cl => ({ id: `C${cl.n}`, label: cl.name, en: `${cl.n} · ${cl.vrittas.length}`, cl })),
    { id: "D", label: "दण्डकाः", en: "27 +", other: "dandaka" as const },
    { id: "A", label: "अर्धसमवृत्तानि", en: `${c.ardhasama.length}`, other: "ardhasama" as const },
    { id: "V", label: "विषमवृत्तानि", en: `${c.vishama.length}`, other: "vishama" as const },
    { id: "J", label: "जातयः", en: "mātrā", other: "jati" as const },
  ];
  return (<>
    <details className="ks-intro" open><summary>षड्विंशतिश्छन्दांसि · The 26 classes</summary>
      <p className="ks-l-en">A class (chandas) is fixed by how many syllables a pāda has — one to twenty-six. Each class holds many metres (vṛttas), which differ in the order of guru and laghu syllables.
        Vṛttaratnākara names the classes:</p>
      {c.vr_names.map((l, i) => <Verse key={i} t={l} />)}
      <p className="sh-src">{S("वृत्तरत्नाकरः १.१९–२१")}</p>
      <table className="ks-karaka sh-ctable"><thead><tr><th>#</th><th>{S("छन्दः")}</th><th>{S("अक्षराणि")}</th><th>{S("वृत्तानि")}</th></tr></thead><tbody>
        {c.classes.map(cl => <tr key={cl.n} className={`g-${cl.group}`}><td>{cl.n}</td><td className="ks-l-sa">{S(cl.name)}{cl.alt && <span className="ks-l-en"> ({S(cl.alt)})</span>}</td>
          <td>{cl.n} × 4 = {cl.n * 4}</td><td className="ks-l-sa">{S(cl.vrittas.map(e => e.name.replace(/ \(.*\)$/, "")).filter((x, i, a) => a.indexOf(x) === i).join(", "))}</td></tr>)}
      </tbody></table></details>
    <ListDetail key={initial ?? ""} items={items} idOf={x => x.id} kind="grammar" placeholder="Search a class or metre: त्रिष्टुप्, मालिनी…" initial={initial} listLabel="classes"
      search={x => [x.label, x.cl?.alt ?? "", ...(x.cl?.vrittas.map(e => e.name) ?? [])].join(" ")}
      label={x => <><span className="ks-l-sa">{S(x.label)}</span><span className="ks-l-en">{x.en}</span></>}
      detail={x => x.cl ? <ClassDetail cl={x.cl} c={c} openDetail={openDetail} /> : <OtherDetail kind={x.other!} c={c} />} />
  </>);
};

const IntroView: React.FC<{ c: Chandas }> = ({ c }) => {
  const S = useSa(); const lang = useLang();
  const F = c.framework, LG = F.laghu_guru_system;
  return (<div className="ks-card">
    <h4>छन्दः · What is metre?</h4>
    <p dir="auto">{pick4(F.etymology_and_definition, "", lang)}</p>
    <p className="ks-l-en">Chandas is one of the six Vedāṅgas — 'the feet of the Veda' (Pāṇinīya-śikṣā). To recite a mantra rightly one must know its ṛṣi, its devatā and its chandas.</p>
    <h4>लघुः गुरुश्च · Light and heavy syllables</h4>
    <Verse t={LG.definition_rule.sloka_sa} />
    <p><b>लघुः (।) · 1 मात्रा</b> — <span dir="auto">{pick4(LG.laghu, "description_", lang)}</span></p>
    <p><b>गुरुः (ऽ) · 2 मात्रे</b></p>
    <ul>{LG.guru.conditions.map((x, i) => <li key={i}>{S(x.condition_sa)} <span className="ks-l-en" dir="auto">— {pick4(x, "condition_", lang)}</span></li>)}</ul>
    <h4>गणाः · The eight gaṇas</h4>
    <p className="ks-l-en">Syllables are read in threes. Remember them with {S("यमाताराजभानसलगाः")}: take any letter and the next two — य-मा-ता is य-गण (। ऽ ऽ), मा-ता-रा is म-गण (ऽ ऽ ऽ), and so on; ल and ग stand for a single laghu and guru.</p>
    <table className="ks-karaka"><tbody>{F.ashta_ganas.map(g => (
      <tr key={g.id}><td className="ks-l-sa">{S(g.name.sa)}</td><td className="sh-sym">{g.symbol}</td><td className="ks-l-sa">{S(g.mnemonic)}</td><td className="ks-l-en">{g.name.en}</td></tr>))}</tbody></table>
    <h4>वृत्तभेदाः · Kinds of metre</h4>
    <table className="ks-karaka"><tbody>{c.kinds.map(k => <tr key={k.sa}><td className="ks-l-sa">{S(k.sa)}</td><td dir="auto">{pick4(k, "", lang)}</td></tr>)}</tbody></table>
    {c.vr_defs.map((l, i) => <Verse key={i} t={l} />)}
    <p className="sh-src">{S("वृत्तरत्नाकरः १.१४–१८")}</p>
    <h4>पादः यतिश्च · Pāda and pause</h4>
    <p className="ks-l-en">A pāda is a quarter of the verse (VR 1.12: ज्ञेयः पादश्चतुर्थांशः); yati is the pause inside a long pāda, named in the definitions by number-words — रस 6, वेद/अब्धि 4, मुनि/अश्व/स्वर 7, वसु 8, ग्रह 9, दिश् 10, रुद्र 11, सूर्य/अर्क 12.</p>
  </div>);
};

const VedicView: React.FC<{ c: Chandas }> = ({ c }) => {
  const S = useSa(); const lang = useLang();
  const prime = c.classes.filter(cl => cl.vedic);
  return (<div className="ks-card">
    <h4>वैदिकच्छन्दांसि · Metres of the Veda</h4>
    <p className="ks-l-en">Vedic metres are counted by the whole verse, not by a fixed guru/laghu order. The seven prime metres, each four syllables longer than the one before:</p>
    <table className="ks-karaka"><tbody>{prime.map(cl => <tr key={cl.n}><td className="ks-l-sa">{S(cl.name)}</td><td>{cl.vedic!.vedic_syllables}</td><td dir="auto">{pick4(cl.vedic!, "", lang)}</td></tr>)}</tbody></table>
    <h4>अष्टौ वैदिकवर्गाः · The eight Vedic classes</h4>
    <p className="ks-l-en">{c.vedic_classes_note}</p>
    <div className="ks-table-wrap"><table className="ks-karaka sh-vc"><thead><tr><th></th>{prime.map(cl => <th key={cl.n}>{S(cl.name)}</th>)}</tr></thead>
      <tbody>{c.vedic_classes.map(v => <tr key={v.sa} className={v.en === "Ārṣī" ? "on" : ""}><td className="ks-l-sa">{S(v.sa)}</td>{v.counts.map((n, i) => <td key={i}>{n}</td>)}</tr>)}</tbody></table></div>
    <h4>निचृत्, भुरिक्, विराट्, स्वराट्</h4>
    <table className="ks-karaka"><tbody>{c.variants.map(v => <tr key={v.sa}><td className="ks-l-sa">{S(v.sa)}</td><td dir="auto">{pick4(v, "d_", lang)}</td></tr>)}</tbody></table>
    <p className="ks-l-en">{c.variants_note}</p>
    <p className="sh-src">{c.source}</p>
  </div>);
};

const SUB: [string, string][] = [["i", "परिचयः · Basics"], ["k", "छन्दांसि · 26 classes"], ["d", "वृत्तानि · Metres in detail"], ["s", "प्रस्तारः · Scanner"], ["e", "वैदिकम् · Vedic"]];

export const ChandasTab: React.FC<{ c: Chandas | null; err: string; initial: string | null; openMetre: (id: string) => void }> = ({ c, err, initial, openMetre }) => {
  const S = useSa();
  const [sub, setSub] = useState(() => initial?.startsWith("VRIT") ? "d" : initial ? "k" : "i");
  const [classSel, setClassSel] = useState<string | null>(null);
  const [detailSel, setDetailSel] = useState<string | null>(initial?.startsWith("VRIT") ? initial : null);
  useEffect(() => {
    if (!initial || !c) return;
    if (initial.startsWith("VRIT")) { setDetailSel(initial); setSub("d"); }
    else if (initial.startsWith("VR3-")) { const n = +initial.slice(4); const cl = c.classes.find(k => k.vrittas.some(e => e.vr === n)); if (cl) { setClassSel(`C${cl.n}`); setSub("k"); } }
    else if (initial.startsWith("VR4-")) { setClassSel("A"); setSub("k"); }
  }, [initial, c]);
  if (err) return <p className="ks-none">{err}</p>;
  if (!c) return <p className="ks-none">Loading…</p>;
  const openDetail = (id: string) => { setDetailSel(id); setSub("d"); window.scrollTo(0, 0); };
  return (<>
    <div className="sh-sub"><Tabs tabs={SUB} on={sub} set={setSub} /></div>
    {sub === "i" ? <IntroView c={c} />
      : sub === "k" ? <ClassesView c={c} initial={classSel} openDetail={openDetail} />
      : sub === "s" ? <Scanner c={c} openMetre={openMetre} />
      : sub === "e" ? <VedicView c={c} />
      : <ListDetail key={detailSel ?? ""} items={c.vrittas} idOf={v => v.id} kind="grammar" placeholder="Search a metre: अनुष्टुप्, vasantatilakā…" initial={detailSel}
          search={v => [v.name.sa, v.name.iast, v.name.en, v.name.te, v.lakshana.sloka_sa, v.primary_example?.sloka_sa ?? ""].join(" ")}
          label={v => <><span className="ks-l-sa">{S(v.name.sa)}</span><span className="ks-l-en">{S(String(v.chandas_class.syllables_per_pada))}</span></>}
          detail={v => <VrittaDetail v={v} />} />}
  </>);
};

// ── the section ─────────────────────────────────────────────────
export const SahityaBook: React.FC = () => {
  const [tab, setTabState] = useState(tabFromHash);
  const [padyaSel, setPadyaSel] = useState<string | null>(null);
  const [metreSel, setMetreSel] = useState<string | null>(null);
  const { c, err } = useChandas();
  const setTab = (t: string) => { setTabState(t); try { history.replaceState(null, "", `#sahitya/${t}`); } catch { /* sandboxed */ } };
  const analyse = (id: string) => { setPadyaSel(id); setTab("v"); window.scrollTo(0, 0); };
  const openMetre = (id: string) => { setMetreSel(id); setTab("c"); window.scrollTo(0, 0); };
  return (
    <div className="ks">
      <KsTop title="साहित्यम्" en="Literature — verse, metre and ornament"
        sub={`${PADYA.verses.length} verses analysed step by step (Raghuvaṃśa and Rāmāyaṇa), ${PADACCHEDA.length} Rāmāyaṇa ślokas split into words, 50 alaṅkāras from Jayadeva's Candrāloka, and the 26 metre classes with the 109 metres of Vṛttaratnākara (30 explained in full) and a scanner for any verse.`} />
      <Tabs tabs={TABS} on={tab} set={setTab} />
      {tab === "v" ? <PadyaTab c={c} initial={padyaSel} openMetre={openMetre} />
        : tab === "r" ? <RaghuTab c={c} analyse={analyse} openMetre={openMetre} />
        : tab === "p" ? <PadacchedaTab />
        : tab === "a" ? <AlankaraTab />
        : <ChandasTab c={c} err={err} initial={metreSel} openMetre={openMetre} />}
    </div>
  );
};
