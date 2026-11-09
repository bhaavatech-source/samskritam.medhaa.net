// ═══════════════════════════════════════════════════════════════
//  game/Journey.tsx — यात्रा: the map, the station card, the game
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import { REGIONS, STATIONS, type Region, type Station } from "./stations";
import { currentIndex, isUnlocked, loadProgress, saveProgress, type Progress } from "./progress";
import GameShell from "./GameShell";
import Quiz from "./games/Quiz";
import MemoryMatch from "./games/MemoryMatch";
import SentenceBuilder from "./games/SentenceBuilder";
import { LangPicker } from "../FlagUI";
import "./game.css";

const KIND_INFO: Record<Station["kind"], { name: string; how: string }> = {
  quiz:   { name: "प्रश्नोत्तरम् · Quiz",      how: "Read the question and tap the right answer. 💡 removes two wrong answers. See a mistake in the data? Tap ⚑." },
  memory: { name: "स्मृतिक्रीडा · Memory",   how: "All cards show for a moment — remember them! Then flip two at a time to find pairs." },
  build:  { name: "वाक्यरचना · Sentence builder", how: "Read the meaning, then tap the words in order. Tap a placed word to take it back." },
};

const ROW_H = 124;
const XS = [24, 50, 76, 50];

const Journey: React.FC = () => {
  const [prog, setProg] = useState<Progress>(loadProgress);
  const [card, setCard] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);

  const update = (p: Progress) => { setProg(p); saveProgress(p); };
  const totalStars = STATIONS.reduce((a, s) => a + (prog.stars[s.id] ?? 0), 0);
  const cur = currentIndex(prog);

  if (playing !== null) {
    const s = STATIONS[playing];
    const hasNext = playing + 1 < STATIONS.length;
    return (
      <GameShell
        key={s.id}
        station={s}
        onExit={() => setPlaying(null)}
        onNext={hasNext ? () => { setPlaying(null); setCard(playing + 1); } : undefined}
        onDone={(stars, score) => {
          const p = loadProgress();
          update({
            ...p,
            stars: { ...p.stars, [s.id]: Math.max(p.stars[s.id] ?? 0, stars) },
            best: { ...p.best, [s.id]: Math.max(p.best[s.id] ?? 0, score) },
          });
        }}
      >
        {api =>
          s.kind === "quiz"   ? <Quiz station={s} api={api} /> :
          s.kind === "memory" ? <MemoryMatch station={s} api={api} /> :
                                <SentenceBuilder station={s} api={api} />}
      </GameShell>
    );
  }

  const regions = (Object.keys(REGIONS) as Region[]).map(r => ({
    r, list: STATIONS.map((s, i) => ({ s, i })).filter(x => x.s.region === r),
  }));

  return (
    <div className="jy">
      <div className="jy-top">
        <div>
          <h2 className="jy-title">यात्रा <span>· The Saṃskṛtam journey</span></h2>
          <p className="jy-sub">Earn at least one star to open the next station. Each region ends with a 👑 challenge.</p>
        </div>
        <div className="jy-top-right">
          <LangPicker />
          <span className="jy-total">⭐ {totalStars} / {STATIONS.length * 3}</span>
          <label className="jy-open" title="Open every station (for teachers or review)">
            <input type="checkbox" checked={prog.openAll} onChange={e => update({ ...prog, openAll: e.target.checked })} />
            सर्वम् उद्घाटय · open all
          </label>
        </div>
      </div>

      {regions.map(({ r, list }) => {
        const reg = REGIONS[r];
        const h = list.length * ROW_H;
        const pts = list.map((_, k) => `${XS[k % 4]},${k * ROW_H + ROW_H / 2}`).join(" ");
        const done = list.filter(x => (prog.stars[x.s.id] ?? 0) > 0).length;
        return (
          <section key={r} className="jy-region" style={{ "--rc": reg.color } as React.CSSProperties}>
            <header className="jy-region-head">
              <span className="jy-region-name">{reg.name}</span>
              <span className="jy-region-en">{reg.en}</span>
              <span className="jy-region-who">{reg.who}</span>
              <span className="jy-region-count">{done}/{list.length}</span>
            </header>
            <div className="jy-path" style={{ height: h }}>
              <svg className="jy-svg" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none">
                <polyline points={pts} fill="none" />
              </svg>
              {list.map(({ s, i }, k) => {
                const open = isUnlocked(prog, i);
                const stars = prog.stars[s.id] ?? 0;
                return (
                  <button key={s.id}
                    className={`jy-node ${open ? "" : "jy-locked"} ${i === cur && open ? "jy-current" : ""} ${s.boss ? "jy-boss" : ""} ${stars ? "jy-done" : ""}`}
                    style={{ left: `${XS[k % 4]}%`, top: k * ROW_H + ROW_H / 2, "--i": i } as React.CSSProperties}
                    onClick={() => open && setCard(i)}
                    disabled={!open}>
                    <span className="jy-node-circle">{open ? s.icon : "🔒"}</span>
                    <span className="jy-node-title">{s.title}</span>
                    <span className="jy-node-en">{s.en}</span>
                    <span className="jy-node-stars">{[1, 2, 3].map(n => <span key={n} className={n <= stars ? "on" : ""}>★</span>)}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {card !== null && (() => {
        const s = STATIONS[card];
        const info = KIND_INFO[s.kind];
        const rounds = s.kind === "memory" ? "6 pairs" : s.kind === "build" ? `${s.rounds} sentences` : `${s.rounds} questions`;
        return (
          <div className="jy-card-bg" onClick={() => setCard(null)}>
            <div className="jy-card" style={{ "--rc": REGIONS[s.region].color } as React.CSSProperties} onClick={e => e.stopPropagation()}>
              <span className="jy-card-icon">{s.icon}</span>
              <span className="jy-card-region">{REGIONS[s.region].name} · {card + 1} / {STATIONS.length}</span>
              <h3>{s.title}</h3>
              <p className="jy-card-en">{s.en}</p>
              <p className="jy-card-blurb">{s.blurb}</p>
              <div className="jy-card-kind">
                <b>{info.name}</b>
                <span>{info.how}</span>
              </div>
              <div className="jy-card-rules">
                <span>🎯 {rounds}</span>
                {s.lives !== null && <span>❤️ × {s.lives}</span>}
                {s.kind === "quiz" && s.timeLimit && <span>⏱ {s.timeLimit}s each</span>}
                {s.kind !== "memory" && <span>{s.hints ? "💡 hints allowed" : "🚫 no hints"}</span>}
              </div>
              <div className="jy-card-btns">
                <button onClick={() => setCard(null)}>Close</button>
                <button className="jy-go" onClick={() => { setPlaying(card); setCard(null); }}>आरभस्व · Start ▶</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Journey;
