// ═══════════════════════════════════════════════════════════════
//  Quiz — प्रश्नोत्तरम्: one prompt, four answers.
//  Used for meanings, noun forms, verb forms, kṛdantas and avyayas.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from "react";
import type { GameApi } from "../GameShell";
import type { QuizStation, QuizItem } from "../stations";
import { useLang } from "../../settings";
import { speak } from "../../speech";
import { FlagButton } from "../../FlagUI";
import { useSa } from "../../i18n/script";

const Quiz: React.FC<{ station: QuizStation; api: GameApi }> = ({ station, api }) => {
  const apiRef = useRef(api); apiRef.current = api;
  const lang = useLang();
  const S = useSa();
  const [items] = useState<QuizItem[]>(() => station.items(lang));
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [left, setLeft] = useState(station.timeLimit ?? 0);
  const total = items.length;
  const q = items[i];

  useEffect(() => { apiRef.current.progress(i, total); }, [i, total]);

  // per-question timer (challenge stations)
  useEffect(() => {
    if (!station.timeLimit || chosen !== null || !q) return;
    setLeft(station.timeLimit);
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const l = station.timeLimit! - (Date.now() - t0) / 1000;
      if (l <= 0) { clearInterval(id); setLeft(0); setChosen("⏱"); apiRef.current.wrong(); }
      else setLeft(l);
    }, 200);
    return () => clearInterval(id);
  }, [i, chosen, q, station.timeLimit]);

  if (!q) return <p className="qz-empty">No questions could be made for this station.</p>;

  const next = () => {
    if (apiRef.current.isOver()) return;
    if (i + 1 >= total) { apiRef.current.progress(total, total); apiRef.current.finish(); return; }
    setI(i + 1); setChosen(null); setHidden(new Set());
  };
  const answer = (o: string) => {
    if (chosen !== null) return;
    setChosen(o);
    if (o === q.answer) { apiRef.current.correct(10); window.setTimeout(next, 1100); }
    else apiRef.current.wrong();
  };
  const hint = () => {
    if (chosen !== null || hidden.size) return;
    const wrong = q.options.filter(o => o !== q.answer).slice(0, 2);
    setHidden(new Set(wrong)); apiRef.current.hint();
  };
  const right = chosen === q.answer;

  return (
    <div className="qz">
      {station.timeLimit && (
        <div className={`ab-timer ${left < 8 ? "ab-timer-low" : ""}`}><div style={{ width: `${(left / station.timeLimit) * 100}%` }} /></div>
      )}
      <div className={`qz-card ${chosen !== null ? (right ? "qz-right" : "qz-wrong") : ""}`}>
        <span className="ab-round">{i + 1} / {total}</span>
        {q.sentence
          ? <div className="qz-sentence">{q.sentence.split("___").map((part, k, arr) => (
              <React.Fragment key={k}>{S(part)}{k < arr.length - 1 && <span className="ab-blank">{chosen !== null ? S(q.answer) : "?"}</span>}</React.Fragment>))}</div>
          : <div className="qz-prompt">{S(q.prompt)}</div>}
        {q.sentence && q.mark && <div className="qz-prompt qz-mark">{S(q.mark)}</div>}
        {q.promptRoman && <div className="qz-roman">{q.promptRoman}</div>}
        <div className="qz-tags">{q.tags.map(t => <span key={t}>{S(t)}</span>)}</div>
        {q.clue && <div className="qz-clue">{q.clue}</div>}
        <div className="qz-ask">
          {q.speak && <button className="ab-speak" onClick={() => speak(q.speak!)} title="Listen" aria-label="Listen">🔊</button>}
          <span>{q.ask}</span>
        </div>
      </div>

      <div className="qz-opts">
        {q.options.map(o => {
          const cls = chosen === null ? "" : o === q.answer ? "qz-opt-right" : o === chosen ? "qz-opt-wrong" : "qz-opt-dim";
          return (
            <button key={o} className={`qz-opt ${q.optDeva ? "qz-deva" : ""} ${cls}`} disabled={chosen !== null || hidden.has(o)}
              style={hidden.has(o) ? { visibility: "hidden" } : undefined} onClick={() => answer(o)}>{q.optDeva ? S(o) : o}</button>
          );
        })}
      </div>

      <div className="qz-foot">
        {chosen === null ? (
          station.hints ? <button className="qz-hint" onClick={hint} disabled={hidden.size > 0}>💡 50 : 50 <small>(−5)</small></button> : <span />
        ) : (
          <div className={`qz-feedback ${right ? "ok" : "no"}`} aria-live="polite">
            {right ? "✓ साधु!" : chosen === "⏱" ? `⏱ समयः समाप्तः — ${q.optDeva ? S(q.answer) : q.answer}` : `✗ सम्यक् उत्तरम्: ${q.optDeva ? S(q.answer) : q.answer}`}
            {q.also && <small>{q.also}</small>}
          </div>
        )}
        <div className="qz-foot-r">
          <FlagButton t={q.flag} label="दोषः? Report" />
          {chosen !== null && !right && <button className="gs-primary qz-next" onClick={next} autoFocus>अग्रिमम् · Next →</button>}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
