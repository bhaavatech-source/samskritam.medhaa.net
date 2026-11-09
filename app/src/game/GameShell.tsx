// ═══════════════════════════════════════════════════════════════
//  game/GameShell.tsx — shared frame for every station
//  lives ❤️, score, streak, hints, progress, result screen
// ═══════════════════════════════════════════════════════════════
import React, { useCallback, useRef, useState } from "react";
import { REGIONS, type Station } from "./stations";
import { sfx } from "../sounds";

// tell the medhaa.net page shell (if present) how the player did
function reportScore(correct: number, total: number, section: string) {
  try {
    const bs = (window as unknown as { BhavaSession?: { end: (pct: number, d: object) => void } }).BhavaSession;
    if (bs) bs.end(Math.round((correct / Math.max(total, 1)) * 100), { game: "samskrita-medhaa", section, correct, total });
  } catch { /* not embedded */ }
}

export type GameApi = {
  correct: (points?: number) => void;
  wrong: () => void;
  hint: () => void;
  progress: (done: number, total: number) => void;
  finish: (stars?: number) => void;
  isOver: () => boolean;
};

type Result = { stars: number; score: number; mistakes: number; failed: boolean };

const STREAK_BONUS = [0, 0, 2, 4, 6, 8, 10];
const safe = (f: () => void) => { try { f(); } catch { /* audio blocked */ } };

const GameShell: React.FC<{
  station: Station;
  onExit: () => void;
  onDone: (stars: number, score: number) => void;
  onNext?: () => void;
  children: (api: GameApi) => React.ReactNode;
}> = ({ station, onExit, onDone, onNext, children }) => {
  const [run, setRun] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState<number | null>(station.lives);
  const [streak, setStreak] = useState(0);
  const [prog, setProg] = useState<[number, number]>([0, 1]);
  const [result, setResult] = useState<Result | null>(null);
  const [pops, setPops] = useState<{ id: number; text: string; good: boolean }[]>([]);
  const st = useRef({ score: 0, lives: station.lives, streak: 0, mistakes: 0, hints: 0, over: false });

  const pop = (text: string, good: boolean) => {
    const id = Math.random();
    setPops(p => [...p, { id, text, good }]);
    setTimeout(() => setPops(p => p.filter(x => x.id !== id)), 900);
  };

  const end = useCallback((failed: boolean, stars?: number) => {
    const s = st.current;
    if (s.over) return;
    s.over = true;
    const penalty = s.mistakes + s.hints * 0.5;
    const earned = failed ? 0 : stars ?? (penalty <= 0 ? 3 : penalty <= 2 ? 2 : 1);
    setResult({ stars: earned, score: s.score, mistakes: s.mistakes, failed });
    safe(failed ? sfx.wrong : sfx.levelUp);
    reportScore(earned, 3, station.en);
    onDone(earned, s.score);
  }, [onDone, station.en]);

  const api: GameApi = {
    correct: (points = 10) => {
      const s = st.current; if (s.over) return;
      s.streak += 1;
      const bonus = STREAK_BONUS[Math.min(s.streak, STREAK_BONUS.length - 1)];
      s.score += points + bonus;
      setScore(s.score); setStreak(s.streak);
      pop(`+${points + bonus}`, true);
      safe(s.streak >= 3 ? sfx.streak : sfx.correct);
    },
    wrong: () => {
      const s = st.current; if (s.over) return;
      s.streak = 0; s.mistakes += 1;
      setStreak(0);
      safe(sfx.wrong);
      if (s.lives !== null) {
        s.lives -= 1; setLives(s.lives);
        pop("−❤️", false);
        if (s.lives <= 0) setTimeout(() => end(true), 700);
      } else pop("✗", false);
    },
    hint: () => {
      const s = st.current; if (s.over) return;
      s.hints += 1; s.score = Math.max(0, s.score - 5); setScore(s.score);
      pop("💡 −5", false);
    },
    progress: (done, total) => setProg(p => (p[0] === done && p[1] === total ? p : [done, total])),
    finish: (stars) => end(false, stars),
    isOver: () => st.current.over,
  };

  const restart = () => {
    st.current = { score: 0, lives: station.lives, streak: 0, mistakes: 0, hints: 0, over: false };
    setScore(0); setLives(station.lives); setStreak(0); setResult(null); setProg([0, 1]);
    setRun(r => r + 1);
  };

  const region = REGIONS[station.region];
  const pct = Math.round((prog[0] / Math.max(prog[1], 1)) * 100);

  return (
    <div className="gs" style={{ "--rc": region.color } as React.CSSProperties}>
      <div className="gs-hud">
        <button className="gs-back" onClick={onExit} title="Back to the map">← यात्रा</button>
        <div className="gs-title">
          <span className="gs-title-icon">{station.icon}</span>
          <span className="gs-title-sa">{station.title}</span>
          <span className="gs-title-en">{station.en}</span>
        </div>
        <div className="gs-stats">
          {lives !== null && (
            <span className="gs-lives" title="Lives">
              {Array.from({ length: station.lives ?? 0 }, (_, i) => (
                <span key={i} className={i < lives ? "gs-heart" : "gs-heart gs-heart-lost"}>❤️</span>
              ))}
            </span>
          )}
          {streak >= 2 && <span className="gs-streak">🔥 {streak}</span>}
          <span className="gs-score">⚡ {score}</span>
        </div>
      </div>
      <div className="gs-progress"><div style={{ width: `${pct}%` }} /></div>

      <div className="gs-stage" key={run}>
        {children(api)}
        <div className="gs-pops">
          {pops.map(p => <span key={p.id} className={`gs-pop ${p.good ? "gs-pop-good" : "gs-pop-bad"}`}>{p.text}</span>)}
        </div>
      </div>

      {result && (
        <div className="gs-result">
          <div className="gs-result-box">
            <div className="gs-result-icon">{result.failed ? "💔" : station.boss ? "🏆" : "🎉"}</div>
            <h2>{result.failed ? "पुनः प्रयतस्व!" : "शोभनम्!"}</h2>
            <p className="gs-result-sub">{result.failed ? "Out of lives — try again, you're getting closer." : `${station.title} complete`}</p>
            <div className="gs-result-stars">
              {[1, 2, 3].map(n => <span key={n} className={n <= result.stars ? "on" : ""}>★</span>)}
            </div>
            <div className="gs-result-row">
              <span>⚡ {result.score} points</span>
              <span>✗ {result.mistakes} mistakes</span>
            </div>
            <div className="gs-result-btns">
              <button onClick={restart}>↻ पुनः · Retry</button>
              <button onClick={onExit}>🗺 यात्रा · Map</button>
              {!result.failed && onNext && <button className="gs-primary" onClick={onNext}>अग्रिमम् · Next →</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameShell;
