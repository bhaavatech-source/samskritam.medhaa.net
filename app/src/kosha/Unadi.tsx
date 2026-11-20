// ═══════════════════════════════════════════════════════════════
//  kosha/Unadi.tsx — उणादयः in धातुकोशः → रूपनिर्माणम्:
//   • RupaHub      the switch at the top of रूपनिर्माणम् (verb forms · Uṇādi words · Uṇādi quiz)
//   • UnadiPanel   the 748 Uṇādi-sūtras (Pañcapādī) with their words, meanings and prakriyā
//   • UnadiQuiz    a four-level quiz: the teacher's exam questions plus questions made from the data
//  Data: app/src/data/unadi.json (data-source/23-unadi/tools/build_unadi_app.py), loaded on first open.
//  Other pages open these views with openUnadi("words" | "quiz").
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import { loadUnadi, shuffle, pick, type Unadi, type UnadiSutra, type UnadiRupa, type UnadiStep } from "../data";
import { FlagButton } from "../FlagUI";
import { useLang } from "../settings";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import { ListDetail } from "./Kosha";
import { RupaNirmana, deva } from "./RupaNirmana";
import "./kosha.css";

const Say: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;
const mean = (m: Record<string, string>, lang: string) => m[lang] || m.en || "";
const GEN: Record<string, string> = { "पुं": "पुंलिङ्गम्", "स्त्री": "स्त्रीलिङ्गम्", "नपुं": "नपुंसकलिङ्गम्", "अव्य": "अव्ययम्" };
const PADA_DIGIT = ["१", "२", "३", "४", "५"];

// ── links from other pages: remember which view to open, then go to the verb book ──
const OPEN_KEY = "medhaa.rupa.open";
export function openUnadi(view: "words" | "quiz") {
  try { sessionStorage.setItem(OPEN_KEY, view); } catch { /* storage unavailable */ }
  location.hash = "verbs";
}
/** read (and clear) a pending request to open the Uṇādi views */
export function takeUnadiRequest(): "words" | "quiz" | null {
  try { const v = sessionStorage.getItem(OPEN_KEY); sessionStorage.removeItem(OPEN_KEY); return v === "words" || v === "quiz" ? v : null; }
  catch { return null; }
}

// ── the switch at the top of रूपनिर्माणम् ──
export const RupaHub: React.FC<{ start?: "forms" | "words" | "quiz" }> = ({ start = "forms" }) => {
  const [view, setView] = useState(start);
  return (
    <>
      <div className="ks-chips gr-filter">
        <button className={view === "forms" ? "on" : ""} onClick={() => setView("forms")}>धातुरूपाणि · Verb forms</button>
        <button className={view === "words" ? "on" : ""} onClick={() => setView("words")}>उणादयः · Uṇādi words (748 sūtras)</button>
        <button className={view === "quiz" ? "on" : ""} onClick={() => setView("quiz")}>उणादिपरीक्षा · Uṇādi quiz</button>
      </div>
      {view === "forms" ? <RupaNirmana /> : view === "words" ? <UnadiPanel /> : <UnadiQuiz />}
    </>
  );
};

function useUnadi(): [Unadi | null, string] {
  const [data, setData] = useState<Unadi | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { loadUnadi().then(setData, e => setErr(String(e?.message || e))); }, []);
  return [data, err];
}
const Loading: React.FC<{ err: string }> = ({ err }) =>
  <p className="ks-note-plain" role={err ? "alert" : "status"}>{err || "उणादिसूत्राणि आनीयन्ते… · Loading the Uṇādi-sūtras…"}</p>;

// ── prakriyā: technical terms, class-note text, step-by-step derivation ──
/** words in the class notes that name a technique → glossary key */
const NOTE_TERMS: [RegExp, string][] = [
  [/वि\s*\.?\s*सु\s*\.?\s*का\s*\.?\s*कृ\.?/, "visukakr"], [/सम्प्रसारण|संप्रसारण/, "samprasarana"], [/रपरत्व/, "rapara"], [/टिलोप/, "ti"],
  [/णत्व/, "natva"], [/षत्व/, "satva"], [/कुत्व/, "kutva"], [/जश्त्व/, "jastva"], [/चर्त्व/, "cartva"], [/अनुस्वार|परसवर्ण/, "anusvara"],
  [/अयादेश|आयादेश|अवादेश|आवादेश/, "ayadi"], [/यणि|यणादेश/, "yan"], [/युगागम|युकि/, "yuk"], [/तुगागम|तुडागम|तुकि/, "tuk"], [/नुमि|नुमागम/, "num"],
  [/द्वित्व|अभ्यास/, "abhyasa"], [/कित्त्वा|कित्वा|ङित्त्वा|ङित्वा/, "kit"], [/णित्त्वा|णित्वा|ञित्त्वा/, "vrddhi"], [/उपधा/, "upadha"],
  [/निपातन/, "nipatana"], [/बाहुलक/, "bahula"], [/अनुबन्धलोप|इत्संज्ञ/, "it"], [/टापि|ङीषि|ङीपि|टाप्|ङीष्/, "stri"],
  [/गुण/, "guna"], [/वृद्धि|वृद्धौ/, "vrddhi"], [/आगम/, "agama"], [/आदेश/, "adesha"], [/नलोप/, "nalopa"], [/लोप/, "lopa"], [/दीर्घ/, "dirgha"],
];
const TermDef: React.FC<{ d: Unadi; k: string; onClose: () => void }> = ({ d, k, onClose }) => {
  const S = useSa(); const t = d.terms[k]; if (!t) return null;
  return (
    <div className="un-term-def">
      <b className="ks-l-sa">{S(t[0])}</b> · {t[1]} <button className="un-link" onClick={onClose} aria-label="Close">✕</button>
      {t[2] && <div className="ks-l-sa un-term-sutra">{S(t[2])}</div>}
      <div>{t[3]}</div>
      {t[4] && <div className="ks-l-sa un-term-ex">{S(t[4])}</div>}
    </div>);
};
/** class-note text with each technical word tappable */
const NoteText: React.FC<{ d: Unadi; text: string }> = ({ d, text }) => {
  const S = useSa(); const [open, setOpen] = useState<string | null>(null);
  const parts: React.ReactNode[] = []; let rest = text, i = 0;
  while (rest) {
    let best: [number, number, string] | null = null;
    for (const [re, k] of NOTE_TERMS) { const m = re.exec(rest); if (m && (!best || m.index < best[0])) best = [m.index, m[0].length, k]; }
    if (!best) { parts.push(S(rest)); break; }
    const [at, len, k] = best;
    // extend to the whole word
    let end = at + len; while (end < rest.length && !/[\s,।]/.test(rest[end])) end++;
    let st = at; while (st > 0 && !/[\s,।]/.test(rest[st - 1])) st--;
    if (st > 0) parts.push(S(rest.slice(0, st)));
    const w = rest.slice(st, end);
    parts.push(<button key={i++} className="un-term" onClick={() => setOpen(open === k ? null : k)} title={d.terms[k]?.[1]}>{S(w)}</button>);
    rest = rest.slice(end);
  }
  return <><p className="un-prakriya ks-l-sa">{parts}</p>{open && <TermDef d={d} k={open} onClose={() => setOpen(null)} />}</>;
};
/** "kf *uR" → कृ + <b>उण्</b> */
const Form: React.FC<{ t: string }> = ({ t }) => {
  const S = useSa();
  const terms = t.split(" ").filter(x => x && x !== "*");
  return <span className="ks-l-sa un-form">{terms.map((x, i) => <React.Fragment key={i}>{i > 0 && <span className="un-plus"> + </span>}
    {x.startsWith("*") ? <b>{S(deva(x.slice(1)))}</b> : S(deva(x))}</React.Fragment>)}</span>;
};
const StepRows: React.FC<{ d: Unadi; steps: UnadiStep[]; all: boolean; start: number; onTerm: (k: string) => void }> = ({ d, steps, all, start, onTerm }) => {
  const S = useSa();
  return <>{steps.map(([r, t, sup], i) => {
    const [num, txt, term] = d.rules[r] ?? [r, "", ""];
    const tm = term ? d.terms[term] : null;
    return (
      <tr key={i} className={r.startsWith("U:") ? "un-step-u" : ""}>
        <td className="un-step-n">{start + i}</td>
        <td><Form t={t} /></td>
        <td><span className="un-step-sutra ks-l-sa">{S(txt)}</span> <span className="ks-l-en">({S(num)})</span>
          {all && sup.length > 0 && <div className="un-sup">{sup.map(x => { const [n2, t2] = d.rules[x] ?? [x, ""]; return <span key={x}>{S(t2)} ({S(n2)})</span>; })}</div>}</td>
        <td>{tm && <button className="un-term" onClick={() => onTerm(term)}>{S(tm[0])}</button>}</td>
      </tr>);
  })}</>;
};
const Prakriya: React.FC<{ d: Unadi; r: UnadiRupa; sutra: UnadiSutra }> = ({ d, r, sutra }) => {
  const S = useSa();
  const [all, setAll] = useState(false); const [term, setTerm] = useState<string | null>(null);
  const v = r[5];
  return (
    <div className="un-prak-box">
      {r[4] && <><h5>कक्षाटिप्पणी · From the class notes</h5><NoteText d={d} text={r[4]} /></>}
      {v && <>
        <h5>सूत्रक्रमेण प्रक्रिया · Step by step, with the sūtra for each step
          <label className="un-all"><input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} /> सर्वाणि सूत्राणि · show the naming rules too</label></h5>
        <div className="ks-table-wrap"><table className="ks-karaka un-steps"><tbody>
          <tr className="un-step-head"><td colSpan={4}>प्रकृतिः + प्रत्ययः → {S(deva(v.stem))} <span className="ks-l-en">root and suffix to stem</span></td></tr>
          <StepRows d={d} steps={v.s} all={all} start={1} onTerm={setTerm} />
          <tr className="un-step-head"><td colSpan={4}>{S("वि.सु.का.कृ.")} → {S(r[0])} <span className="ks-l-en">case ending and its operations</span>
            <button className="un-term" onClick={() => setTerm("visukakr")}>?</button></td></tr>
          <StepRows d={d} steps={v.n} all={all} start={v.s.length + 1} onTerm={setTerm} />
        </tbody></table></div>
        {term && <TermDef d={d} k={term} onClose={() => setTerm(null)} />}
      </>}
      {!v && !r[4] && r[6] && <><h5>{r[6].includes("→ … →") ? "सङ्क्षिप्ता प्रक्रिया · Outline" : "प्रक्रिया · How the word is made"}</h5><NoteText d={d} text={r[6]} /></>}
      {!v && <p className="ks-l-en un-src">{S(sutra[1])} (उणादि {S(sutra[0])})</p>}
    </div>);
};
const Glossary: React.FC<{ d: Unadi }> = ({ d }) => {
  const S = useSa();
  return (
    <details className="ks-method">
      <summary>पारिभाषिकशब्दाः · Terms and techniques used in the prakriyā ({Object.keys(d.terms).length})</summary>
      <div className="ks-table-wrap"><table className="ks-karaka un-gloss"><tbody>{Object.entries(d.terms).map(([k, t]) => (
        <tr key={k}><td className="ks-l-sa"><b>{S(t[0])}</b><br /><span className="ks-l-en">{t[1]}</span></td>
          <td>{t[3]}{t[2] && <div className="ks-l-sa un-term-sutra">{S(t[2])}</div>}{t[4] && <div className="ks-l-sa un-term-ex">{S(t[4])}</div>}</td></tr>))}</tbody></table></div>
    </details>);
};

// ── the sūtras ──
const SutraWords: React.FC<{ d: Unadi; x: UnadiSutra; lang: string }> = ({ d, x, lang }) => {
  const S = useSa();
  const [open, setOpen] = useState<string | null>(x[4].length === 1 ? x[4][0][0] : null);
  return (
    <div className="ks-table-wrap"><table className="ks-table ks-krt un-words"><tbody>{x[4].map(r => (
      <React.Fragment key={r[0]}>
        <tr>
          <td className="ks-form">{S(r[0])} <Say t={r[0]} /></td>
          <td className="ks-l-sa" data-label="धातुः · Root">{r[1] ? S(r[1]) : ""}</td>
          <td className="ks-l-en" data-label="लिङ्गम् · Gender">{r[2] ? S(r[2].split(" / ").map(g => GEN[g] ?? g).join(" / ")) : ""}</td>
          <td dir="auto" data-label="अर्थः · Meaning">{mean(r[3], lang)}{lang !== "sa" && r[3].sa ? <span className="ks-artha"> ({S(r[3].sa)})</span> : null}</td>
          <td><button className={`un-pbtn ${open === r[0] ? "on" : ""}`} onClick={() => setOpen(open === r[0] ? null : r[0])}>प्रक्रिया {open === r[0] ? "▴" : "▾"}</button></td>
          <td><FlagButton t={{ kind: "grammar", id: `unadi:${x[0]}`, field: `word:${r[0]}`, value: `${r[0]} — ${mean(r[3], "en")}`, where: `उणादि ${x[0]}: ${r[0]}` }} /></td>
        </tr>
        {open === r[0] && <tr className="un-prak-row"><td colSpan={6}><Prakriya d={d} r={r} sutra={x} /></td></tr>}
      </React.Fragment>))}</tbody></table></div>);
};
export const UnadiPanel: React.FC = () => {
  const S = useSa(); const lang = useLang();
  const [data, err] = useUnadi();
  const [pada, setPada] = useState("all");
  if (!data) return <Loading err={err} />;
  const items = data.s.filter(x => pada === "all" || x[0].startsWith(PADA_DIGIT[+pada] + "."));
  return (
    <>
      <details className="ks-method">
        <summary>उणादयः · The Uṇādi suffixes (748 sūtras)</summary>
        <ul>{data.intro.map((x, i) => <li key={i}>{S(x)}</li>)}</ul>
        <h4>सङ्केतः · Abbreviation used in the prakriyā</h4>
        <div className="ks-table-wrap"><table className="ks-karaka un-abbr"><tbody>{data.abbr.map(([a, sa, en]) => (
          <tr key={a}><td className="ks-l-sa"><b>{S(a)}</b></td><td className="ks-l-sa">{S(sa)}</td><td>{en}</td></tr>))}</tbody></table></div>
      </details>
      <Glossary d={data} />
      <div className="ks-chips gr-filter">
        <button className={pada === "all" ? "on" : ""} onClick={() => setPada("all")}>सर्वे · All ({data.s.length})</button>
        {data.padas.map(([name, n], i) => <button key={i} className={pada === String(i) ? "on" : ""} onClick={() => setPada(String(i))}>{S(name)} <small>({n})</small></button>)}
      </div>
      <ListDetail<UnadiSutra> key={pada} items={items} idOf={x => x[0]} kind="grammar" placeholder="Search a sūtra, suffix or word: उण्, इन्दुः, moon…"
        search={x => [x[0], x[1], x[2], ...x[4].flatMap(r => [r[0], r[1], ...Object.values(r[3])])].join(" ")}
        label={x => <><span className="ks-l-sa">{S(x[0])} {S(x[1])}</span><span className="ks-l-en">{x[2] ? S(x[2]) : ""}{x[4].length ? ` · ${x[4].slice(0, 3).map(r => S(r[0])).join(", ")}` : ""}</span></>}
        detail={x => (
          <div className="ks-card">
            <div className="ks-head"><h3>{S(x[1])}</h3><Say t={x[1]} /><span className="ks-sub">उणादि {S(x[0])}</span></div>
            {x[2] && <div className="ks-table-wrap"><table className="ks-karaka"><tbody>
              <tr><td>{S("प्रत्ययः")} <span className="ks-l-en">suffix</span></td><td className="ks-l-sa">{S(x[2])}</td></tr>
            </tbody></table></div>}
            {x[4].length > 0 && <><h4>रूपाणि · Words formed ({x[4].length}) <span className="ks-l-en">— tap प्रक्रिया to see how each word is made</span></h4>
              <SutraWords d={data} x={x} lang={lang} /></>}
            {x[3] && <details className="un-allnotes"><summary>कक्षाटिप्पणी (सम्पूर्णा) · All class notes for this sūtra</summary><NoteText d={data} text={x[3]} /></details>}
            <FlagButton t={{ kind: "grammar", id: `unadi:${x[0]}`, field: "sutra", value: `${x[0]} ${x[1]} | ${x[2]}`, where: `उणादि ${x[0]}` }} label="Report" />
          </div>)} />
    </>
  );
};

// ── the quiz ──
type Q = { id: string; prompt: string; ask: string; clue?: string; options: string[]; answer: string; also: string; where: string };
const ROUNDS = 10;
/** the right answer plus up to three different wrong ones */
function opts(answer: string, pool: string[]): string[] {
  const out = [answer]; const seen = new Set(out);
  for (const p of shuffle(pool)) { if (out.length >= 4) break; if (p && !seen.has(p)) { seen.add(p); out.push(p); } }
  return shuffle(out);
}
const MADE: Record<number, string> = {
  1: "Words and their meanings",
  2: "Which suffix makes the word",
  3: "Which root the word comes from",
  4: "Which sūtra forms the word",
};
function makeQuiz(d: Unadi, level: number, lang: string): Q[] {
  // every single word with its sūtra
  const words = d.s.flatMap(s => s[4].filter(r => !r[0].includes(" ") && !r[0].includes("/")).map(r => ({ s, r })));
  const exam: Q[] = shuffle(d.exam.filter(x => x.lv === level)).slice(0, 6).map(x => ({
    id: x.id, prompt: x.w, ask: x.q, clue: x.qe, options: shuffle([...x.o]), answer: x.a, also: `${x.s} — ${x.x}`, where: `उणादिपरीक्षा ${x.id}`,
  }));
  const made = (): Q | null => {
    const { s, r } = pick(words);
    const tail = `${r[0]} — उणादि ${s[0]} ${s[1]}${s[2] ? ` (${s[2]})` : ""}`;
    if (level === 1) {
      const m = mean(r[3], lang); if (!m) return null;
      const pool = words.filter(w => w.r[0] !== r[0]).map(w => mean(w.r[3], lang));
      return { id: `m:${s[0]}:${r[0]}`, prompt: r[0], ask: "अस्य शब्दस्य अर्थः कः? · What does this word mean?", options: opts(m, pool), answer: m, also: tail, where: `उणादि ${s[0]}: ${r[0]}` };
    }
    if (level === 2) {
      if (!s[2] || s[2].includes("/")) return null;
      const pool = d.s.map(x => x[2]).filter(p => p && !p.includes("/") && p !== s[2] && !words.some(w => w.r[0] === r[0] && w.s[2] === p));
      return { id: `p:${s[0]}:${r[0]}`, prompt: r[0], ask: "कः उणादिप्रत्ययः? · Which Uṇādi suffix makes this word?", options: opts(s[2], pool), answer: s[2], also: tail, where: `उणादि ${s[0]}: ${r[0]}` };
    }
    if (level === 3) {
      if (!r[1]) return null;
      const pool = words.map(w => w.r[1]).filter(x => x && x !== r[1]);
      return { id: `d:${s[0]}:${r[0]}`, prompt: r[0], ask: "कः धातुः? · Which root does this word come from?", options: opts(r[1], pool), answer: r[1], also: tail, where: `उणादि ${s[0]}: ${r[0]}` };
    }
    const sameP = d.s.filter(x => x[0].split(".")[0] === s[0].split(".")[0] && x[1] !== s[1]).map(x => x[1]);
    return { id: `s:${s[0]}:${r[0]}`, prompt: r[0], ask: "केन सूत्रेण सिद्ध्यति? · Which sūtra forms this word?", options: opts(s[1], sameP), answer: s[1], also: tail, where: `उणादि ${s[0]}: ${r[0]}` };
  };
  const out = [...exam]; const seen = new Set(out.map(q => q.id)); let guard = 0;
  while (out.length < ROUNDS && guard++ < 400) { const q = made(); if (q && !seen.has(q.id) && q.options.length > 1) { seen.add(q.id); out.push(q); } }
  return shuffle(out);
}

export const UnadiQuiz: React.FC = () => {
  const S = useSa(); const lang = useLang();
  const [data, err] = useUnadi();
  const [level, setLevel] = useState<number | null>(null);
  const [round, setRound] = useState(0);   // bump to make a fresh set
  const qs = useMemo(() => (data && level ? makeQuiz(data, level, lang) : []), [data, level, lang, round]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  if (!data) return <Loading err={err} />;
  const restart = (lv: number | null) => { setLevel(lv); setRound(r => r + 1); setI(0); setChosen(null); setScore(0); };

  if (level === null) return (
    <div className="un-levels">
      <p className="ks-note-plain">स्तरं चिनुत · Choose a level. Each round has {ROUNDS} questions: questions from the Uṇādi exam for that level, and new questions made from the 748 sūtras.</p>
      {data.levels.map(([id, sa, en, focus]) => (
        <button key={id} className="un-level" onClick={() => restart(id)}>
          <b className="ks-l-sa">{S(sa)}</b><span>{en}</span><small>{focus} · {data.exam.filter(x => x.lv === id).length} exam questions + {MADE[id].toLowerCase()}</small>
        </button>))}
    </div>
  );
  const lv = data.levels.find(l => l[0] === level)!;
  if (i >= qs.length) return (
    <div className="ks-card un-done">
      <h3>{S(lv[1])}</h3>
      <p className="un-score">{score} / {qs.length}</p>
      <div className="ks-chips"><button className="on" onClick={() => restart(level)}>पुनः · Play again</button><button onClick={() => restart(null)}>स्तराः · Choose a level</button></div>
    </div>
  );
  const q = qs[i];
  const answer = (o: string) => { if (chosen !== null) return; setChosen(o); if (o === q.answer) setScore(n => n + 1); };
  return (
    <div className="ks-card un-quiz">
      <div className="un-top"><span className="ks-sub">{S(lv[1])}</span><span>{i + 1} / {qs.length} · Score: {score}</span>
        <button className="un-link" onClick={() => restart(null)}>स्तराः · Levels</button></div>
      <div className="ks-head"><h3>{S(q.prompt)}</h3><Say t={q.prompt} /></div>
      <p className="un-ask ks-l-sa">{S(q.ask)}</p>
      {q.clue && <p className="ks-l-en">{q.clue}</p>}
      <div className="un-opts">{q.options.map(o => (
        <button key={o} onClick={() => answer(o)} disabled={chosen !== null}
          className={`un-opt ks-l-sa ${chosen === null ? "" : o === q.answer ? "ok" : o === chosen ? "bad" : "dim"}`}>{S(o)}</button>))}</div>
      {chosen !== null && <>
        <p className={`un-verdict ${chosen === q.answer ? "ok" : "bad"}`}>{chosen === q.answer ? "साधु! · Correct" : <>उत्तरम् · Answer: <span className="ks-l-sa">{S(q.answer)}</span></>}</p>
        <p className="un-also ks-l-sa">{S(q.also)}</p>
        <div className="un-next">
          <FlagButton t={{ kind: "grammar", id: `unadi-quiz:${q.id}`, field: "question", value: `${q.prompt} | ${q.ask} → ${q.answer}`, where: q.where }} label="Report" />
          <button className="on" onClick={() => { setI(i + 1); setChosen(null); }}>{i + 1 < qs.length ? "अग्रे · Next" : "फलम् · Result"}</button>
        </div>
      </>}
    </div>
  );
};
