// ═══════════════════════════════════════════════════════════════
//  speak/Sambhashanam.tsx — सम्भाषणम्: a graded course in spoken Sanskrit.
//  Course page: a "continue" card, three level tabs, lessons grouped in units of five.
//  Lesson page, in three steps: पठत (key points, table, words) → शृणुत (sentences,
//  meaning hidden until tapped) → अभ्यासः (practice, then the result and the next lesson).
//  Practice mixes the lesson's own exercises (choose the form, transform a sentence)
//  with exercises made from its sentences (arrange the words, choose the meaning).
//  Address: #speak (course) and #speak/2-03 (a lesson), so the browser's Back works.
//  Sanskrit is shown in Devanāgarī unless the reader has picked a script on purpose.
//  Data: app/src/data/sambhashanam.json (data-source/24-sambhashanam), loaded on first open.
//  Progress is kept in this browser only.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import { shuffle } from "../data";
import { FlagButton } from "../FlagUI";
import { useLang } from "../settings";
import { useSaDeva } from "../i18n/script";
import { speak } from "../speech";
import { KsTop } from "../kosha/Kosha";
import sambhashanamUrl from "../data/sambhashanam.json?url";
import "../kosha/kosha.css";
import "./speak.css";

/** sentence: Sanskrit, English, Hindi, Telugu, id in the sentence book ("" if new) */
type Sent = [string, string, string, string, string];
/** exercise: c = choose, t = transform; prompt, options, answer, hint / instruction */
type Ex = ["c" | "t", string, string[], string, string];
type Lesson = { id: string; lv: number; sa: string; en: string; point: string[]; pattern: string[][];
  vocab: [string, string, string, string][]; s: Sent[]; ex: Ex[] };
type Course = { levels: [number, string, string, string][]; lessons: Lesson[] };

let course: Promise<Course> | null = null;
function loadCourse(): Promise<Course> {
  course ??= fetch(sambhashanamUrl).then(r => { if (!r.ok) throw new Error(`Could not load the lessons (HTTP ${r.status}).`); return r.json(); });
  course.catch(() => { course = null; });
  return course;
}
// progress: best score (0–100) per lesson, in this browser only
const KEY = "medhaa.sambhashanam.v1";
const PASS = 80;
function readProgress(): Record<string, number> { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } }
function saveProgress(p: Record<string, number>) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage unavailable */ } }

/** Sanskrit in Devanāgarī on this page, unless the reader chose a script explicitly */
const useSpS = useSaDeva;
/** lesson id from the address: #speak/2-03 → "2-03" */
const hashLesson = () => { const [v, id] = location.hash.slice(1).split("/"); return v === "speak" && id ? id : null; };

const MEAN_IDX: Record<string, number> = { en: 1, hi: 2, te: 3 };
const meaning = (s: Sent, lang: string) => s[MEAN_IDX[lang] ?? 1];
const vocabMeaning = (v: [string, string, string, string], lang: string) => v[MEAN_IDX[lang] ?? 1];
const Say: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;
const status = (b: number | undefined) => b === undefined ? "new" : b >= PASS ? "done" : "started";

export const Sambhashanam: React.FC = () => {
  const [data, setData] = useState<Course | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<string | null>(hashLesson);
  const [level, setLevel] = useState<number | null>(null);
  const [progress, setProgress] = useState(readProgress);
  useEffect(() => { loadCourse().then(setData, e => setErr(String(e?.message || e))); }, []);
  useEffect(() => {                                   // Back / Forward between the course and a lesson
    const on = () => { setOpen(hashLesson()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const record = (id: string, score: number) => {
    const p = { ...readProgress() }; if ((p[id] ?? -1) < score) { p[id] = score; saveProgress(p); } setProgress(p);
  };
  const go = (id: string | null) => {
    try { history.pushState(null, "", id ? `#speak/${id}` : "#speak"); } catch { /* sandboxed */ }
    setOpen(id); window.scrollTo(0, 0);
  };
  if (!data) return <div className="ks sp-page"><p className="ks-note-plain" role={err ? "alert" : "status"}>{err || "पाठाः आनीयन्ते… · Loading the lessons…"}</p></div>;

  const all = data.lessons;
  const cur = open ? all.find(l => l.id === open) : null;
  if (cur) {
    const i = all.indexOf(cur);
    return <LessonView key={cur.id} l={cur} prev={all[i - 1]} next={all[i + 1]} go={go} record={record} best={progress[cur.id]} />;
  }
  const nextUp = all.find(l => (progress[l.id] ?? 0) < PASS);
  const shownLevel = level ?? nextUp?.lv ?? 1;
  return <CourseView data={data} progress={progress} nextUp={nextUp} level={shownLevel} setLevel={setLevel} go={go} />;
};

// ── course page ──
const CourseView: React.FC<{ data: Course; progress: Record<string, number>; nextUp?: Lesson; level: number;
  setLevel: (n: number) => void; go: (id: string) => void }> = ({ data, progress, nextUp, level, setLevel, go }) => {
  const S = useSpS();
  const started = Object.keys(progress).length > 0;
  const lessons = data.lessons.filter(l => l.lv === level);
  const units: Lesson[][] = []; for (let k = 0; k < lessons.length; k += 5) units.push(lessons.slice(k, k + 5));
  return (
    <div className="ks sp-page">
      <KsTop title="सम्भाषणम्" en="Speak Sanskrit" sub="A graded course in everyday spoken Sanskrit: short lessons, model sentences you can listen to, and practice after each lesson." />

      {nextUp
        ? <div className="sp-continue">
            <div>
              <small>{started ? "अनुवर्तताम् · Continue where you stopped" : "आरभताम् · Start here"}</small>
              <b className="ks-l-sa">{nextUp.id} · {S(nextUp.sa)}</b>
              <span>{nextUp.en}</span>
            </div>
            <button className="sp-go" onClick={() => go(nextUp.id)}>{started ? "अनुवर्तताम् · Continue →" : "आरभताम् · Start →"}</button>
          </div>
        : <div className="sp-continue done"><b>अभिनन्दनानि! · Congratulations — all {data.lessons.length} lessons are complete.</b></div>}

      <div className="sp-levels" role="tablist" aria-label="Levels">
        {data.levels.map(([n, sl, en, blurb]) => {
          const ls = data.lessons.filter(l => l.lv === n); const done = ls.filter(l => (progress[l.id] ?? 0) >= PASS).length;
          return (
            <button key={n} role="tab" aria-selected={level === n} className={`sp-level ${level === n ? "on" : ""}`} onClick={() => setLevel(n)} disabled={!ls.length}>
              <b className="ks-l-sa">{sl}</b><span>{en}</span>
              <span className="sp-bar" aria-hidden="true"><span style={{ width: `${ls.length ? 100 * done / ls.length : 0}%` }} /></span>
              <small>{ls.length ? `${done} / ${ls.length} lessons done` : "coming soon"}</small>
              <small className="sp-blurb">{blurb}</small>
            </button>);
        })}
      </div>

      {units.map((u, k) => {
        const done = u.filter(l => (progress[l.id] ?? 0) >= PASS).length;
        return (
          <section key={k} className="sp-unit" aria-label={`Unit ${k + 1}`}>
            <h4>घटकः {k + 1} · Unit {k + 1} <span>{done} / {u.length}</span></h4>
            <ol className="sp-lessons">
              {u.map(l => {
                const b = progress[l.id]; const st = status(b); const isNext = nextUp?.id === l.id;
                return (
                  <li key={l.id}>
                    <button className={`sp-lesson ${st} ${isNext ? "next" : ""}`} onClick={() => go(l.id)}>
                      <span className="sp-mark" aria-label={`${st === "done" ? "completed" : st === "started" ? "started" : "not started"} lesson ${l.id.split("-")[1]}`}>{l.id.split("-")[1]}</span>
                      <span className="sp-ltitle"><b className="ks-l-sa">{S(l.sa)}</b><span>{l.en}</span></span>
                      <span className="sp-score">{isNext ? "next →" : b === undefined ? "" : `${b}%`}</span>
                    </button>
                  </li>);
              })}
            </ol>
          </section>);
      })}
    </div>
  );
};

// ── lesson page ──
const STEPS = [["पठत", "Learn"], ["शृणुत", "Listen"], ["अभ्यासः", "Practice"]] as const;

const LessonView: React.FC<{ l: Lesson; prev?: Lesson; next?: Lesson; go: (id: string | null) => void; record: (id: string, s: number) => void; best?: number }> =
  ({ l, prev, next, go, record, best }) => {
  const S = useSpS(); const lang = useLang();
  const [step, setStep] = useState(0);
  const toStep = (n: number) => { setStep(n); window.scrollTo(0, 0); };
  return (
    <div className="ks sp-page sp-lessonview">
      <div className="sp-crumbs">
        <button className="un-link" onClick={() => go(null)}>← सम्भाषणम् · all lessons</button>
        <span>{best !== undefined ? `Best: ${best}%` : ""}</span>
      </div>
      <div className="ks-card">
        <div className="sp-lhead">
          <span className="sp-num">Level {l.lv} · {l.id}</span>
          <h3 className="ks-l-sa">{S(l.sa)}</h3>
          <p className="ks-sub">{l.en}</p>
        </div>
        <div className="sp-steps" role="tablist" aria-label="Lesson steps">
          {STEPS.map(([s, e], n) => (
            <button key={n} role="tab" aria-selected={step === n} className={`sp-step ${step === n ? "on" : ""} ${step > n ? "past" : ""}`} onClick={() => toStep(n)}>
              <span className="sp-stepno">{n + 1}</span><b className="ks-l-sa">{s}</b><span>{e}</span>
            </button>))}
        </div>

        {step === 0 && <>
          <h4>मुख्यांशाः · Key points</h4>
          <ul className="sp-points">{l.point.map((p, i) => <li key={i}>{S(p)}</li>)}</ul>
          {l.pattern.length > 1 && <div className="ks-table-wrap"><table className="ks-karaka sp-pattern">
            <thead><tr>{l.pattern[0].map((h, i) => <th key={i}>{S(h)}</th>)}</tr></thead>
            <tbody>{l.pattern.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={j ? "ks-l-sa" : ""}>{S(c)}</td>)}</tr>)}</tbody></table></div>}
          {l.vocab.length > 0 && <><h4>शब्दाः · Words <span className="ks-l-en">— tap a word to hear it</span></h4>
            <div className="sp-vocab">{l.vocab.map(v => (
              <button key={v[0]} className="sp-chip" onClick={() => speak(v[0])}><b className="ks-l-sa">{S(v[0])}</b> <span dir="auto">{vocabMeaning(v, lang)}</span></button>))}</div></>}
          <div className="sp-stepnav"><span /><button className="sp-go" onClick={() => toStep(1)}>शृणुत · Listen to the sentences →</button></div>
        </>}

        {step === 1 && <Listen l={l} onNext={() => toStep(2)} onBack={() => toStep(0)} />}

        {step === 2 && <Practice key={l.id} l={l} onDone={s => record(l.id, s)} next={next} go={go} onBack={() => toStep(1)} />}
      </div>
      <div className="sp-nav">
        {prev ? <button onClick={() => go(prev.id)}>← {prev.id} {S(prev.sa)}</button> : <span />}
        {next ? <button onClick={() => go(next.id)}>{next.id} {S(next.sa)} →</button> : <span />}
      </div>
    </div>
  );
};

/** sentences as cards; the meaning stays hidden until tapped, so the learner first tries to understand */
const Listen: React.FC<{ l: Lesson; onNext: () => void; onBack: () => void }> = ({ l, onNext, onBack }) => {
  const S = useSpS(); const lang = useLang();
  const [shown, setShown] = useState<Set<number>>(new Set());
  const allShown = shown.size === l.s.length;
  const toggle = (i: number) => setShown(p => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return <>
    <div className="sp-listenhead">
      <p className="ks-l-en">Read or listen to each sentence and try to understand it; then tap it to see the meaning.</p>
      <button className="un-link" onClick={() => setShown(allShown ? new Set() : new Set(l.s.map((_, i) => i)))}>{allShown ? "अर्थान् गोपयत · Hide meanings" : "सर्वान् अर्थान् दर्शयत · Show all meanings"}</button>
    </div>
    {!["en", "hi", "te"].includes(lang) && <p className="ks-note-plain">Meanings are shown in English for now; other languages are being added.</p>}
    <ol className="sp-cards">{l.s.map((s, i) => (
      <li key={i} className={`sp-card ${shown.has(i) ? "open" : ""}`}>
        <div className="sp-cardtop">
          <span className="sp-cardno">{i + 1}</span>
          <button className="sp-cardsa ks-l-sa" onClick={() => toggle(i)} aria-expanded={shown.has(i)}>{S(s[0])}</button>
          <Say t={s[0]} />
        </div>
        {shown.has(i)
          ? <div className="sp-cardmean"><span dir="auto">{meaning(s, lang)}</span>
              <FlagButton t={{ kind: "sentence", id: `SB-${l.id}-${i + 1}`, field: "sentence", value: `${s[0]} | ${meaning(s, lang)}`, where: `सम्भाषणम् ${l.id} · sentence ${i + 1}` }} /></div>
          : <button className="sp-reveal" onClick={() => toggle(i)}>अर्थः · Show meaning</button>}
      </li>))}</ol>
    <div className="sp-stepnav">
      <button className="un-link" onClick={onBack}>← पठत · Learn</button>
      <button className="sp-go" onClick={onNext}>अभ्यासः · Start practice →</button>
    </div>
  </>;
};

// ── practice ──
type Q = { kind: "c" | "t" | "arrange" | "mean"; prompt: string; ask: string; options: string[]; answer: string; hint: string; words?: string[] };
const words = (s: string) => s.replace(/[।?!]/g, " ").split(/\s+/).filter(Boolean);
function makePractice(l: Lesson, lang: string): Q[] {
  const qs: Q[] = l.ex.map(([k, prompt, opts, ans, hint]) => ({
    kind: k, prompt, options: shuffle([...opts]), answer: ans,
    ask: k === "c" ? "उचितं चिनुत · Choose the right one" : `परिवर्तयत · ${hint}`, hint: k === "c" ? hint : "",
  }));
  // arrange the words of three short sentences
  const short = shuffle(l.s.filter(s => { const n = words(s[0]).length; return n >= 3 && n <= 6; })).slice(0, 3);
  for (const s of short) {
    const ws = words(s[0]);
    let mixed = shuffle([...ws]); for (let k = 0; k < 5 && mixed.join(" ") === ws.join(" "); k++) mixed = shuffle([...ws]);
    qs.push({ kind: "arrange", prompt: meaning(s, lang), ask: "पदानि क्रमेण योजयत · Put the words in order", options: [], answer: ws.join(" "), hint: "", words: mixed });
  }
  // choose the meaning of two sentences
  for (const s of shuffle([...l.s]).slice(0, 2)) {
    const others = shuffle(l.s.filter(x => x !== s)).slice(0, 3).map(x => meaning(x, lang));
    qs.push({ kind: "mean", prompt: s[0], ask: "अर्थं चिनुत · Choose the meaning", options: shuffle([meaning(s, lang), ...others]), answer: meaning(s, lang), hint: "" });
  }
  return qs;
}

const Practice: React.FC<{ l: Lesson; onDone: (score: number) => void; next?: Lesson; go: (id: string | null) => void; onBack: () => void }> =
  ({ l, onDone, next, go, onBack }) => {
  const S = useSpS(); const lang = useLang();
  const [round, setRound] = useState(0);
  const qs = useMemo(() => makePractice(l, lang), [l, lang, round]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const finished = i >= qs.length;
  const pct = Math.round(100 * score / qs.length);
  useEffect(() => { if (finished && !saved) { onDone(pct); setSaved(true); } }, [finished, saved, pct, onDone]);
  const restart = () => { setRound(r => r + 1); setI(0); setChosen(null); setBuilt([]); setScore(0); setSaved(false); window.scrollTo(0, 0); };

  if (finished) {
    const pass = pct >= PASS;
    return (
      <div className={`sp-done ${pass ? "pass" : ""}`}>
        <p className="sp-bigscore">{pct}%</p>
        <p>{score} / {qs.length} correct</p>
        <p className="sp-verdict">{pass ? "साधु! · Lesson complete." : `पुनः प्रयत्नं करोतु · Try once more — ${PASS}% completes the lesson.`}</p>
        <div className="sp-donebtns">
          <button className="sp-ghost" onClick={restart}>पुनः · Practise again</button>
          {pass && next && <button className="sp-go" onClick={() => go(next.id)}>अग्रिमः पाठः · Next lesson: {next.id} →</button>}
          {pass && !next && <button className="sp-go" onClick={() => go(null)}>सम्भाषणम् · Back to the course</button>}
          {!pass && <button className="sp-ghost" onClick={onBack}>← शृणुत · Review the sentences</button>}
        </div>
      </div>);
  }
  const q = qs[i];
  const answer = (o: string) => { if (chosen !== null) return; setChosen(o); if (o === q.answer) setScore(n => n + 1); };
  const advance = () => { setI(i + 1); setChosen(null); setBuilt([]); };
  return (
    <div className="sp-practice">
      <div className="sp-ptop"><span>{i + 1} / {qs.length}</span><span className="sp-bar" aria-hidden="true"><span style={{ width: `${100 * i / qs.length}%` }} /></span><span>Score: {score}</span></div>
      <p className="un-ask">{S(q.ask)}</p>
      {q.kind === "arrange"
        ? <>
            <p className="sp-prompt" dir="auto">{q.prompt}</p>
            <div className="sp-built ks-l-sa">{built.map(k => S(q.words![k])).join(" ") || " "}</div>
            <div className="sp-tiles">{q.words!.map((w, k) => (
              <button key={k} className="sp-tile ks-l-sa" disabled={built.includes(k) || chosen !== null} onClick={() => {
                const b = [...built, k]; setBuilt(b);
                if (b.length === q.words!.length) answer(b.map(x => q.words![x]).join(" "));
              }}>{S(w)}</button>))}
              {built.length > 0 && chosen === null && <button className="un-link" onClick={() => setBuilt(built.slice(0, -1))}>↶ undo</button>}
            </div>
          </>
        : <>
            <div className="ks-head"><p className="sp-prompt ks-l-sa">{S(q.prompt)}</p>{q.kind === "mean" && <Say t={q.prompt} />}</div>
            {q.hint && <p className="ks-l-en">{q.hint}</p>}
            <div className="un-opts">{q.options.map(o => (
              <button key={o} onClick={() => answer(o)} disabled={chosen !== null} dir="auto"
                className={`un-opt ${q.kind === "mean" ? "" : "ks-l-sa"} ${chosen === null ? "" : o === q.answer ? "ok" : o === chosen ? "bad" : "dim"}`}>{q.kind === "mean" ? o : S(o)}</button>))}</div>
          </>}
      {chosen !== null && <>
        <p className={`un-verdict ${chosen === q.answer ? "ok" : "bad"}`}>{chosen === q.answer ? "साधु! · Correct" : <>उत्तरम् · Answer: <span className={q.kind === "mean" ? "" : "ks-l-sa"}>{q.kind === "mean" ? q.answer : S(q.answer)}</span></>}</p>
        <div className="un-next">
          <FlagButton t={{ kind: "sentence", id: `SB-${l.id}-ex`, field: "exercise", value: `${q.prompt} → ${q.answer}`, where: `सम्भाषणम् ${l.id} · practice` }} label="Report" />
          <button className="on" onClick={advance}>{i + 1 < qs.length ? "अग्रे · Next" : "फलम् · Result"}</button>
        </div>
      </>}
    </div>
  );
};

/** a small pointer to the course from other pages */
export const SambhashanamLink: React.FC = () => (
  <div className="un-links"><span><b className="ks-l-sa">सम्भाषणम्</b> · A graded course in spoken Sanskrit with practice after every lesson.</span>
    <span className="ks-chips"><a className="sp-linkbtn" href="#speak">सम्भाषणम् · Open the course →</a></span></div>
);
