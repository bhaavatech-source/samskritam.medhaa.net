// ═══════════════════════════════════════════════════════════════
//  play/kit.tsx — the क्रीडाङ्गणम् game engine.
//  Five games that work on any list of question → answer pairs, so every set of words,
//  roots (and later sandhis, samāsas …) gets all of them:
//    स्मरणपत्राणि  flip cards        युग्मानि  memory pairs
//    शीघ्रचयनम्   one-minute choice  पतन्ति पदानि  falling words
//    रचयत        build the answer from its syllables
//  Every game ends with onEnd(stars 0–3, a one-line summary).
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useRef, useState } from "react";
import { shuffle } from "../data";
import { sfx } from "../sounds";
import { speak } from "../speech";
import { useSaDeva } from "../i18n/script";

/** one thing to learn: q is asked, a is answered; alts are other accepted answers.
 *  sub: small lines under the question (tags, the question asked); opts: hand-made wrong answers
 *  to offer instead of other pairs' answers; tiles: build the answer from these words, in order. */
export type Pair = { q: string; a: string; alts?: string[]; qSa: boolean; aSa: boolean; say?: string;
  sub?: string[]; opts?: string[]; tiles?: string[] };
export type GameProps = { pairs: Pair[]; onEnd: (stars: number, summary: string) => void };
export type GameId = "flip" | "match" | "quick" | "fall" | "build";

// ── sound (can be switched off) ──
const SOUND_KEY = "medhaa.play.sound";
let soundOn = (() => { try { return localStorage.getItem(SOUND_KEY) !== "off"; } catch { return true; } })();
export const isSoundOn = () => soundOn;
export const setSoundOn = (on: boolean) => { soundOn = on; try { localStorage.setItem(SOUND_KEY, on ? "on" : "off"); } catch { /* ignore */ } };
const play = (f: () => void) => { if (soundOn) try { f(); } catch { /* audio blocked */ } };

const accepted = (p: Pair) => p.alts?.length ? p.alts : [p.a];
const isRight = (p: Pair, x: string) => accepted(p).includes(x);
/** the right answer plus up to n-1 other answers from the pool that are not also right */
function choices(p: Pair, pool: Pair[], n = 4): string[] {
  const out = [p.a]; const bad = new Set(accepted(p));
  const from = p.opts?.length ? p.opts : shuffle(pool).map(o => o.a);
  for (const o of shuffle(from)) { if (out.length >= n) break; if (!bad.has(o)) { bad.add(o); out.push(o); } }
  return shuffle(out);
}
const short = (t: string, n: number) => [...t].length <= n;
const untiled = (pairs: Pair[]) => pairs.filter(p => !p.tiles);
/** can this game be played with these pairs? */
export function playable(g: GameId, pairs: Pair[]): boolean {
  if (pairs.length < 3) return false;
  if (g === "flip") return true;
  if (g === "build") return pairs.filter(p => p.tiles ? p.tiles.length >= 2 : p.aSa && aksharas(p.a).length >= 2 && aksharas(p.a).length <= 9).length >= 3;
  const plain = untiled(pairs);                       // word-tile items are only for building
  if (g === "match") return plain.filter(p => short(p.q, 26) && short(p.a, 26)).length >= 4;
  if (g === "fall") return plain.filter(p => short(p.a, 24)).length >= 3;
  return plain.length >= 3;
}
const starsFor = (good: number, total: number) => { const r = total ? good / total : 0; return r >= .9 ? 3 : r >= .7 ? 2 : r > 0 ? 1 : 0; };

/** Devanāgarī syllables (akṣaras): रामः → रा मः; अगच्छत् → अ ग च्छ त् */
const AK = /(?:[क-हक़-य़]़?्)*[क-हक़-य़]़?(?:[ा-ौॢॣ]|्)?[ऀ-ः]?|[अ-औॠॡ][ऀ-ः]?|\S/gu;
export const aksharas = (t: string): string[] => t.match(AK) ?? [];

/** text that may be Sanskrit (shown in the reader's script, bigger) or a meaning */
const T: React.FC<{ t: string; sa: boolean; className?: string }> = ({ t, sa, className = "" }) => {
  const S = useSaDeva();
  return sa ? <span className={`ks-l-sa ${className}`}>{S(t)}</span> : <span className={className} dir="auto">{t}</span>;
};
const SayBtn: React.FC<{ t: string }> = ({ t }) =>
  <button className="pk-say" onClick={e => { e.stopPropagation(); speak(t); }} aria-label={`Listen: ${t}`}>🔊</button>;
/** the small lines under a question */
const Sub: React.FC<{ p: Pair }> = ({ p }) => {
  const S = useSaDeva();
  return p.sub?.length ? <span className="pk-sub">{p.sub.map((l, i) => <span key={i} className={isDevaText(l) ? "ks-l-sa" : ""} dir="auto">{isDevaText(l) ? S(l) : l}</span>)}</span> : null;
};
const isDevaText = (t: string) => /[\u0900-\u097F]/.test(t);
const sayOf = (p: Pair, side: "q" | "a") => p.say ?? (side === "q" ? (p.qSa ? p.q : "") : (p.aSa ? p.a : ""));

/** a small burst of colour where something went right */
export const Burst: React.FC<{ n: number }> = ({ n }) => n ? (
  <span className="pk-burst" key={n} aria-hidden="true">
    {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ "--a": `${i * 30}deg`, "--c": ["#f97316", "#8b5cf6", "#06b6d4", "#16a34a", "#eab308", "#ec4899"][i % 6] } as React.CSSProperties} />)}
  </span>) : null;

/** floating "+10" */
const Pop: React.FC<{ text: string; n: number }> = ({ text, n }) => n ? <span key={n} className="pk-pop" aria-hidden="true">{text}</span> : null;

// ═══ 1 · स्मरणपत्राणि — flip cards ═══
export const FlipCards: React.FC<GameProps> = ({ pairs, onEnd }) => {
  const [queue, setQueue] = useState(() => shuffle(pairs.map((_, i) => i)));
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [known, setKnown] = useState(0);
  const [n, setN] = useState(0);
  const cur = queue[0];
  const p = pairs[cur];
  const done = (knew: boolean) => {
    if (knew) { setKnown(k => k + 1); play(sfx.correct); setN(x => x + 1); }
    const m = knew ? missed : new Set(missed).add(cur);
    if (!knew) setMissed(m);
    const rest = knew ? queue.slice(1) : [...queue.slice(1), cur];
    setFlipped(false);
    if (!rest.length) { const first = pairs.length - m.size; onEnd(starsFor(first, pairs.length), `${first} of ${pairs.length} known the first time`); return; }
    setQueue(rest);
  };
  if (!p) return null;
  return (
    <div className="pk-flipgame">
      <div className="pk-meta"><span>{known} / {pairs.length} ✓</span><span>{queue.length} left</span></div>
      <div className={`pk-card ${flipped ? "flipped" : ""}`} key={`${cur}-${queue.length}`} onClick={() => setFlipped(f => !f)}
        role="button" tabIndex={0} onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(f => !f); } }}
        aria-label={flipped ? "Card turned: answer showing" : "Tap to turn the card"}>
        <div className="pk-face pk-front"><T t={p.q} sa={p.qSa} className="pk-big" />{sayOf(p, "q") && <SayBtn t={sayOf(p, "q")} />}<Sub p={p} /><small>tap to turn ↻</small></div>
        <div className="pk-face pk-back"><T t={p.a} sa={p.aSa} className="pk-big" />{sayOf(p, "a") && <SayBtn t={sayOf(p, "a")} />}
          {p.alts && p.alts.length > 1 && <small className="ks-l-sa">also: {p.alts.filter(x => x !== p.a).join(", ")}</small>}</div>
        <Burst n={n} />
      </div>
      <div className="pk-row">
        {flipped
          ? <><button className="pk-btn ghost" onClick={() => done(false)}>↺ पुनः · Again</button><button className="pk-btn" onClick={() => done(true)}>✓ जानामि · I knew it</button></>
          : <button className="pk-btn" onClick={() => setFlipped(true)}>↻ उत्तरम् · Turn</button>}
      </div>
    </div>
  );
};

// ═══ 2 · युग्मानि — memory pairs ═══
export const MemoryPairs: React.FC<GameProps> = ({ pairs, onEnd }) => {
  const set = useMemo(() => {
    const out: Pair[] = []; const qs = new Set<string>(); const as = new Set<string>();
    for (const p of shuffle(untiled(pairs).filter(x => short(x.q, 26) && short(x.a, 26)))) { if (out.length >= 6) break; if (!qs.has(p.q) && !as.has(p.a)) { qs.add(p.q); as.add(p.a); out.push(p); } }
    return out;
  }, [pairs]);
  const tiles = useMemo(() => shuffle(set.flatMap((p, i) => [{ k: `q${i}`, i, t: p.q, sa: p.qSa }, { k: `a${i}`, i, t: p.a, sa: p.aSa }])), [set]);
  const [open, setOpen] = useState<string[]>([]);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [turns, setTurns] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [n, setN] = useState(0);
  const lock = useRef(false);
  const click = (k: string) => {
    if (lock.current || open.includes(k)) return;
    const tile = tiles.find(x => x.k === k)!; if (solved.has(tile.i)) return;
    const o = [...open, k]; setOpen(o);
    if (o.length < 2) return;
    setTurns(t => t + 1);
    const [a, b] = o.map(x => tiles.find(y => y.k === x)!);
    if (a.i === b.i) {
      const s = new Set(solved).add(a.i); setSolved(s); setOpen([]); setN(x => x + 1); play(sfx.correct);
      if (s.size === set.length) setTimeout(() => {
        const extra = turns + 1 - set.length;
        onEnd(extra <= 2 ? 3 : extra <= 6 ? 2 : 1, `${set.length} pairs in ${turns + 1} turns`);
      }, 700);
    } else {
      lock.current = true; setWrong(true); play(sfx.wrong);
      setTimeout(() => { setOpen([]); setWrong(false); lock.current = false; }, 1000);
    }
  };
  return (
    <div className="pk-memory">
      <div className="pk-meta"><span>{solved.size} / {set.length} pairs</span><span>{turns} turns</span></div>
      <div className="pk-grid">
        {tiles.map(x => {
          const up = open.includes(x.k) || solved.has(x.i);
          return (
            <button key={x.k} className={`pk-tile ${up ? "up" : ""} ${solved.has(x.i) ? "solved" : ""} ${wrong && open.includes(x.k) ? "nope" : ""}`}
              onClick={() => click(x.k)} aria-label={up ? x.t : "hidden card"}>
              <span className="pk-tback" aria-hidden="true">ॐ</span>
              <span className="pk-tface"><T t={x.t} sa={x.sa} /></span>
            </button>);
        })}
      </div>
      <Burst n={n} />
    </div>
  );
};

// ═══ 3 · शीघ्रचयनम् — as many as you can in a minute ═══
export const QuickChoice: React.FC<GameProps> = ({ pairs: all, onEnd }) => {
  const SECS = 60;
  const pairs = useMemo(() => untiled(all), [all]);
  const order = useRef<number[]>([]);
  const nextIdx = () => { if (!order.current.length) order.current = shuffle(pairs.map((_, i) => i)); return order.current.pop()!; };
  const [cur, setCur] = useState(nextIdx);
  const opts = useMemo(() => choices(pairs[cur], pairs), [cur, pairs]);
  const [left, setLeft] = useState(SECS);
  const [score, setScore] = useState(0);
  const [good, setGood] = useState(0);
  const [tries, setTries] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [pop, setPop] = useState({ t: "", n: 0 });
  const ended = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left <= 0 && !ended.current) {
      ended.current = true; play(sfx.levelUp);
      onEnd(good >= 15 && good / Math.max(tries, 1) >= .8 ? 3 : good >= 8 ? 2 : good >= 1 ? 1 : 0, `${good} right of ${tries} · ${score} points`);
    }
  }, [left, good, tries, score, onEnd]);
  const p = pairs[cur];
  const pickIt = (o: string) => {
    if (picked || left <= 0) return;
    setPicked(o); setTries(t => t + 1);
    if (isRight(p, o)) {
      const s = streak + 1; const pts = 10 + Math.min(s - 1, 5) * 2;
      setStreak(s); setGood(g => g + 1); setScore(x => x + pts); setPop({ t: s >= 3 ? `+${pts} 🔥${s}` : `+${pts}`, n: pop.n + 1 });
      play(s >= 3 && s % 3 === 0 ? sfx.streak : sfx.correct);
      setTimeout(() => { setPicked(null); setCur(nextIdx()); }, 350);
    } else {
      setStreak(0); play(sfx.wrong);
      setTimeout(() => { setPicked(null); setCur(nextIdx()); }, 1100);
    }
  };
  return (
    <div className="pk-quick">
      <div className="pk-meta"><span>⏱ {Math.max(left, 0)}s</span><span>✓ {good}</span><span>★ {score}</span></div>
      <div className="pk-timer"><span style={{ width: `${100 * Math.max(left, 0) / SECS}%` }} className={left <= 10 ? "low" : ""} /></div>
      <div className="pk-ask" key={`${cur}-${tries}`}><T t={p.q} sa={p.qSa} className="pk-big" />{sayOf(p, "q") && <SayBtn t={sayOf(p, "q")} />}<Sub p={p} /><Pop text={pop.t} n={pop.n} /></div>
      <div className="pk-opts">
        {opts.map(o => (
          <button key={o} disabled={!!picked} onClick={() => pickIt(o)}
            className={`pk-opt ${!picked ? "" : isRight(p, o) ? "ok" : o === picked ? "bad" : "dim"}`}><T t={o} sa={p.aSa} /></button>))}
      </div>
    </div>
  );
};

// ═══ 4 · पतन्ति पदानि — catch the right answer before it lands ═══
export const FallingWords: React.FC<GameProps> = ({ pairs, onEnd }) => {
  const rounds = useMemo(() => shuffle(untiled(pairs).filter(p => short(p.a, 24))).slice(0, 10), [pairs]);
  const [r, setR] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [good, setGood] = useState(0);
  const [state, setState] = useState<"play" | "hit" | "miss">("play");
  const [gone, setGone] = useState<Set<string>>(new Set());
  const [n, setN] = useState(0);
  const p = rounds[r];
  const opts = useMemo(() => p ? choices(p, untiled(pairs)) : [], [p, pairs]);
  const lanes = useMemo(() => shuffle([6, 30, 54, 78]), [r]);   // eslint-disable-line react-hooks/exhaustive-deps
  const speed = Math.max(4.2, 8 - r * 0.4);
  const finish = (g: number, h: number, last: number) =>
    onEnd(h <= 0 ? (g ? 1 : 0) : starsFor(g, rounds.length), h <= 0 ? `out of hearts after ${last} words · ${g} caught` : `${g} of ${rounds.length} caught · ${"❤️".repeat(h)}`);
  const advance = (g: number, h: number) => {
    setTimeout(() => {
      if (h <= 0 || r + 1 >= rounds.length) { finish(g, h, r + 1); return; }
      setR(r + 1); setState("play"); setGone(new Set());
    }, 900);
  };
  const hit = (o: string) => {
    if (state !== "play") return;
    if (isRight(p, o)) { const g = good + 1; setGood(g); setState("hit"); setN(x => x + 1); play(sfx.correct); advance(g, hearts); }
    else { setGone(s => new Set(s).add(o)); const h = hearts - 1; setHearts(h); play(sfx.wrong); if (h <= 0) { setState("miss"); advance(good, h); } }
  };
  const landed = () => { if (state !== "play") return; const h = hearts - 1; setHearts(h); setState("miss"); play(sfx.wrong); advance(good, h); };
  if (!p) return null;
  return (
    <div className="pk-fall">
      <div className="pk-meta"><span>{r + 1} / {rounds.length}</span><span>✓ {good}</span><span aria-label={`${hearts} hearts`}>{"❤️".repeat(Math.max(hearts, 0))}{"🤍".repeat(3 - Math.max(hearts, 0))}</span></div>
      <div className="pk-ask"><T t={p.q} sa={p.qSa} className="pk-big" />{sayOf(p, "q") && <SayBtn t={sayOf(p, "q")} />}<Sub p={p} /></div>
      <div className={`pk-sky ${state}`}>
        {opts.map((o, k) => {
          const right = isRight(p, o);
          if (gone.has(o) || (state !== "play" && !right)) return null;
          return (
            <button key={`${r}-${o}`} className={`pk-drop ${state !== "play" && right ? state : ""}`}
              style={{ left: `${lanes[k]}%`, animationDuration: `${speed}s`, animationDelay: `${k * 0.35}s` }}
              onClick={() => hit(o)} onAnimationEnd={right ? landed : undefined}><T t={o} sa={p.aSa} /></button>);
        })}
        <div className="pk-ground" />
        <Burst n={n} />
      </div>
    </div>
  );
};

// ═══ 5 · रचयत — build the answer syllable by syllable ═══
export const BuildWord: React.FC<GameProps> = ({ pairs, onEnd }) => {
  const S = useSaDeva();
  const rounds = useMemo(() => shuffle(pairs.filter(p => p.tiles ? p.tiles.length >= 2 : p.aSa && aksharas(p.a).length >= 2 && aksharas(p.a).length <= 9)).slice(0, 8), [pairs]);
  const [r, setR] = useState(0);
  const [built, setBuilt] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<"" | "ok" | "bad">("");
  const [good, setGood] = useState(0);
  const [n, setN] = useState(0);
  const p = rounds[r];
  const tiles = useMemo(() => {
    if (!p) return [];
    if (p.tiles) { let t = shuffle([...p.tiles]); for (let k = 0; k < 6 && t.join(" ") === p.tiles.join(" "); k++) t = shuffle([...p.tiles]); return t; }
    const own = aksharas(p.a);
    const others = shuffle(rounds.filter(x => x !== p).flatMap(x => aksharas(x.a))).filter(x => !own.includes(x));
    return shuffle([...own, ...[...new Set(others)].slice(0, 2)]);
  }, [p, rounds]);
  if (!rounds.length) return <p className="ks-note-plain">This set has no Sanskrit answers to build. Choose another mode.</p>;
  const need = p.tiles ? p.tiles.length : aksharas(p.a).length;
  const sep = p.tiles ? " " : "";
  const add = (k: number) => {
    if (verdict || built.includes(k)) return;
    const b = [...built, k]; setBuilt(b);
    if (b.length === need) {
      const word = b.map(x => tiles[x]).join(sep);
      const ok = isRight(p, word);
      setVerdict(ok ? "ok" : "bad");
      if (ok) { setGood(g => g + 1); setN(x => x + 1); play(sfx.correct); speak(p.say ?? p.a); } else play(sfx.wrong);
      setTimeout(() => {
        const g = good + (ok ? 1 : 0);
        if (r + 1 >= rounds.length) { onEnd(starsFor(g, rounds.length), `${g} of ${rounds.length} built correctly`); return; }
        setR(r + 1); setBuilt([]); setVerdict("");
      }, ok ? 1000 : 1800);
    }
  };
  return (
    <div className="pk-build">
      <div className="pk-meta"><span>{r + 1} / {rounds.length}</span><span>✓ {good}</span></div>
      <div className="pk-ask"><T t={p.q} sa={p.qSa} className="pk-big" />{sayOf(p, "q") && <SayBtn t={sayOf(p, "q")} />}<Sub p={p} /></div>
      <div className={`pk-slots ${verdict} ${p.tiles ? "words" : ""}`}>
        {Array.from({ length: need }, (_, i) => <span key={i} className={`pk-slot ${built[i] !== undefined ? "full" : ""}`}><span className="ks-l-sa">{built[i] !== undefined ? S(tiles[built[i]]) : ""}</span></span>)}
        <Burst n={n} />
      </div>
      {verdict === "bad" && <p className="pk-answer">उत्तरम् · <span className="ks-l-sa">{S(p.a)}</span></p>}
      <div className="pk-tiles">
        {tiles.map((t, k) => <button key={k} className={`pk-ak ks-l-sa ${p.tiles ? "word" : ""}`} disabled={built.includes(k) || !!verdict} onClick={() => add(k)}>{S(t)}</button>)}
      </div>
      <div className="pk-row">{built.length > 0 && !verdict && <button className="pk-btn ghost" onClick={() => setBuilt(built.slice(0, -1))}>↶ undo</button>}</div>
    </div>
  );
};

export const GAMES: { id: GameId; icon: string; sa: string; en: string; blurb: string; C: React.FC<GameProps>; needsSa?: boolean }[] = [
  { id: "flip",  icon: "🃏", sa: "स्मरणपत्राणि", en: "Flip cards",     blurb: "Turn each card, say if you knew it; missed cards come back.", C: FlipCards },
  { id: "match", icon: "🧩", sa: "युग्मानि",     en: "Memory pairs",   blurb: "Find the matching pairs among hidden cards.",                C: MemoryPairs },
  { id: "quick", icon: "⚡", sa: "शीघ्रचयनम्",   en: "One-minute race", blurb: "As many right answers as you can in 60 seconds.",          C: QuickChoice },
  { id: "fall",  icon: "🌧️", sa: "पतन्ति पदानि", en: "Falling words",   blurb: "Catch the right answer before it lands. Three hearts.",    C: FallingWords },
  { id: "build", icon: "🧱", sa: "रचयत",        en: "Build it",        blurb: "Put the syllables together to make the Sanskrit answer.",  C: BuildWord, needsSa: true },
];
