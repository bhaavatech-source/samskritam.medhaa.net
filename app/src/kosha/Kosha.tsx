// ═══════════════════════════════════════════════════════════════
//  kosha/Kosha.tsx — the reference books behind the game
//  शब्दकोशः (words + declensions), धातुकोशः (verbs + kṛdantas),
//  वाक्यकोशः (sentences + avyayas), दोषसूचनाः (all flags).
//  Every form and meaning has a ⚑ to report a mistake.
// ═══════════════════════════════════════════════════════════════
import React, { useMemo, useRef, useState } from "react";
import {
  WORDS, VERBS, KRT, SENTENCES, AVYAYA, AVYAYA_CATS, ERRORS, PADACCHEDA, PADYA, padyaMeaning, LANGS, VIBHAKTI, VIBHAKTI_EN, VACANA, PURUSHA, LAKARA, LAKARA_ORDER, LINGA,
  prayogaLabel, wordMeaning, verbMeaning, avyayaMeaning, sentMeaning, sentRoman, padyaRoman, type Word, type Verb, type KrtRoot,
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
import { nounGloss, verbGloss, krtGloss, caseRole } from "../i18n/forms";
import { flagsCSV, importFlags, ISSUES, OK, removeFlag, saveFile, useFlags, type FlagKind } from "../flags";
import { useLang, useReadings, setReadings } from "../settings";
import { speak } from "../speech";
import { useSa } from "../i18n/script";
import "./kosha.css";

// ── shared list + detail layout ────────────────────────────────
export function ListDetail<T>({ items, idOf, kind, label, search, detail, placeholder }: {
  items: T[]; idOf: (x: T) => string; kind: FlagKind; label: (x: T) => React.ReactNode;
  search: (x: T) => string; detail: (x: T) => React.ReactNode; placeholder: string;
}) {
  const { flags } = useFlags();
  const [q, setQ] = useState("");
  const [only, setOnly] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const flaggedIds = useMemo(() => new Set(flags.filter(f => f.kind === kind).map(f => f.id)), [flags, kind]);
  const list = items.filter(x => (!q || search(x).toLowerCase().includes(q.trim().toLowerCase())) && (!only || flaggedIds.has(idOf(x))));
  const cur = items.find(x => idOf(x) === sel) ?? list[0] ?? items[0];
  return (
    <>
      <div className="ks-tools">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} aria-label="Search" />
        <label className="ks-only"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> ⚑ only flagged</label>
        <span className="ks-count">{list.length} / {items.length}</span>
      </div>
      <div className="ks-body">
        <div className="ks-list" role="listbox">
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
        <span className="ks-sub">{S(w.w)} · {w.iast} · {LINGA[w.g]?.[0] ?? ""} {LINGA[w.g] ? `(${LINGA[w.g][1]})` : ""} · {w.cat}</span>
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
      <p className="ks-note">🌐 The line under each form is its meaning in <b>{LANGS[lang]}</b>{lang === "en" ? "" : ", built from that language's case pattern"}. ✓ = correct, ⚑ = wrong. If a pattern is wrong, it is wrong for every word, so one ⚑ with the right wording is enough.</p>
      {w.ch > 0 && <p className="ks-note">🔁 {w.ch} forms in this table were regenerated with the Pāṇinian engine and differ from the old table — please check them first.</p>}
      <h4>सर्वभाषासु अर्थाः · Meaning in every language <small className="rv-only">(label = source; <b>draft</b> needs the most checking)</small></h4>
      <div className="ks-meanings">
        {langs.map(k => (
          <div key={k} className={k === lang ? "on" : ""}>
            <b>{LANGS[k]}</b><span>{wordMeaning(w, k)}</span><Pill k={w.m[k][1]} />
            <Review t={{ kind: "word", id: w.id, field: "meaning:" + k, value: w.m[k][0], where: `${w.w} — meaning (${LANGS[k]})` }} />
          </div>
        ))}
      </div>
      {w.notes?.length > 0 && <p className="ks-note">{w.notes.join(" · ")}</p>}
      <p className="ks-id">{w.id}</p>
    </div>
  );
};
const GENDERS: [string, string, string, string][] = [
  ["all", "सर्वे", "sarve", "all"],
  ["m", "पुंलिङ्गशब्दाः", "puṃliṅgaśabdāḥ", "masculine"],
  ["f", "स्त्रीलिङ्गशब्दाः", "strīliṅgaśabdāḥ", "feminine"],
  ["n", "नपुंसकलिङ्गशब्दाः", "napuṃsakaliṅgaśabdāḥ", "neuter"],
  ["c", "सर्वलिङ्गशब्दाः", "sarvaliṅgaśabdāḥ", "pronouns & numbers"],
];
const ENDS: [string, string, string][] = [["all", "सर्वे", "all"], ["ac", "अजन्ताः", "vowel-ending"], ["hal", "हलन्ताः", "consonant-ending"]];
export const WordBook: React.FC = () => {
  const lang = useLang();
  const S = useSa();
  const [g, setG] = useState("all");
  const [end, setEnd] = useState("all");
  const isHal = (w: Word) => w.w.endsWith("्");
  const items = WORDS.filter(w => (g === "all" || w.g === g) && (end === "all" || (end === "hal") === isHal(w)));
  const count = (gg: string, ee: string) => WORDS.filter(w => (gg === "all" || w.g === gg) && (ee === "all" || (ee === "hal") === isHal(w))).length;
  return (
    <div className="ks">
      <KsTop title="शब्दकोशः" en="Word book" sub={`${WORDS.length} words with all their forms and meanings in ${Object.keys(LANGS).length - 1} languages.`} />
      <div className="ks-chips ks-gender-filters gr-filter">{GENDERS.map(([k, sa, iast, en]) => <button key={k} className={`ks-tag ${g === k ? "on" : ""}`} onClick={() => setG(k)} title={en}><span>{lang === "sa" || lang === "hi" ? iast : S(sa)}</span><small>({count(k, end)})</small></button>)}</div>
      <div className="ks-chips gr-filter">{ENDS.map(([k, sa, en]) => <button key={k} className={`ks-tag ${end === k ? "on" : ""}`} onClick={() => setEnd(k)} title={en}>{S(sa)} <small>({count(g, k)})</small></button>)}</div>
      <ListDetail key={g + end} items={items} idOf={w => w.id} kind="word" placeholder="Search: राम, rāma, boy, బాలుడు…"
        search={w => [w.w, w.iast, w.d[0]?.[0], ...Object.values(w.m ?? {}).map(m => m[0])].join(" ")}
        label={w => <><span className="ks-l-sa">{S(w.d[0]?.[0] || w.w)}</span><span className="ks-l-en">{wordMeaning(w, lang).split(";")[0]}</span>{w.ch > 0 && <span className="ks-l-ch" title="regenerated forms">🔁{w.ch}</span>}</>}
        detail={w => <WordDetail w={w} />} />
    </div>
  );
};

// ── धातुकोशः ───────────────────────────────────────────────────
const VerbDetail: React.FC<{ v: Verb }> = ({ v }) => {
  const lang = useLang();
  const S = useSa();
  const keys = (["P", "A", "K", "B"] as const).filter(k => v[k]);
  const [key, setKey] = useState<(typeof keys)[number]>(keys[0]);
  const k = keys.includes(key) ? key : keys[0];
  const grid = v[k]!;
  const [lk, setLk] = useState("lat");
  const l = grid[lk] ? lk : LAKARA_ORDER.find(x => grid[x])!;
  const krt = KRT.find(r => r.w === v.w);
  return (
    <div className="ks-card">
      <div className="ks-head">
        <h3>{S(v.w)}</h3><Speak t={v.w} />
        <span className="ks-sub">{v.iast} · {v.gana} · {v.pada} · {v.trans}</span>
      </div>
      <p className="ks-main-meaning" dir="auto">{verbMeaning(v, lang)} <span className="ks-artha">({v.artha})</span>
        <FlagButton t={{ kind: "verb", id: v.id, field: "meaning", value: [v.m.en, v.m.te, v.m.hi].filter(Boolean).join(" | "), where: `${v.w} — meaning` }} /></p>
      <Rom t={romanize(verbMeaning(v, lang), lang)} />
      <h4>सर्वभाषासु अर्थाः · Meaning in every language</h4>
      <div className="ks-meanings">
        {Object.keys(LANGS).filter(x => (v.m as Record<string, string>)[x]).map(x => (
          <div key={x} className={x === lang ? "on" : ""}><b>{LANGS[x]}</b><span>{(v.m as Record<string, string>)[x]}{romanize((v.m as Record<string, string>)[x], x) && <i className="ks-roman-s">{romanize((v.m as Record<string, string>)[x], x)}</i>}</span><Pill k={v.mc?.[x] ?? "direct"} />
            <Review t={{ kind: "verb", id: v.id, field: "meaning:" + x, value: (v.m as Record<string, string>)[x], where: `${v.w} — meaning (${LANGS[x]})` }} /></div>
        ))}
      </div>
      <h4>रूपाणि · Forms</h4>
      <div className="ks-chips">{keys.map(x => <button key={x} className={x === k ? "on" : ""} onClick={() => setKey(x)}>{prayogaLabel(v, x)[0]} <small>{prayogaLabel(v, x)[1]}</small></button>)}</div>
      <div className="ks-chips ks-chips-sm">{LAKARA_ORDER.filter(x => grid[x]).map(x => <button key={x} className={x === l ? "on" : ""} onClick={() => setLk(x)}>{LAKARA[x][0]} <small>{LAKARA[x][1]}</small></button>)}</div>
      <div className="ks-table-wrap">
        <table className="ks-table">
          <thead><tr><th>{S("पुरुषः")}</th>{VACANA.map(n => <th key={n}>{S(n)}</th>)}</tr></thead>
          <tbody>
            {PURUSHA.map((p, pi) => (
              <tr key={p}><th>{S(p)}</th>
                {[0, 1, 2].map(n => {
                  const c = grid[l]?.[pi]?.[n];
                  if (!c) return <td key={n} className="ks-empty">—</td>;
                  return (
                    <td key={n} className="ks-form">{S(c[0])}{c[1] && <span className="ks-alt"> / {S(c[1])}</span>}
                      <FlagButton t={{ kind: "verb", id: v.id, field: `${k}:${l}:${pi},${n}`, value: c[0], where: `${v.w} — ${prayogaLabel(v, k)[0]} ${LAKARA[l][0]} ${p} ${VACANA[n]}` }} />
                      {(() => { const gl = verbGloss(v, k, l, pi, n, lang, c[2]); return (
                        <span className="ks-gloss" dir="auto">{gl}<RomS t={gl} l={lang} /><Review t={{ kind: "verb", id: v.id, field: `gloss:${lang}:${k}:${l}:${pi},${n}`, value: gl, where: `${v.w} — ${LAKARA[l][0]} ${p} ${VACANA[n]} — meaning (${LANGS[lang]})` }} /></span>); })()}
                      {c[3] > 0 && <span className="ks-pill ks-pill-book" title="Checked against Dhāturūpa Mañjarī">पृ. {c[3]}</span>}
                      {c[4] > 0 && <span className="ks-pill ks-pill-draft">≠ book</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ks-note">पृ. N = page of Dhāturūpa Mañjarī where the form was checked. “/” shows an accepted alternative.</p>
      {krt && <KrtTable r={krt} verb={verbMeaning(v, lang)} />}
      <p className="ks-id">{v.id}</p>
    </div>
  );
};
const KrtTable: React.FC<{ r: KrtRoot; verb?: string }> = ({ r, verb }) => {
  const lang = useLang();
  const S = useSa();
  return (
  <>
    <h4>कृदन्तानि · Participles &amp; verbal nouns</h4>
    <div className="ks-table-wrap">
      <table className="ks-table ks-krt">
        <thead><tr><th>प्रत्ययः</th><th>रूपम्</th><th>अर्थः · {LANGS[lang]}</th><th className="rv-only">source</th></tr></thead>
        <tbody>{Object.entries(r.f).map(([k, [form, gloss, att, tier]]) => (
          <tr key={k}><th>{k}</th>
            <td className="ks-form">{S(form)}<FlagButton t={{ kind: "krt", id: r.id, field: k, value: form, where: `${r.w} + ${k}` }} /></td>
            <td>{(() => { const gl = krtGloss(k, lang, gloss, verb ?? r.en, r.w); return <>{gl}<RomS t={gl} l={lang} /><Review t={{ kind: "krt", id: r.id, field: `gloss:${lang}:${k}`, value: gl, where: `${r.w} + ${k} — meaning (${LANGS[lang]})` }} /></>; })()}</td>
            <td className="rv-only">{att ? <span className="ks-pill ks-pill-direct">in dictionary</span> : <span className="ks-pill ks-pill-derived">grammar only</span>} <span className="ks-pill">{tier}</span></td>
          </tr>))}</tbody>
      </table>
    </div>
    {lang !== "en" && !verb && <p className="ks-note">This root's meaning is in English only for now; the suffix meaning is in {LANGS[lang]}.</p>}
    {r.notes?.length > 0 && <p className="ks-note">{r.notes.join(" · ")}</p>}
  </>
  );
};
type Root = { kind: "verb"; v: Verb } | { kind: "krt"; r: KrtRoot };
export const VerbBook: React.FC = () => {
  const lang = useLang();
  const S = useSa();
  const [tab, setTab] = useState("verbs");
  const others = useMemo(() => KRT.filter(r => !VERBS.some(v => v.w === r.w)), []);
  return (
    <div className="ks">
      <KsTop title="धातुकोशः" en="Verb book" sub={`${VERBS.length} roots with all ten lakāras (active, passive, impersonal) and ${KRT.length} roots with their kṛdantas.`} />
      <Tabs tabs={[["verbs", `धातुरूपाणि · Verb forms (${VERBS.length})`], ["krt", `कृदन्तानि · More roots (${others.length})`]]} on={tab} set={setTab} />
      {tab === "verbs"
        ? <ListDetail<Root> items={VERBS.map(v => ({ kind: "verb", v }))} idOf={x => (x.kind === "verb" ? x.v.id : x.r.id)} kind="verb" placeholder="Search: गम्, gam, to go…"
            search={x => x.kind === "verb" ? [x.v.w, x.v.iast, x.v.m.en, x.v.m.te, x.v.m.hi, x.v.artha].join(" ") : ""}
            label={x => x.kind === "verb" ? <><span className="ks-l-sa">{S(x.v.w)}</span><span className="ks-l-en">{verbMeaning(x.v, lang)}</span></> : null}
            detail={x => x.kind === "verb" ? <VerbDetail key={x.v.id} v={x.v} /> : null} />
        : <ListDetail<KrtRoot> items={others} idOf={r => r.id} kind="krt" placeholder="Search a root or a form: गत्वा, to go…"
            search={r => [r.w, r.en, ...Object.values(r.f).map(f => f[0])].join(" ")}
            label={r => <><span className="ks-l-sa">{S(r.w)}</span><span className="ks-l-en">{r.en}</span></>}
            detail={r => <div className="ks-card"><div className="ks-head"><h3>{S(r.w)}</h3><Speak t={r.w} /><span className="ks-sub">{r.gana} · {r.pada}</span></div>
              <p className="ks-main-meaning" dir="auto">{r.en}</p><KrtTable r={r} /><p className="ks-id">{r.id}</p></div>} />}
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
                <div className="ks-err"><span className="ks-err-ok">✓</span><span className="ks-sent-big">{S(e.right)}</span><Speak t={e.right} />
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
