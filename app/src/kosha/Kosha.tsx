// ═══════════════════════════════════════════════════════════════
//  kosha/Kosha.tsx — the reference books behind the game
//  शब्दकोशः (words + declensions), धातुकोशः (verbs + kṛdantas),
//  वाक्यकोशः (sentences + avyayas), दोषसूचनाः (all flags).
//  Every form and meaning has a ⚑ to report a mistake.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  WORDS, GRAMMAR, loadDhatu400Data, SENTENCES, AVYAYA, AVYAYA_CATS, ERRORS, PADACCHEDA, PADYA, padyaMeaning, LANGS, VIBHAKTI, VIBHAKTI_EN, VACANA, PURUSHA, LAKARA, LAKARA_ORDER, LAKARA_INFO, wordKind,
  wordMeaning, avyayaMeaning, sentMeaning, sentRoman, padyaRoman, type Word,
  type Dhatu400, type Dhatu400Conjugation, type Dhatu400Krt, type Dhatu400KrtForm,
} from "../data";
import { FlagButton, LangPicker, Review } from "../FlagUI";
import { romanize } from "../i18n/roman";

/** the meaning read aloud in Latin letters, under a meaning in a non-Latin script */
/** a reading in a table cell: shown only when readings are switched on */
export const RomS: React.FC<{ t: string; l: string }> = ({ t, l }) => { const on = useReadings(); const r = on ? romanize(t, l) : ""; return r ? <i className="ks-roman-s" dir="ltr">{r}</i> : null; };
/** the reading under a main meaning: a small "Aa" chip until tapped; tapping the reading hides it again (for every meaning) */
export const Rom: React.FC<{ t: string }> = ({ t }) => {
  const on = useReadings();
  if (!t) return null;
  return on
    ? <p className="ks-roman" lang="und-Latn" dir="ltr" onClick={() => setReadings(false)} title="Hide readings">{t}</p>
    : <button className="ks-roman-btn" onClick={() => setReadings(true)} title="Show how to read it in Latin letters" aria-label="Show reading">Aa</button>;
};
import { nounGloss, caseRole } from "../i18n/forms";
import { flagsCSV, importFlags, ISSUES, OK, removeFlag, saveFile, useFlags, type FlagKind } from "../flags";
import { useLang, useReadings, setReadings } from "../settings";
import { speak } from "../speech";
import { useSa } from "../i18n/script";
import { PadacchedaIntro, PadyaIntro } from "./Intro";
import { UpasargaForRoot, ComboCard, comboLabel, comboSearch, rootKey, PREFIX_BY_ROOT } from "./Upasarga";
import { RupaHub, takeUnadiRequest } from "./Unadi";
import { SambhashanamLink } from "../speak/Sambhashanam";
import "./kosha.css";
import { PlayLink } from "../play/Play";

// ── shared list + detail layout ────────────────────────────────
export function ListDetail<T>({ items, idOf, kind, label, search, detail, placeholder, initial, listHidden, toggleList, listLabel = "list" }: {
  items: T[]; idOf: (x: T) => string; kind: FlagKind; label: (x: T) => React.ReactNode;
  search: (x: T) => string; detail: (x: T) => React.ReactNode; placeholder: string; initial?: string | null;
  listHidden?: boolean; toggleList?: () => void; listLabel?: string;
}) {
  const { flags } = useFlags();
  const generatedListId = useId();
  const [localListHidden, setLocalListHidden] = useState(false);
  const [q, setQ] = useState("");
  const [only, setOnly] = useState(false);
  const [sel, setSel] = useState<string | null>(initial ?? null);
  const listRef = useRef<HTMLDivElement>(null);
  const isListHidden = listHidden ?? localListHidden;
  const onToggleList = toggleList ?? (() => setLocalListHidden(hidden => !hidden));
  useEffect(() => { if (initial) listRef.current?.querySelector(".on")?.scrollIntoView({ block: "nearest" }); }, [initial]);
  const flaggedIds = useMemo(() => new Set(flags.filter(f => f.kind === kind).map(f => f.id)), [flags, kind]);
  const list = items.filter(x => (!q || search(x).toLowerCase().includes(q.trim().toLowerCase())) && (!only || flaggedIds.has(idOf(x))));
  const cur = items.find(x => idOf(x) === sel) ?? list[0] ?? items[0];
  return (
    <>
      <div className="ks-tools">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} aria-label="Search" />
        <label className="ks-only"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> ⚑ only flagged</label>
        <span className="ks-count">{list.length} / {items.length}</span>
        <button type="button" className="ks-list-toggle" aria-expanded={!isListHidden} aria-controls={generatedListId} onClick={onToggleList}>
          {isListHidden ? `Show ${listLabel}` : `Hide ${listLabel}`}
        </button>
      </div>
      <div className={`ks-body${isListHidden ? " ks-body-list-hidden" : ""}`}>
        <div className="ks-list" id={generatedListId} role="listbox" ref={listRef}>
          {list.map(x => (
            <button key={idOf(x)} role="option" aria-selected={cur === x} className={cur === x ? "on" : ""} onClick={() => setSel(idOf(x))}>
              {label(x)}{flaggedIds.has(idOf(x)) && <span className="ks-flagdot">⚑</span>}
            </button>
          ))}
          {!list.length && <p className="ks-none">Nothing matches.</p>}
        </div>
        <div className="ks-detail">{cur ? detail(cur) : null}</div>
      </div>
    </>
  );
}

export const Tabs: React.FC<{ tabs: [string, string][]; on: string; set: (k: string) => void }> = ({ tabs, on, set }) => (
  <div className="ks-tabs">{tabs.map(([k, v]) => <button key={k} className={k === on ? "on" : ""} onClick={() => set(k)}>{v}</button>)}</div>
);
export const Speak: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;
const Pill: React.FC<{ k: string }> = ({ k }) => <span className={`ks-pill ks-pill-${k}`}>{k}</span>;

// ── शब्दकोशः ───────────────────────────────────────────────────
const WordDetail: React.FC<{ w: Word }> = ({ w }) => {
  const lang = useLang();
  const S = useSa();
  const langs = Object.keys(LANGS).filter(k => w.m?.[k]?.[0]);
  return (
    <div className="ks-card">
      <div className="ks-head">
        <h3>{S(w.d[0]?.[0] || w.w)}</h3><Speak t={w.d[0]?.[0] || w.w} />
        <span className="ks-sub">{S(w.w)} · {w.iast} · <b className="ks-kind">{S(wordKind(w)[0])}</b> ({wordKind(w)[1]}) · {w.cat}</span>
        {w.cat !== "participle" && <PlayLink kind="w" id={w.id} />}
      </div>
      <p className="ks-main-meaning" dir="auto">{wordMeaning(w, lang)}</p>
      <Rom t={romanize(wordMeaning(w, lang), lang)} />
      <div className="ks-table-wrap">
        <table className="ks-table">
          <thead><tr><th>{S("विभक्तिः")}</th>{VACANA.map(v => <th key={v}>{S(v)}</th>)}</tr></thead>
          <tbody>
            {VIBHAKTI.map((vb, vi) => (
              <tr key={vb}>
                <th>{S(vb)}<small>{VIBHAKTI_EN[vi]}</small>{lang !== "en" && <small className="ks-role">{caseRole(lang, vi)}</small>}</th>
                {[0, 1, 2].map(n => {
                  const f = w.d[n]?.[vi];
                  if (!f) return <td key={n} className="ks-empty">—</td>;
                  const gl = nounGloss(w, vi, n, lang);
                  return (
                    <td key={n} className="ks-form">{vi === 7 && <span className="ks-he">{S("हे")} </span>}{S(f)}
                      <FlagButton t={{ kind: "word", id: w.id, field: `d:${vi},${n}`, value: f, where: `${w.w} — ${vb} ${VACANA[n]}` }} />
                      <span className="ks-gloss" dir="auto">{gl}<RomS t={gl} l={lang} /><Review t={{ kind: "word", id: w.id, field: `gloss:${lang}:d:${vi},${n}`, value: gl, where: `${w.w} — ${vb} ${VACANA[n]} — meaning (${LANGS[lang]})` }} /></span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ks-note">🌐 The line under each form is its meaning in <b>{LANGS[lang]}</b>{lang === "en" ? "" : ", built from that language's case pattern"}.</p>
      {w.ch > 0 && <p className="ks-note">🔁 {w.ch} forms in this table were regenerated with the Pāṇinian engine and differ from the old table — please check them first.</p>}
      <h4>सर्वभाषासु अर्थाः · Meaning in every language <small className="rv-only">(label = source; <b>draft</b> needs the most checking)</small></h4>
      <div className="ks-meanings">
        {langs.map(k => (
          <div key={k} className={k === lang ? "on" : ""}>
            <b>{LANGS[k]}</b><span>{w.m[k][0]}{romanize(w.m[k][0], k) && <i className="ks-roman-s">{romanize(w.m[k][0], k)}</i>}</span><Pill k={w.m[k][1]} />
            <Review t={{ kind: "word", id: w.id, field: "meaning:" + k, value: w.m[k][0], where: `${w.w} — meaning (${LANGS[k]})` }} />
          </div>
        ))}
      </div>
      {w.notes?.length > 0 && <p className="ks-note">{w.notes.join(" · ")}</p>}
      <p className="ks-id">{w.id}</p>
    </div>
  );
};
const GENDERS: [string, string, string][] = [["all", "सर्वे", "all"], ["m", "पुंलिङ्गाः", "masculine"], ["f", "स्त्रीलिङ्गाः", "feminine"], ["n", "नपुंसकलिङ्गाः", "neuter"], ["c", "त्रिषु लिङ्गेषु समानाः", "same in all genders: अस्मद्, युष्मद्, पञ्चन् … दशन्"]];
const ENDS: [string, string, string][] = [["all", "सर्वे", "all"], ["ac", "अजन्ताः", "vowel-ending"], ["hal", "हलन्ताः", "consonant-ending"]];
export const WordBook: React.FC = () => {
  const lang = useLang();
  const S = useSa();
  const [g, setG] = useState("all");
  const [end, setEnd] = useState("all");
  const [listHidden, setListHidden] = useState(false);
  const isHal = (w: Word) => w.w.endsWith("्");
  const items = WORDS.filter(w => (g === "all" || w.g === g) && (end === "all" || (end === "hal") === isHal(w)));
  const count = (gg: string, ee: string) => WORDS.filter(w => (gg === "all" || w.g === gg) && (ee === "all" || (ee === "hal") === isHal(w))).length;
  return (
    <div className="ks">
      <KsTop title="शब्दकोशः" en="Noun Book" sub={`${WORDS.length} words with all their forms and meanings in ${Object.keys(LANGS).length - 1} languages.`} />
      <div className="ks-chips gr-filter">{GENDERS.map(([k, sa, en]) => <button key={k} className={`ks-tag ${g === k ? "on" : ""}`} onClick={() => setG(k)} title={en}>{S(sa)} <small>({count(k, end)})</small></button>)}</div>
      <div className="ks-chips gr-filter">{ENDS.map(([k, sa, en]) => <button key={k} className={`ks-tag ${end === k ? "on" : ""}`} onClick={() => setEnd(k)} title={en}>{S(sa)} <small>({count(g, k)})</small></button>)}</div>
      <ListDetail key={g + end} items={items} idOf={w => w.id} kind="word" placeholder="Search: राम, rāma, boy, బాలుడు…"
        listHidden={listHidden} toggleList={() => setListHidden(hidden => !hidden)} listLabel="shabda list"
        search={w => [w.w, w.iast, w.d[0]?.[0], ...Object.values(w.m ?? {}).map(m => m[0])].join(" ")}
        label={w => <><span className="ks-l-sa">{S(w.d[0]?.[0] || w.w)}</span><span className="ks-l-en">{wordMeaning(w, lang).split(";")[0]}</span><span className="ks-l-kind">{S(wordKind(w)[0])}</span>{w.ch > 0 && <span className="ks-l-ch" title="regenerated forms">🔁{w.ch}</span>}</>}
        detail={w => <WordDetail w={w} />} />
    </div>
  );
};

// ── धातुकोशः ───────────────────────────────────────────────────
type Dhatu400Mode = "kartari" | "atmanepada" | "karmani" | "bhave";
const Dhatu400Detail: React.FC<{ v: Dhatu400; krt?: Dhatu400Krt }> = ({ v, krt }) => {
  const lang = useLang();
  const S = useSa();
  const [mode, setMode] = useState<Dhatu400Mode>("kartari");
  const [lk, setLk] = useState("lat");
  const choices: [Dhatu400Mode, string, Record<string, Dhatu400Conjugation> | undefined][] = [
    ["kartari", `कर्तरि · ${v.pada}`, v.lakara_conjugations],
    ["atmanepada", "आत्मनेपदम् · Atmanepada", v.lakara_conjugations_atmanepada],
    ["karmani", "कर्मणि · Passive", v.karmani_conjugations],
    ["bhave", "भावे · Impersonal", v.bhave_conjugations],
  ].filter((x): x is [Dhatu400Mode, string, Record<string, Dhatu400Conjugation>] => !!x[2]);
  const selected = choices.find(x => x[0] === mode) ?? choices[0];
  const forms = selected[2] || v.lakara_conjugations;
  const lakaras = LAKARA_ORDER.filter(x => forms[x]);
  const lakara = forms[lk] ? lk : lakaras[0];
  const grid = forms[lakara]?.conjugation_grid;
  const lakaraInfo = forms[lakara]?.lakara_meaning ?? LAKARA_INFO[lakara];
  const meaning = v.meanings[lang] || v.meanings.en || v.gloss_verb_en;
  return (
    <div className="ks-card">
      <div className="ks-head">
        <h3>{S(v.lemma)}</h3><Speak t={v.lemma} />
        <span className="ks-sub">{v.iast} · {v.gana} · {v.pada} · {v.transitivity} · {v.dhatupatha.code}</span>
        <PlayLink kind="d" id={v.id} />
      </div>
      <p className="ks-main-meaning" dir="auto">{meaning} <span className="ks-artha">({v.dhatupatha.artha})</span></p>
      <h4>रूपाणि · Forms</h4>
      <div className="ks-chips">{choices.map(([key, label]) =>
        <button key={key} className={key === selected[0] ? "on" : ""} onClick={() => setMode(key)}>{label}</button>)}</div>
      <div className="ks-chips ks-chips-sm">{lakaras.map(x =>
        <button key={x} className={x === lakara ? "on" : ""} onClick={() => setLk(x)}>{LAKARA[x][0]} <small>{LAKARA[x][1]}</small></button>)}</div>
      {lakaraInfo && <p className="ks-lak-info"><b>{S(LAKARA[lakara][0])}</b> <span className="ks-lak-sutra">{S(lakaraInfo.sutra)}</span>
        <span className="ks-lak-meaning-sa">{S(lakaraInfo.sa)}</span>{lakaraInfo.en} <span className="ks-lak-term">{lakaraInfo.term}</span></p>}
      <div className="ks-table-wrap">
        <table className="ks-table">
          <thead><tr><th>{S("पुरुषः")}</th>{VACANA.map(n => <th key={n}>{S(n)}</th>)}</tr></thead>
          <tbody>{PURUSHA.map((person, pi) => {
            const personKey = (["prathama_purusha", "madhyama_purusha", "uttama_purusha"] as const)[pi];
            const personGrid = grid?.[personKey];
            return <tr key={person}><th>{S(person)}</th>{(["ekavacana", "dvivacana", "bahuvacana"] as const).map((number, ni) => {
              const cell = personGrid?.[number];
              if (!cell?.form) return <td key={number} className="ks-empty">—</td>;
              const gloss = cell.meanings?.[lang] || cell.meanings?.en || "";
              return <td key={number} className="ks-form">{S(cell.form)}{cell.variants?.length ? <span className="ks-alt"> / {cell.variants.map(S).join(" / ")}</span> : null}
                <FlagButton t={{ kind: "verb", id: v.id, field: `${selected[0]}:${lakara}:${pi},${ni}`, value: cell.form, where: `${v.lemma} — ${selected[1]} ${LAKARA[lakara][0]} ${person} ${VACANA[ni]}` }} />
                <span className="ks-gloss" dir="auto">{gloss}{gloss && <RomS t={gloss} l="en" />}</span>
              </td>;
            })}</tr>;
          })}</tbody>
        </table>
      </div>
      <UpasargaForRoot lemma={v.lemma} gana={v.gana} />
      {krt && <Dhatu400KrtTable r={krt} />}
      <p className="ks-id">{v.id}</p>
    </div>
  );
};
const Dhatu400KrtTable: React.FC<{ r: Dhatu400Krt }> = ({ r }) => {
  const S = useSa();
  const forms = (entries: [string, Dhatu400KrtForm][]) => entries.map(([suffix, item]) => (
    <tr key={suffix}><th>{suffix}</th><td className="ks-form">{item.form ? <>{S(item.form)}{item.variants?.length ? <span className="ks-alt"> / {item.variants.map(x => S(x)).join(" / ")}</span> : null}
      <FlagButton t={{ kind: "krt", id: r.dhatu_id, field: suffix, value: item.form, where: `${r.lemma} + ${suffix}` }} /></> : "—"}</td>
      <td>{item.meaning_en || item.status || item.note || ""}</td><td className="rv-only">{item.attested_in_dictionary ? "in dictionary" : item.tier || item.status || ""}</td></tr>
  ));
  const restricted = Object.entries(r.restricted_krt);
  return <>
    <h4>कृदन्तानि · Participles &amp; verbal nouns</h4>
    <div className="ks-table-wrap"><table className="ks-table ks-krt">
      <thead><tr><th>प्रत्ययः</th><th>रूपम्</th><th>अर्थः · English</th><th className="rv-only">source / status</th></tr></thead>
      <tbody>{forms(Object.entries(r.krt_rupas))}</tbody>
    </table></div>
    {restricted.length > 0 && <>
      <h4>विशिष्टप्रत्ययाः · Restricted derivations</h4>
      <div className="ks-table-wrap"><table className="ks-table ks-krt">
        <thead><tr><th>प्रत्ययः</th><th>रूपम्</th><th>अर्थः / नियमः</th><th className="rv-only">source / status</th></tr></thead>
        <tbody>{forms(restricted)}</tbody>
      </table></div>
    </>}
  </>;
};
export const VerbBook: React.FC = () => {
  const lang = useLang();
  const S = useSa();
  const [unadiStart] = useState(takeUnadiRequest);   // opened from a link to the Uṇādi words or quiz
  const [tab, setTab] = useState(unadiStart ? "make" : "all");
  const [focus, setFocus] = useState<string | null>(null);
  const [data, setData] = useState<{ tinanta: Dhatu400[]; krt: Dhatu400Krt[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadDhatu400Data().then(set => {
      if (active) setData(set);
    }).catch(error => {
      console.error("Failed to load the expanded dhātu data.", error);
      if (active) setLoadError(error instanceof Error ? error.message : String(error));
    });
    return () => { active = false; };
  }, []);
  if (loadError) return <div className="ks"><KsTop title="धातुकोशः" en="Verb book" sub="The expanded verb data could not be loaded." />
    <p className="ks-note" role="alert">{loadError}</p></div>;
  if (!data) return <div className="ks"><KsTop title="धातुकोशः" en="Verb book" sub="Loading the expanded dhātu data…" />
    <p className="ks-note" role="status">Loading 400-root verb and participle data…</p></div>;
  const { tinanta, krt } = data;
  return (
    <div className="ks">
      <KsTop title="धातुकोशः" en="Verb book" sub={`${tinanta.length} roots with generated tiṅanta forms and ${krt.length} roots with kṛdantas.`} />
      <p className="ks-note">{tinanta.filter(v => v.id <= "MDH-400").length} of the 400 marked roots have generated form records, plus {tinanta.filter(v => v.id > "MDH-400").length} roots added for the prefixed verbs.</p>
      <Tabs tabs={[
        ["all", `धातुरूपाणि · All roots (${tinanta.length})`],
        ["krt400", `कृदन्तानि · All roots (${krt.length})`],
        ["upa", `उपसर्गयुक्ताः · With prefixes (${GRAMMAR.upasarga.combos.length})`],
        ["make", "रूपनिर्माणम् · Make any form"],
      ]} on={tab} set={setTab} />
      {tab === "make" ? <RupaHub start={unadiStart ?? "forms"} />
        : tab === "upa" ? <ListDetail items={GRAMMAR.upasarga.combos} idOf={c => c.id} kind="grammar" placeholder="Search: अनुभवति, अनु, to experience…"
          search={comboSearch} label={c => comboLabel(c, lang, S)}
          detail={c => { const root = tinanta.find(v => rootKey(v.lemma, v.gana) === rootKey(c.d, c.g));
            return <ComboCard c={c} openRoot={root ? () => { setFocus(root.id); setTab("all"); } : undefined} rootLabel={root ? root.lemma : undefined} />; }} />
        : tab === "all" ? <ListDetail<Dhatu400> key={focus ?? "all"} initial={focus} items={tinanta} idOf={v => v.id} kind="verb" placeholder="Search: गम्, gam, to go, अनुभवति…"
          search={v => [v.lemma, v.iast, v.gana, v.dhatupatha.artha, ...Object.values(v.meanings), PREFIX_BY_ROOT.get(rootKey(v.lemma, v.gana)) ?? ""].join(" ")}
          label={v => <><span className="ks-l-sa">{S(v.lemma)}</span><span className="ks-l-en">{v.meanings[lang] || v.meanings.en}</span></>}
          detail={v => <Dhatu400Detail key={v.id} v={v} krt={krt.find(r => r.dhatu_id === v.id)} />} />
        : <ListDetail<Dhatu400Krt> items={krt} idOf={r => r.dhatu_id} kind="krt" placeholder="Search a root or a form: गत्वा, to go…"
          search={r => [r.lemma, r.meaning_en, ...Object.values(r.krt_rupas).map(f => f.form || "")].join(" ")}
          label={r => <><span className="ks-l-sa">{S(r.lemma)}</span><span className="ks-l-en">{r.meaning_en}</span></>}
          detail={r => <div className="ks-card"><div className="ks-head"><h3>{S(r.lemma)}</h3><Speak t={r.lemma} /><span className="ks-sub">{r.gana} · {r.pada}</span></div>
            <p className="ks-main-meaning" dir="auto">{r.meaning_en}</p><Dhatu400KrtTable r={r} /><p className="ks-id">{r.dhatu_id}</p></div>} />}
    </div>
  );
};

// ── वाक्यकोशः ──────────────────────────────────────────────────
export const SentenceBook: React.FC = () => {
  const lang = useLang();
  const S = useSa();
  const [tab, setTab] = useState("s");
  return (
    <div className="ks">
      <KsTop title="वाक्यकोशः" en="Sentences, ślokas & little words" sub={`${SENTENCES.length} everyday sentences, ${ERRORS.length} mistakes and their corrections, ${PADACCHEDA.length} Rāmāyaṇa ślokas split into words, ${PADYA.verses.length} verses analysed step by step, and ${AVYAYA.length} अव्ययानि.`} />
      <Tabs tabs={[["s", `वाक्यानि · Sentences (${SENTENCES.length})`], ["e", `अशुद्धिशोधनम् · Mistakes (${ERRORS.length})`], ["p", `पदच्छेदः · Ślokas (${PADACCHEDA.length})`], ["v", `पद्यविश्लेषणम् · Verse analysis (${PADYA.verses.length})`], ["a", `अव्ययानि · Avyayas (${AVYAYA.length})`]]} on={tab} set={setTab} />
      {tab === "s" && <SambhashanamLink />}
      {tab === "p" && <PadacchedaIntro />}
      {tab === "v" && <PadyaIntro />}
      {tab === "v" && <details className="ks-method"><summary>पद्यविश्लेषणस्य क्रमः · How to analyse a verse ({PADYA.method.length} steps)</summary>
        <ol>{PADYA.method.map(m => <li key={m.n}><b>{S(m.title.replace(/\s*\(.*\)$/, ""))}</b> <span className="ks-l-en">{m.title.match(/\((.*)\)/)?.[1]}</span><p>{S(m.details)}</p></li>)}</ol></details>}
      {tab === "v"
        ? <ListDetail items={PADYA.verses} idOf={v => v.id} kind="sentence" placeholder="Search a verse or a word…"
            search={v => [v.verse, v.anvaya, v.source, padyaMeaning(v, lang), ...v.padaccheda].join(" ")}
            label={v => <><span className="ks-l-sa ks-l-sent">{S(v.verse.split(/[।|]/)[0])}</span><span className="ks-l-en">{S(v.source)}</span></>}
            detail={v => (
              <div className="ks-card">
                <div className="ks-head"><h3 className="ks-sent ks-verse">{S(v.verse.replace(/([।|]+)\s*/, "$1\n"))}</h3><Speak t={v.verse} /></div>
                <p className="ks-sub">{S(v.source)}</p>
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
                {v.notes.filter(Boolean).map((n, i) => <p key={i} className="ks-note-plain">{S(n)}</p>)}
                <p className="ks-id">{v.id}</p>
              </div>)} />
        : tab === "e"
        ? <ListDetail items={ERRORS} idOf={e => e.id} kind="sentence" placeholder="Search a sentence…"
            search={e => [e.wrong, e.right, e.id].join(" ")}
            label={e => <><span className="ks-l-sa ks-l-sent">{S(e.right)}</span></>}
            detail={e => (
              <div className="ks-card">
                <div className="ks-err"><span className="ks-err-x">✗</span><span className="ks-sent-big ks-wrong">{S(e.wrong)}</span></div>
                <div className="ks-err"><span className="ks-sent-big">{S(e.right)}</span><Speak t={e.right} />
                  <FlagButton t={{ kind: "sentence", id: e.id, field: "error-pair", value: `${e.wrong} → ${e.right}`, where: `${e.id} — error correction` }} /></div>
                {e.note && <p className="ks-note">Reviewed: {e.note}</p>}
                <p className="ks-id">{e.id}</p>
              </div>)} />
        : tab === "p"
        ? <ListDetail items={PADACCHEDA} idOf={p => p.id} kind="sentence" placeholder="Search a śloka or a word…"
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
        : tab === "s"
        ? <ListDetail items={SENTENCES} idOf={s => s.id} kind="sentence" placeholder="Search Sanskrit or English…"
            search={s => [s.sa, s.en, s.cat, s.cat_sa, s.id].join(" ")}
            label={s => <><span className="ks-l-sa ks-l-sent">{S(s.sa)}</span><span className="ks-l-en" dir="auto">{sentMeaning(s, lang)}</span></>}
            detail={s => (
              <div className="ks-card">
                <div className="ks-head"><h3 className="ks-sent">{S(s.sa)}</h3><Speak t={s.sa} />
                  <FlagButton t={{ kind: "sentence", id: s.id, field: "sa", value: s.sa, where: `${s.id} — Sanskrit` }} /></div>
                <p className="ks-main-meaning" dir="auto">{sentMeaning(s, lang)} <FlagButton t={{ kind: "sentence", id: s.id, field: "meaning:" + lang, value: sentMeaning(s, lang), where: `${s.id} — meaning (${LANGS[lang]})` }} /></p>
                <Rom t={sentRoman(s, lang)} />
                {lang !== "en" && <p className="ks-note-plain">English: {s.en}</p>}
                <div className="ks-chips"><span className="ks-tag">{S(s.cat_sa)}</span><span className="ks-tag">{s.cat}</span></div>
                {s.fixed?.length > 0 && <p className="ks-note">✎ Spelling already corrected: {s.fixed.join(" · ")}</p>}
                <p className="ks-id">{s.id}</p>
              </div>)} />
        : <ListDetail items={AVYAYA} idOf={a => a.sa} kind="avyaya" placeholder="Search: कुत्र, where, ఎక్కడ…"
            search={a => [a.sa, a.en, a.hi, a.te, a.cat].join(" ")}
            label={a => <><span className="ks-l-sa">{S(a.sa)}</span><span className="ks-l-en">{avyayaMeaning(a, lang)}</span></>}
            detail={a => (
              <div className="ks-card">
                <div className="ks-head"><h3>{S(a.sa)}</h3><Speak t={a.sa} /><span className="ks-sub">{AVYAYA_CATS[a.cat]?.[0]} · {AVYAYA_CATS[a.cat]?.[1]}
                  <FlagButton t={{ kind: "avyaya", id: a.sa, field: "cat", value: a.cat, where: `${a.sa} — category` }} /></span></div>
                <div className="ks-meanings">
                  {([["en", "English", a.en, ""], ["hi", "हिन्दी", a.hi, "draft"], ["te", "తెలుగు", a.te, "draft"]] as const).map(([k, n, val, p]) => (
                    <div key={k}><b>{n}</b><span>{val}{romanize(val, k) && <i className="ks-roman-s">{romanize(val, k)}</i>}</span>{p && <Pill k={p} />}
                      <FlagButton t={{ kind: "avyaya", id: a.sa, field: "meaning:" + k, value: val, where: `${a.sa} — meaning (${n})` }} /></div>
                  ))}
                </div>
              </div>)} />}
    </div>
  );
};

// ── दोषसूचनाः ──────────────────────────────────────────────────
export const FlagsPage: React.FC = () => {
  const { flags: all, online, note } = useFlags();
  const [showOk, setShowOk] = useState(false);
  const oks = all.filter(f => f.issue === OK);
  const flags = showOk ? oks : all.filter(f => f.issue !== OK);
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const stamp = new Date().toISOString().slice(0, 10);
  const issueName = (k: string) => k === OK ? "✓ correct" : ISSUES.find(x => x[0] === k)?.[1].split(" · ")[1] ?? k;
  return (
    <div className="ks">
      <KsTop title="दोषसूचनाः" en="Reported mistakes" sub={online ? "Flags are saved online with this page and in this browser — Claude can read them when you ask for fixes." : "Flags are saved in this browser. Export them and send the file to Claude for fixing."} />
      <div className="ks-flagbar">
        <div className="ks-tabs" style={{ margin: 0 }}>
          <button className={!showOk ? "on" : ""} onClick={() => setShowOk(false)}>⚑ Mistakes ({all.length - oks.length})</button>
          <button className={showOk ? "on" : ""} onClick={() => setShowOk(true)}>✓ Marked correct ({oks.length})</button>
        </div>
        <button className="gs-primary" disabled={!all.length} onClick={() => saveFile(`samskrita-medhaa-review-${stamp}.csv`, flagsCSV(all), "text/csv")}>⬇ Excel / CSV</button>
        <button disabled={!all.length} onClick={() => saveFile(`samskrita-medhaa-review-${stamp}.json`, JSON.stringify(all, null, 1), "application/json")}>⬇ JSON (for Claude)</button>
        <button onClick={() => file.current?.click()}>⬆ Import flags…</button>
        <input ref={file} type="file" accept=".json,application/json" hidden onChange={async e => {
          const f = e.target.files?.[0]; if (!f) return;
          try { setMsg(`Imported ${importFlags(await f.text())} new flags.`); } catch { setMsg("That file is not a flags export."); }
          e.target.value = "";
        }} />
        {(note || msg) && <span className="ks-note">{msg || note}</span>}
      </div>
      {flags.length ? (
        <div className="ks-table-wrap">
          <table className="ks-table ks-flags">
            <thead><tr><th>Where</th><th>Now</th><th>Problem</th><th>Should be</th><th>Note</th><th>Date</th><th></th></tr></thead>
            <tbody>{flags.map(f => (
              <tr key={(f._doc ?? "") + f.ts + f.field}>
                <td>{f.where}<small>{f.kind} · {f.id}</small></td>
                <td className="ks-form">{f.value}</td><td>{issueName(f.issue)}</td>
                <td className="ks-form">{f.fix}</td><td>{f.note}</td>
                <td>{new Date(f.ts).toLocaleDateString()}</td>
                <td><button className="ks-del" onClick={() => removeFlag(f)} aria-label="Remove flag">✕</button></td>
              </tr>))}</tbody>
          </table>
        </div>
      ) : <p className="ks-empty-big">No flags yet. Tap ⚑ next to any form or meaning — in the books or during a game.</p>}
    </div>
  );
};

export const KsTop: React.FC<{ title: string; en: string; sub: string }> = ({ title, en, sub }) => (
  <div className="jy-top">
    <div><h2 className="jy-title">{title} <span>· {en}</span></h2><p className="jy-sub">{sub}</p></div>
    <div className="jy-top-right"><LangPicker /></div>
  </div>
);
