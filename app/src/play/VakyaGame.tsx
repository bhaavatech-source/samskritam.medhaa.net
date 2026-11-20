// ═══════════════════════════════════════════════════════════════
//  play/VakyaGame.tsx — वाक्यरचना · Sentences, the third tab of क्रीडाङ्गणम्.
//    वर्धय  Grow:  a 3-word sentence grows to 10 / 20 / 30 / 40 words; the learner chooses what to add and
//                  picks the right form of every new word (and of the verb again when the doers change)
//    रचय    Build: put a sentence together from word tiles (with a few wrong forms among them); any
//                  correct order is accepted
//    शोधय   Fix:   one word of a sentence has a wrong form — find it, then choose the right one
//  The engine and every rule are in play/vakya.ts; the forms in app/src/data/vakya.json (tools/build_vakya.py).
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import { shuffle } from "../data";
import { useSaDeva } from "../i18n/script";
import { speak } from "../speech";
import { Burst } from "./kit";
import { Engine, orderOk, write, wrongForms, wrongVerb, type Sentence, type Tok, type VakyaData, type Node } from "./vakya";
import vakyaUrl from "../data/vakya.json?url";

let dataP: Promise<VakyaData> | null = null;
const loadData = () => (dataP ??= fetch(vakyaUrl).then(r => r.json()));
type Mode = "grow" | "build" | "fix";
const MODES: { id: Mode; icon: string; sa: string; en: string; blurb: string }[] = [
  { id: "grow", icon: "🌱", sa: "वर्धय", en: "Grow a sentence", blurb: "Start with three words and keep adding — a place, a time, an owner, a friend, an earlier action, a when-clause… — up to 40 words. You pick the right form of every new word." },
  { id: "build", icon: "🧩", sa: "रचय", en: "Build it", blurb: "Read the meaning and put the sentence together from word tiles. A few tiles are wrong forms. Phrases may go in any order." },
  { id: "fix", icon: "🔍", sa: "शोधय", en: "Find the mistake", blurb: "One word has a wrong form: a wrong case, number or person. Find it and correct it." },
];
const GROW_T = [10, 20, 30, 40];
const LEN: [string, number, number][] = [["३–५", 3, 5], ["६–१०", 6, 10], ["११–२०", 11, 20], ["२१–३०", 21, 30], ["३०+", 30, 42]];
const ROUNDS = 5;

export const VakyaGame: React.FC = () => {
  const [D, setD] = useState<VakyaData | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [lv, setLv] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => { loadData().then(setD); }, []);
  const E = useMemo(() => (D ? new Engine(D) : null), [D]);
  if (!E) return <p className="pk-h">लोड् भवति · Loading…</p>;
  if (!mode) return (
    <div className="vk">
      <p className="vk-intro">Make Sanskrit sentences from 3 to 40 words. Every form comes from the site's checked tables; the game only puts each word in the case, gender, number, person and tense its place in the sentence needs. Words are written apart (as in teaching), with ं for म् before a consonant.</p>
      <div className="pk-modes">{MODES.map(m => (
        <button key={m.id} className="pk-mode" onClick={() => { setMode(m.id); setLv(m.id === "fix" ? 1 : 0); }}>
          <span className="pk-aicon">{m.icon}</span><b className="ks-l-sa">{m.sa}</b><span>{m.en}</span><small>{m.blurb}</small></button>))}</div>
    </div>
  );
  const levels = mode === "grow" ? GROW_T.map(t => `≤ ${t}`) : LEN.map(l => l[0]).filter((_, i) => mode === "build" || i > 0);
  return (
    <div className="vk">
      <div className="pk-gamebar">
        <button className="pk-btn ghost" onClick={() => setMode(null)}>← वाक्यरचना</button>
        <span className="pk-what ks-l-sa">{MODES.find(m => m.id === mode)!.icon} {MODES.find(m => m.id === mode)!.sa} · {MODES.find(m => m.id === mode)!.en}</span>
        <span className="vk-lv">{levels.map((l, i) => {
          const k = mode === "fix" ? i + 1 : i;
          return <button key={l} className={lv === k ? "on" : ""} onClick={() => { setLv(k); setRun(r => r + 1); }}>{mode === "grow" ? `${l} words` : l}</button>;
        })}</span>
      </div>
      {mode === "grow" ? <Grow key={`${lv}.${run}`} E={E} target={GROW_T[lv]} onAgain={() => setRun(r => r + 1)} />
        : mode === "build" ? <Build key={`${lv}.${run}`} E={E} min={LEN[lv][1]} max={LEN[lv][2]} onAgain={() => setRun(r => r + 1)} />
        : <Fix key={`${lv}.${run}`} E={E} min={LEN[lv][1]} max={LEN[lv][2]} onAgain={() => setRun(r => r + 1)} />}
    </div>
  );
};

// ── shared bits ──
const Meaning: React.FC<{ en: string }> = ({ en }) => <p className="vk-en">🗣️ {en}</p>;
const Said: React.FC<{ ws: string[] }> = ({ ws }) => {
  const S = useSaDeva();
  return <button className="vk-say" onClick={() => speak(write(ws))} title="Listen">🔊 <span className="ks-l-sa">{S(write(ws))}</span></button>;
};
/** options for one word: its right form and wrong forms of the same word */
export function optionsFor(E: Engine, t: Tok, n = 4): string[] {
  let bad: string[];
  if (t.kind === "verb" && !t.table) {      // -त्वा / -तुम्: other forms of the same root
    const v = E.D.verbs.find(x => x.key === t.stem)!;
    bad = [v.ktvaF, v.tumF, v.f.lat[0], v.f.lan[0]].map(c => c.split("|")[0]).filter(f => !t.ok.includes(f));
  } else if (t.kind === "verb") bad = wrongVerb(t, E.D.verbs.find(x => x.key === t.stem), n - 1);
  else bad = wrongForms(t, n - 1);
  return shuffle([t.w, ...shuffle([...new Set(bad)]).slice(0, n - 1)]);
}
const ROLE: Record<string, string> = { subj: "the doer", and: "a second doer", obj: "the object", objAnd: "a second object", loc: "where", src: "from where",
  rec: "to whom", inst: "with what", com: "together with", poss: "whose", adj: "describing word", verb: "the verb", tum: "object of the purpose",
  tumV: "the purpose", yah: "who (यः)", sah: "he / she / it (सः)" };
function roleOf(slot: string): string {
  const p = slot.split(".");
  for (const k of [...p].reverse()) { const b = k.replace(/\d+$/, ""); if (b.startsWith("ktvaV")) return "an earlier action"; if (b.startsWith("ktvaloc")) return "where (earlier action)"; if (b.startsWith("ktva")) return "object of the earlier action"; if (ROLE[b]) return ROLE[b]; }
  return "";
}

// ═══ वर्धय · Grow ═══
type Pick = { slot: string; tok: Tok; opts: string[] };
export const Grow: React.FC<{ E: Engine; target: number; onAgain: () => void }> = ({ E, target, onAgain }) => {
  const S_ = useSaDeva();
  const [S] = useState<Sentence>(() => E.make(3, 4));
  const [, force] = useState(0);
  const [queue, setQueue] = useState<Pick[]>(() => E.flat(E.tree(S)).filter(t => t.kind !== "avy").map(t => ({ slot: t.slot, tok: t, opts: optionsFor(E, t) })));
  const [done, setDone] = useState<Set<string>>(() => new Set(E.flat(E.tree(S)).filter(t => t.kind === "avy").map(t => t.slot)));
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, all: 0 });
  const [burst, setBurst] = useState(0);
  const [choices, setChoices] = useState<{ id: string; label: string; run: () => boolean }[]>([]);
  const toks = E.flat(E.tree(S)); const ws = toks.map(t => t.w);
  const [full, setFull] = useState(false);   // nothing more fits this sentence
  const n = toks.length; const finished = (n >= target || full) && !queue.length;
  const pick = queue[0];
  const [failed] = useState(() => new Set<string>());   // additions that found no fitting word
  const refill = () => {
    const ops = shuffle(E.ops(S)).filter(o => !failed.has(o.id)); const seen = new Set<string>(); const out = [];
    for (const o of ops) { if (seen.has(o.label)) continue; seen.add(o.label); out.push(o); if (out.length >= 3) break; }
    setChoices(out);
    if (!out.length) setFull(true);
  };
  useEffect(() => { if (!queue.length && !finished) refill(); }, [queue.length, finished, n]);   // eslint-disable-line react-hooks/exhaustive-deps
  const grow = (o: { id: string; run: () => boolean }) => {
    const before = new Map(toks.map(t => [t.slot, t.w]));
    if (!o.run()) { failed.add(o.id); const rest = choices.filter(x => x !== o); if (rest.length) setChoices(rest); else refill(); return; }
    failed.clear();
    const after = E.flat(E.tree(S));
    const changed = after.filter(t => before.get(t.slot) !== t.w);
    const q = changed.filter(t => t.kind !== "avy").map(t => ({ slot: t.slot, tok: t, opts: optionsFor(E, t) }));
    setDone(d => { const x = new Set(d); changed.forEach(t => (t.kind === "avy" ? x.add(t.slot) : x.delete(t.slot))); return x; });
    setFresh(new Set(changed.map(t => t.slot)));
    setQueue(q); setChoices([]); force(k => k + 1);
  };
  const answer = (o: string) => {
    if (chosen) return;
    setChosen(o);
    const ok = pick.tok.ok.includes(o);
    setScore(s => ({ ok: s.ok + (ok ? 1 : 0), all: s.all + 1 }));
    if (ok) setBurst(b => b + 1);
  };
  const next = () => { setDone(d => new Set(d).add(pick.slot)); setQueue(q => q.slice(1)); setChosen(null); };
  return (
    <div className="vk-stage">
      <div className="vk-meter"><span style={{ width: `${Math.min(100, n / target * 100)}%` }} /><b>{n} / {target}</b></div>
      <div className="vk-sent">{toks.map((t, i) => {
        const shown = done.has(t.slot) && !(pick && pick.slot === t.slot);
        return <span key={t.slot + i} className={`vk-w ks-l-sa ${shown ? "" : "q"} ${pick?.slot === t.slot ? "now" : ""} ${fresh.has(t.slot) && shown ? "new" : ""}`}>
          {shown ? S_(i < ws.length - 1 && t.w.endsWith("म्") && !/^[अआइईउऊऋएऐओऔ]/.test(ws[i + 1]) ? t.w.slice(0, -2) + "ं" : t.w) : "?"}</span>;
      })}<span className="vk-w end">।</span></div>
      <Meaning en={E.english(S)} />
      {pick ? (
        <div className="vk-pick" key={pick.slot + score.all}>
          <p className="vk-ask"><b className="ks-l-sa">{S_(pick.tok.stem ?? "")}</b> · {roleOf(pick.slot)} — which form?</p>
          <div className="vk-opts">{pick.opts.map(o => (
            <button key={o} disabled={!!chosen} onClick={() => answer(o)}
              className={`vk-opt ks-l-sa ${!chosen ? "" : pick.tok.ok.includes(o) ? "ok" : o === chosen ? "bad" : "dim"}`}>{S_(o)}</button>))}</div>
          {chosen && <>
            <p className={`vk-why ${pick.tok.ok.includes(chosen) ? "ok" : "bad"}`}>{pick.tok.ok.includes(chosen) ? "साधु! " : <>उत्तरम् <b className="ks-l-sa">{S_(pick.tok.w)}</b> · </>}<span className="ks-l-sa">{S_(pick.tok.why)}</span></p>
            <div className="pk-row"><button className="pk-btn" onClick={next}>अग्रे · Next</button></div>
          </>}
        </div>
      ) : finished ? (
        <div className="vk-done">
          <Burst n={burst} />
          <h3 className="ks-l-sa">{S_("उत्तमम्!")} {n} words{n < target ? " — nothing more fits this sentence" : ""}</h3>
          <Said ws={ws} />
          <p>{score.ok} / {score.all} forms right at the first try.</p>
          <div className="pk-row"><button className="pk-btn" onClick={onAgain}>पुनः · New sentence</button></div>
        </div>
      ) : (
        <div className="vk-grow">
          <p className="vk-ask">What shall we add?</p>
          <div className="vk-opts">{choices.map(o => <button key={o.id} className="vk-add" onClick={() => grow(o)}>＋ {o.label}</button>)}
</div>
          <Said ws={ws} />
        </div>
      )}
    </div>
  );
};

// ═══ रचय · Build ═══
export const Build: React.FC<{ E: Engine; min: number; max: number; onAgain: () => void }> = ({ E, min, max, onAgain }) => {
  const S_ = useSaDeva();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [item, setItem] = useState(() => makeBuild(E, min, max));
  const [placed, setPlaced] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<null | { ok: boolean; msg: string }>(null);
  const [tries, setTries] = useState(0);
  const [burst, setBurst] = useState(0);
  if (round >= ROUNDS) return (
    <div className="vk-done"><h3>{score} / {ROUNDS}</h3><div className="pk-row"><button className="pk-btn" onClick={onAgain}>पुनः · Play again</button></div></div>
  );
  const ws = placed.map(i => item.tiles[i]);
  const check = () => {
    const ok = orderOk(item.tree, ws);
    setTries(t => t + 1);
    if (ok) { setVerdict({ ok: true, msg: "साधु! A correct sentence." }); if (!tries) { setScore(s => s + 1); setBurst(b => b + 1); } return; }
    const wrong = ws.find(w => item.bad.has(w) && !item.words.includes(w));
    const msg = wrong ? `${wrong} is not right here: ${item.fixOf[wrong]}` : ws.length < item.words.length ? `${item.words.length - ws.length} more word(s) needed.`
      : "Some words of one phrase are apart: an adjective stays with its noun, X with सह, an object with its …-त्वा, the words joined by च, and यदा / यः come first.";
    setVerdict({ ok: false, msg });
  };
  const nextRound = () => { setRound(r => r + 1); setItem(makeBuild(E, min, max)); setPlaced([]); setVerdict(null); setTries(0); };
  return (
    <div className="vk-stage">
      <div className="pk-meta"><span>{round + 1} / {ROUNDS}</span><span>✓ {score}</span></div>
      <Meaning en={item.en} />
      <div className="vk-sent vk-answer">{placed.length ? placed.map((i, k) => (
        <button key={k} className="vk-w ks-l-sa" onClick={() => { if (!verdict?.ok) { setPlaced(p => p.filter((_, j) => j !== k)); setVerdict(null); } }}>{S_(item.tiles[i])}</button>))
        : <span className="vk-hint">Tap the words in order…</span>}</div>
      <div className="vk-tiles">{item.tiles.map((t, i) => (
        <button key={i} className="vk-tile ks-l-sa" disabled={placed.includes(i) || !!verdict?.ok} onClick={() => { setPlaced(p => [...p, i]); setVerdict(null); }}>{S_(t)}</button>))}</div>
      {verdict && <p className={`vk-why ${verdict.ok ? "ok" : "bad"}`}><span className="ks-l-sa">{S_(verdict.msg)}</span></p>}
      <div className="pk-row">
        {!verdict?.ok && <button className="pk-btn" disabled={!placed.length} onClick={check}>परीक्षस्व · Check</button>}
        {!verdict?.ok && tries >= 2 && <button className="pk-btn ghost" onClick={() => {
          const used = new Set<number>();
          setPlaced(item.words.map(w => { const i = item.tiles.findIndex((t, j) => t === w && !used.has(j)); used.add(i); return i; }));
          setVerdict({ ok: true, msg: "One correct order is shown." });
        }}>उत्तरम् · Show</button>}
        {verdict?.ok && <><Said ws={item.words} /><button className="pk-btn" onClick={nextRound}>अग्रे · Next</button></>}
      </div>
      <Burst n={burst} />
    </div>
  );
};
export function makeBuild(E: Engine, min: number, max: number) {
  const S = E.make(min, max); const tree = E.tree(S); const toks = E.flat(tree); const words = toks.map(t => t.w);
  const infl = shuffle(toks.filter(t => t.kind !== "avy"));
  const k = Math.min(infl.length, Math.max(2, Math.ceil(words.length / 5)));
  const bad = new Set<string>(); const fixOf: Record<string, string> = {};
  for (const t of infl.slice(0, k)) {
    const o = optionsFor(E, t).filter(x => !t.ok.includes(x) && !words.includes(x));
    if (o.length) { bad.add(o[0]); fixOf[o[0]] = `${t.w} (${t.why})`; }
  }
  return { S, tree: tree as Node, words, en: E.english(S), tiles: shuffle([...words, ...bad]), bad, fixOf };
}

// ═══ शोधय · Fix ═══
export const Fix: React.FC<{ E: Engine; min: number; max: number; onAgain: () => void }> = ({ E, min, max, onAgain }) => {
  const S_ = useSaDeva();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [item, setItem] = useState(() => makeFix(E, min, max));
  const [found, setFound] = useState<number | null>(null);
  const [miss, setMiss] = useState<number | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  if (round >= ROUNDS) return (
    <div className="vk-done"><h3>{score} / {ROUNDS}</h3><div className="pk-row"><button className="pk-btn" onClick={onAgain}>पुनः · Play again</button></div></div>
  );
  const tap = (i: number) => {
    if (found !== null) return;
    if (i === item.at) { setFound(i); setMiss(null); } else setMiss(i);
  };
  const choose = (o: string) => {
    if (chosen) return; setChosen(o);
    if (item.tok.ok.includes(o) && miss === null) { setScore(s => s + 1); setBurst(b => b + 1); }
  };
  const nextRound = () => { setRound(r => r + 1); setItem(makeFix(E, min, max)); setFound(null); setMiss(null); setChosen(null); };
  return (
    <div className="vk-stage">
      <div className="pk-meta"><span>{round + 1} / {ROUNDS}</span><span>✓ {score}</span></div>
      <Meaning en={item.en} />
      <p className="vk-ask">{found === null ? "Tap the word with the wrong form." : "Choose the right form."}</p>
      <div className="vk-sent">{item.shown.map((w, i) => (
        <button key={i} className={`vk-w ks-l-sa ${i === found ? "now" : ""} ${i === miss ? "miss" : ""}`} onClick={() => tap(i)}>
          {S_(i === found && chosen && item.tok.ok.includes(chosen) ? item.tok.w : w)}</button>))}<span className="vk-w end">।</span></div>
      {miss !== null && found === null && <p className="vk-why bad"><span className="ks-l-sa">{S_(item.shown[miss])}</span> is right: <span className="ks-l-sa">{S_(item.toks[miss].why)}</span></p>}
      {found !== null && <div className="vk-opts">{item.opts.map(o => (
        <button key={o} disabled={!!chosen} onClick={() => choose(o)} className={`vk-opt ks-l-sa ${!chosen ? "" : item.tok.ok.includes(o) ? "ok" : o === chosen ? "bad" : "dim"}`}>{S_(o)}</button>))}</div>}
      {chosen && <>
        <p className={`vk-why ${item.tok.ok.includes(chosen) ? "ok" : "bad"}`}><b className="ks-l-sa">{S_(item.tok.w)}</b> · <span className="ks-l-sa">{S_(item.tok.why)}</span></p>
        <div className="pk-row"><Said ws={item.toks.map(t => t.w)} /><button className="pk-btn" onClick={nextRound}>अग्रे · Next</button></div>
      </>}
      <Burst n={burst} />
    </div>
  );
};
/** one mistake that only the meaning or agreement can catch: a verb in the wrong person/number, an adjective
 *  that does not agree, a noun (without an adjective, not a doer) in the wrong case, यः/सः not agreeing, -त्वा ↔ -तुम् */
export function makeFix(E: Engine, min: number, max: number) {
  for (let t = 0; t < 50; t++) {
    const S = E.make(min, max); const toks = E.flat(E.tree(S));
    const cands = toks.map((x, i) => [x, i] as const).filter(([x, i]) => {
      if (x.kind === "verb") return true;
      if (x.kind === "adj" || x.kind === "pron") return !!x.table;
      if (x.kind === "noun") return !/subj$|and$/.test(x.slot) && !(toks[i - 1]?.kind === "adj" && toks[i - 1].slot === x.slot + ".adj");
      return false;
    });
    if (!cands.length) continue;
    const [tok, at] = cands[Math.floor(Math.random() * cands.length)];
    let wrong: string[];
    if (tok.kind === "verb" && tok.table) wrong = wrongVerb(tok, E.D.verbs.find(v => v.key === tok.stem), 3).filter((_, i, a) => i < a.length);
    else if (tok.kind === "verb") { const v = E.D.verbs.find(x => x.key === tok.stem)!; wrong = [tok.slot.includes("tumV") ? v.ktvaF : v.tumF].map(c => c.split("|")[0]); }
    else wrong = wrongForms(tok, 3, tok.kind === "noun" ? "case" : undefined);
    // a verb's mistake must be in person or number (same tense), so the doer shows it
    if (tok.kind === "verb" && tok.table) { const v = E.D.verbs.find(x => x.key === tok.stem)!; const tense = Object.keys(v.f).find(k => v.f[k].some(c => c.split("|").some(a => tok.ok.includes(a))))!;
      wrong = v.f[tense].map(c => c.split("|")[0]).filter(f => !tok.ok.includes(f)); }
    wrong = wrong.filter(w => !tok.ok.includes(w));
    if (!wrong.length) continue;
    const w = wrong[Math.floor(Math.random() * wrong.length)];
    const shown = toks.map(x => x.w); shown[at] = w;
    const others = optionsFor(E, tok).filter(o => o !== w && !tok.ok.includes(o)).slice(0, 2);
    return { S, toks, at, tok, shown, en: E.english(S), opts: shuffle([tok.w, w, ...others]) };
  }
  throw new Error("no sentence");
}
