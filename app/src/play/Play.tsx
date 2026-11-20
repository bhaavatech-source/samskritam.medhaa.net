// ═══════════════════════════════════════════════════════════════
//  play/Play.tsx — क्रीडाङ्गणम्: the place to play and learn. It replaced the old यात्रा.
//  Two tabs:
//   मार्गः (path): three levels बालः → अध्येता → निपुणः, 19 topics (play/topics.ts) that open one
//     after another; each topic has its original challenges (quiz / memory / build with lives, hints
//     and timer) and the new games (play/kit.tsx) on the same questions. Best stars per topic.
//   स्वतन्त्रक्रीडा (free play): choose a set of words or roots, how (three modes), and a game:
//    अर्थेन सह   with meaning   — Sanskrit → meaning
//    केवलम् अर्थः from the meaning — meaning → Sanskrit
//    रूपाणि      forms, without meaning — one word's declension / one root's conjugation
//   वाक्यरचना (sentences): grow, build and correct sentences of 3 to 40 words (play/VakyaGame.tsx, play/vakya.ts)
//  Addresses: #play, #play/w/<word id>, #play/d/<root id> (opens that word or root), #play/s (sentences).
//  Root data: app/src/data/play_dhatu.json (tools/build_play_dhatu.py), loaded on first use.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import { WORDS, VIBHAKTI, VACANA, PURUSHA, LAKARA, firstSense, wordMeaning, headForm, shuffle, type Word } from "../data";
import { useLang } from "../settings";
import { useSaDeva } from "../i18n/script";
import { KsTop } from "../kosha/Kosha";
import { GAMES, isSoundOn, setSoundOn, playable, type GameId, type Pair } from "./kit";
import { TOPICS, stationsOf, topicPairs, loadPlayProgress, savePlayProgress, topicOpen, type Topic } from "./topics";
import { REGIONS, STATIONS, type Region } from "../game/stations";
import GameShell from "../game/GameShell";
import Quiz from "../game/games/Quiz";
import MemoryMatch from "../game/games/MemoryMatch";
import SentenceBuilder from "../game/games/SentenceBuilder";
import { VakyaGame } from "./VakyaGame";
import "../game/game.css";
import playDhatuUrl from "../data/play_dhatu.json?url";
import "../kosha/kosha.css";
import "./play.css";

// ── roots ──
/** [id, root, gaṇa (11 = causative), pada, meanings, lakāra → 9 cells "main|alt"] */
type Root = [string, string, number, string, Record<string, string>, Record<string, string[]>];
let rootsP: Promise<Root[]> | null = null;
function loadRoots(): Promise<Root[]> {
  rootsP ??= fetch(playDhatuUrl).then(r => { if (!r.ok) throw new Error(`Could not load the roots (HTTP ${r.status}).`); return r.json(); }).then(d => d.roots as Root[]);
  rootsP.catch(() => { rootsP = null; });
  return rootsP;
}
const GANA: Record<number, [string, string]> = {
  1: ["भ्वादिः", "1st class"], 2: ["अदादिः", "2nd class"], 3: ["जुहोत्यादिः", "3rd class"], 4: ["दिवादिः", "4th class"], 5: ["स्वादिः", "5th class"],
  6: ["तुदादिः", "6th class"], 7: ["रुधादिः", "7th class"], 8: ["तनादिः", "8th class"], 9: ["क्र्यादिः", "9th class"], 10: ["चुरादिः", "10th class"], 11: ["णिजन्ताः", "causatives"],
};
const PLAY_LAKARAS = ["lat", "lan", "lrt", "lot", "vidhilin"];
const rootMeaning = (r: Root, lang: string) => firstSense(r[4][lang] || r[4].en, 34);
const cellForms = (c: string) => c.split("|").filter(Boolean);

// ── words ──
const ENDING: Record<string, [string, string]> = {
  "a": ["अकारान्ताः", "ending in -a"], "ा": ["आकारान्ताः", "ending in -ā"], "ि": ["इकारान्ताः", "ending in -i"], "ी": ["ईकारान्ताः", "ending in -ī"],
  "ु": ["उकारान्ताः", "ending in -u"], "ू": ["ऊकारान्ताः", "ending in -ū"], "ृ": ["ऋकारान्ताः", "ending in -ṛ"], "्": ["हलन्ताः", "ending in a consonant"],
};
function wordGroup(w: Word): string {
  if (w.cat === "pronoun") return "pron"; if (w.cat === "numeral") return "num"; if (w.cat === "adjective") return "adj";
  const last = w.w.slice(-1);
  return /[क-ह]/.test(last) ? "a" : ENDING[last] ? last : "other";
}
const WORD_GROUPS: [string, string, string][] = (() => {
  const label: Record<string, [string, string]> = { ...ENDING, pron: ["सर्वनामानि", "pronouns"], num: ["सङ्ख्याः", "numbers"], adj: ["विशेषणानि", "adjectives"], other: ["अन्ये", "others"] };
  const count: Record<string, number> = {};
  for (const w of WORDS) if (w.cat !== "participle") { const g = wordGroup(w); count[g] = (count[g] ?? 0) + 1; }
  return Object.keys(label).filter(k => (count[k] ?? 0) >= 4).map(k => [k, label[k][0], `${label[k][1]} · ${count[k]}`]);
})();
const wordsIn = (g: string) => WORDS.filter(w => w.cat !== "participle" && (g === "all" || wordGroup(w) === g ||
  (g === "other" && !WORD_GROUPS.some(x => x[0] === wordGroup(w)))));
const wordForms = (f: string) => f.split(/\s*\/\s*/).filter(Boolean);

type Area = "w" | "d";
type Mode = "with" | "meaning" | "forms";
const MODES: { id: Mode; icon: string; sa: string; en: string; blurb: (a: Area) => string }[] = [
  { id: "with", icon: "📖", sa: "अर्थेन सह", en: "With meaning", blurb: a => a === "w" ? "See the word, find its meaning." : "See the root and its verb, find the meaning." },
  { id: "meaning", icon: "💬", sa: "केवलम् अर्थः", en: "From the meaning", blurb: a => a === "w" ? "See the meaning, find or build the Sanskrit word." : "See the meaning, find or build the verb." },
  { id: "forms", icon: "🔤", sa: "रूपाणि", en: "Forms (no meaning)", blurb: a => a === "w" ? "One word in all its cases and numbers." : "One root in the lakāras you choose." },
];

/** the address this page was opened with: #play/w/SH-000001 or #play/d/MDH-001 */
const fromHash = (): [Area, string] | null => { const [v, a, id] = location.hash.slice(1).split("/"); return v === "play" && (a === "w" || a === "d") && id ? [a, decodeURIComponent(id)] : null; };

/** स्वतन्त्रक्रीडा: choose any set of words or roots, a mode and a game */
const FreePlay: React.FC<{ setBusy: (b: boolean) => void }> = ({ setBusy }) => {
  const S = useSaDeva(); const lang = useLang();
  const start = useMemo(fromHash, []);
  const [area, setArea] = useState<Area | null>(start?.[0] ?? null);
  const [roots, setRoots] = useState<Root[] | null>(null);
  const [err, setErr] = useState("");
  const startWord = start?.[0] === "w" ? WORDS.find(w => w.id === start[1]) : undefined;
  const [group, setGroup] = useState<string>(startWord ? wordGroup(startWord) : "a");
  const [rgroup, setRgroup] = useState<number>(1);
  const [mode, setMode] = useState<Mode>(start ? "forms" : "with");
  const [wordId, setWordId] = useState<string>(startWord?.id ?? "");
  const [rootId, setRootId] = useState<string>(start?.[0] === "d" ? start[1] : "");
  const [lks, setLks] = useState<string[]>(["lat"]);
  const [game, setGame] = useState<GameId | null>(null);
  const [round, setRound] = useState(0);
  const [sound, setSound] = useState(isSoundOn());

  useEffect(() => { if (area === "d" && !roots) loadRoots().then(rs => {
    setRoots(rs);
    const r = rs.find(x => x[0] === rootId); if (r) setRgroup(r[2]);
  }, e => setErr(String(e?.message || e))); }, [area, roots, rootId]);

  // what is being played with
  const words = useMemo(() => wordsIn(group), [group]);
  const groupRoots = useMemo(() => roots?.filter(r => r[2] === rgroup) ?? [], [roots, rgroup]);
  const word = WORDS.find(w => w.id === wordId) ?? words[0];
  const root = roots?.find(r => r[0] === rootId) ?? groupRoots[0];

  const pairs: Pair[] = useMemo(() => {
    if (area === "w") {
      if (mode === "forms") {
        if (!word) return [];
        const out: Pair[] = [];
        word.d.forEach((row, n) => row.forEach((f, v) => { if (f) { const fs = wordForms(f); out.push({ q: `${headForm(word)} · ${VIBHAKTI[v]} · ${VACANA[n]}`, a: fs[0], alts: fs, qSa: true, aSa: true }); } }));
        return out;
      }
      const seen = new Set<string>(); const out: Pair[] = [];
      for (const w of shuffle(words)) {
        const m = firstSense(wordMeaning(w, lang), 34); const h = headForm(w);
        if (!m || seen.has(m) || seen.has(h)) continue; seen.add(m); seen.add(h);
        out.push(mode === "with" ? { q: h, a: m, qSa: true, aSa: false, say: h } : { q: m, a: h, qSa: false, aSa: true, say: h });
        if (out.length >= 12) break;
      }
      return out;
    }
    if (area === "d" && roots) {
      if (mode === "forms") {
        if (!root) return [];
        const out: Pair[] = [];
        for (const lk of lks) (root[5][lk] ?? []).forEach((c, k) => {
          const fs = cellForms(c); if (!fs.length) return;
          out.push({ q: `${root[1]} · ${LAKARA[lk][0]} · ${PURUSHA[Math.floor(k / 3)]} · ${VACANA[k % 3]}`, a: fs[0], alts: fs, qSa: true, aSa: true });
        });
        return out;
      }
      const seen = new Set<string>(); const out: Pair[] = [];
      for (const r of shuffle(groupRoots)) {
        const m = rootMeaning(r, lang); const v = cellForms(r[5].lat[0])[0];
        if (!m || !v || seen.has(m) || seen.has(v)) continue; seen.add(m); seen.add(v);
        out.push(mode === "with" ? { q: `${r[1]} · ${v}`, a: m, qSa: true, aSa: false, say: v } : { q: m, a: v, alts: cellForms(r[5].lat[0]), qSa: false, aSa: true, say: v });
        if (out.length >= 12) break;
      }
      return out;
    }
    return [];
    // a new round reshuffles the sample
  }, [area, mode, word, words, root, groupRoots, roots, lks, lang, round]);   // eslint-disable-line react-hooks/exhaustive-deps

  const G = GAMES.find(g => g.id === game);
  useEffect(() => { setBusy(!!(G && area)); }, [G, area, setBusy]);
  const startGame = (g: GameId) => { setGame(g); setRound(r => r + 1); window.scrollTo(0, 0); };
  const toggleSound = () => { setSoundOn(!sound); setSound(!sound); };
  const what = area === "w"
    ? (mode === "forms" ? `${S(headForm(word!))} · ${S("रूपाणि")}` : `${S(WORD_GROUPS.find(g => g[0] === group)?.[1] ?? "")} · ${MODES.find(m => m.id === mode)!.en}`)
    : root ? (mode === "forms" ? `${S(root[1])} · ${lks.map(l => S(LAKARA[l][0])).join(", ")}` : `${S(GANA[rgroup][0])} · ${MODES.find(m => m.id === mode)!.en}`) : "";

  // ── a game in progress, or its result ──
  if (G && area) return <GameRun key={round} G={G} what={what} pairs={pairs} onBack={() => setGame(null)} onAgain={() => startGame(G.id)} />;

  // ── choosing ──
  return (
    <div>
      <p className="pk-intro">Choose any set of words or roots, how to play with them, and a game. Every word in the Noun Book and every root in the Verb Book has a 🎮 button that opens it here.</p>
      <div className="pk-areas">
        <button className={`pk-area ${area === "w" ? "on" : ""}`} onClick={() => setArea("w")}>
          <span className="pk-aicon" aria-hidden="true">📚</span><b className="ks-l-sa">{S("शब्दाः")}</b><span>Words · {WORDS.filter(w => w.cat !== "participle").length}</span></button>
        <button className={`pk-area ${area === "d" ? "on" : ""}`} onClick={() => setArea("d")}>
          <span className="pk-aicon" aria-hidden="true">🌱</span><b className="ks-l-sa">{S("धातवः")}</b><span>Roots · 408</span></button>
      </div>

      {area === "d" && !roots && <p className="ks-note-plain" role={err ? "alert" : "status"}>{err || "धातवः आनीयन्ते… · Loading the roots…"}</p>}

      {area && (area === "w" || roots) && <>
        <h4 className="pk-h">१ · {area === "w" ? "Which words?" : "Which roots?"}</h4>
        <div className="ks-chips pk-sets">
          {area === "w"
            ? WORD_GROUPS.map(([k, sl, en]) => <button key={k} className={group === k ? "on" : ""} onClick={() => { setGroup(k); setWordId(""); }}><b className="ks-l-sa">{S(sl)}</b> <small>{en}</small></button>)
            : Object.entries(GANA).map(([k, [sl, en]]) => { const n = roots!.filter(r => r[2] === +k).length; return n ? <button key={k} className={rgroup === +k ? "on" : ""} onClick={() => { setRgroup(+k); setRootId(""); }}><b className="ks-l-sa">{S(sl)}</b> <small>{en} · {n}</small></button> : null; })}
        </div>

        <h4 className="pk-h">२ · How?</h4>
        <div className="pk-modes">
          {MODES.map(m => (
            <button key={m.id} className={`pk-mode ${mode === m.id ? "on" : ""}`} onClick={() => setMode(m.id)}>
              <span className="pk-aicon" aria-hidden="true">{m.icon}</span><b className="ks-l-sa">{S(m.sa)}</b><span>{m.en}</span><small>{m.blurb(area)}</small>
            </button>))}
        </div>

        {mode === "forms" && (area === "w"
          ? <div className="pk-pick"><label>शब्दः · Word
              <select value={word?.id ?? ""} onChange={e => setWordId(e.target.value)}>
                {words.map(w => <option key={w.id} value={w.id}>{S(headForm(w))} — {firstSense(wordMeaning(w, lang), 28)}</option>)}
              </select></label></div>
          : <div className="pk-pick"><label>धातुः · Root
              <select value={root?.[0] ?? ""} onChange={e => setRootId(e.target.value)}>
                {groupRoots.map(r => <option key={r[0]} value={r[0]}>{S(r[1])} ({S(cellForms(r[5].lat[0])[0])}) — {rootMeaning(r, lang)}</option>)}
              </select></label>
              <div className="ks-chips">{PLAY_LAKARAS.filter(l => root?.[5][l]).map(l => (
                <button key={l} className={lks.includes(l) ? "on" : ""} onClick={() => setLks(lks.includes(l) ? (lks.length > 1 ? lks.filter(x => x !== l) : lks) : [...lks, l])}>
                  <b className="ks-l-sa">{S(LAKARA[l][0])}</b> <small>{LAKARA[l][1]}</small></button>))}</div>
            </div>)}

        <h4 className="pk-h">३ · Play!</h4>
        <div className="pk-games">
          {GAMES.map(g => {
            const off = g.needsSa && mode === "with";
            return (
              <button key={g.id} className="pk-game" disabled={off || pairs.length < 3} onClick={() => startGame(g.id)}>
                <span className="pk-gicon" aria-hidden="true">{g.icon}</span>
                <b className="ks-l-sa">{S(g.sa)}</b><span>{g.en}</span>
                <small>{off ? "Needs a Sanskrit answer: choose “From the meaning” or “Forms”." : g.blurb}</small>
              </button>);
          })}
        </div>
        <p className="pk-foot"><button className="pk-sound" onClick={toggleSound} aria-pressed={sound}>{sound ? "🔔 Sound on" : "🔕 Sound off"}</button></p>
      </>}
    </div>
  );
};

/** "play with this word / root" button for the Noun Book and Verb Book */
export const PlayLink: React.FC<{ kind: Area; id: string }> = ({ kind, id }) => (
  <a className="pk-playlink" href={`#play/${kind}/${encodeURIComponent(id)}`}>🎮 क्रीड · Play</a>
);

// ═══ shared: one game of the new kind, with its result screen ═══
function reportScore(stars: number, section: string) {
  try {
    const bs = (window as unknown as { BhavaSession?: { end: (pct: number, d: object) => void } }).BhavaSession;
    if (bs) bs.end(Math.round(stars / 3 * 100), { game: "samskrita-medhaa", section, stars });
  } catch { /* not embedded */ }
}
const GameRun: React.FC<{ G: (typeof GAMES)[number]; what: string; pairs: Pair[]; onBack: () => void; onAgain: () => void; onStars?: (n: number) => void; onNext?: () => void }> =
  ({ G, what, pairs, onBack, onAgain, onStars, onNext }) => {
  const [result, setResult] = useState<[number, string] | null>(null);
  const [sound, setSound] = useState(isSoundOn());
  const end = (st: number, line: string) => { setResult([st, line]); onStars?.(st); reportScore(st, `${G.id} · ${what}`); };
  return (
    <div>
      <div className="pk-gamebar">
        <button className="un-link" onClick={onBack}>← back</button>
        <span className="pk-what">{G.icon} {G.sa} · {what}</span>
        <button className="pk-sound" onClick={() => { setSoundOn(!sound); setSound(!sound); }} aria-pressed={sound} aria-label="Sound">{sound ? "🔔" : "🔕"}</button>
      </div>
      <div className="ks-card pk-stage">
        {result
          ? <div className="pk-result">
              <div className="pk-stars" aria-label={`${result[0]} of 3 stars`}>{[0, 1, 2].map(i => <span key={i} className={i < result[0] ? "on" : ""} style={{ animationDelay: `${i * .25}s` }}>★</span>)}</div>
              <p className="pk-rline">{result[0] === 3 ? "उत्तमम्! · Excellent!" : result[0] === 2 ? "साधु! · Well done!" : result[0] === 1 ? "प्रयत्नः शोभनः · Good try!" : "पुनः प्रयतस्व · Try again!"}</p>
              <p>{result[1]}</p>
              <div className="pk-row">
                <button className="pk-btn" onClick={onAgain}>↻ पुनः · Play again</button>
                <button className="pk-btn ghost" onClick={onBack}>🎮 Another game</button>
                {onNext && result[0] > 0 && <button className="pk-btn" onClick={onNext}>अग्रिमः विषयः · Next topic →</button>}
              </div>
            </div>
          : pairs.length < 3 ? <p className="ks-note-plain">Not enough items here to play. Choose another set.</p>
          : <G.C pairs={pairs} onEnd={end} />}
      </div>
    </div>
  );
};

const Stars: React.FC<{ n: number }> = ({ n }) => <span className="pk-tstars" aria-label={`${n} of 3 stars`}>{[1, 2, 3].map(i => <span key={i} className={i <= n ? "on" : ""}>★</span>)}</span>;
const KIND: Record<string, { name: string; how: string }> = {
  quiz:   { name: "प्रश्नोत्तरम् · Quiz", how: "Read the question and tap the right answer. 💡 removes two wrong answers." },
  memory: { name: "स्मृतिक्रीडा · Memory", how: "All cards show for a moment — remember them! Then flip two at a time to find pairs." },
  build:  { name: "रचना · Build", how: "Read the meaning, then tap the words in order. Tap a placed word to take it back." },
};

// ═══ मार्गः — the path ═══
const Path: React.FC<{ setBusy: (b: boolean) => void }> = ({ setBusy }) => {
  const S = useSaDeva(); const lang = useLang();
  const [prog, setProg] = useState(loadPlayProgress);
  const current = TOPICS.findIndex((t, i) => topicOpen(prog, i) && !(prog.stars[t.id] > 0));
  const [level, setLevel] = useState<Region>(TOPICS[current >= 0 ? current : 0].level);
  const [openId, setOpenId] = useState<string | null>(null);
  const [classic, setClassic] = useState<string | null>(null);
  const [game, setGame] = useState<GameId | null>(null);
  const [round, setRound] = useState(0);
  useEffect(() => { setBusy(!!(classic || game)); }, [classic, game, setBusy]);
  const topic = TOPICS.find(t => t.id === openId) ?? null;
  const pairs = useMemo(() => topic && !topic.boss ? topicPairs(topic, lang) : [], [topic, lang, round]);   // eslint-disable-line react-hooks/exhaustive-deps
  const record = (t: Topic, stars: number, station?: string) => {
    const p = loadPlayProgress();
    if ((p.stars[t.id] ?? 0) < stars) p.stars = { ...p.stars, [t.id]: stars };
    if (station && (p.ch[station] ?? 0) < stars) p.ch = { ...p.ch, [station]: stars };
    savePlayProgress(p); setProg(p);
  };
  const ti = topic ? TOPICS.indexOf(topic) : -1;
  const nextTopic = ti >= 0 && ti + 1 < TOPICS.length ? TOPICS[ti + 1] : null;
  const goNext = nextTopic ? () => { setClassic(null); setGame(null); setOpenId(nextTopic.id); setLevel(nextTopic.level); window.scrollTo(0, 0); } : undefined;
  const [card, setCard] = useState<string | null>(null);
  const setOpenAll = (on: boolean) => { const p = { ...loadPlayProgress(), openAll: on }; savePlayProgress(p); setProg(p); };
  const total = TOPICS.reduce((a, t) => a + (prog.stars[t.id] ?? 0), 0);

  // a challenge (the original station game)
  const st = classic ? STATIONS.find(x => x.id === classic) : undefined;
  if (st && topic) return (
    <GameShell key={`${st.id}-${round}`} station={st} onExit={() => setClassic(null)} onDone={stars => record(topic, stars, st.id)} onNext={goNext}>
      {api => st.kind === "quiz" ? <Quiz station={st} api={api} /> : st.kind === "memory" ? <MemoryMatch station={st} api={api} /> : <SentenceBuilder station={st} api={api} />}
    </GameShell>
  );
  // a new game on the topic's questions
  const G = GAMES.find(g => g.id === game);
  if (G && topic) return <GameRun key={round} G={G} what={`${topic.icon} ${S(topic.sa)}`} pairs={pairs}
    onBack={() => setGame(null)} onAgain={() => setRound(r => r + 1)} onStars={s => record(topic, s)} onNext={goNext} />;

  // one topic: its challenges and games
  if (topic) {
    const games = topic.boss ? [] : GAMES.filter(g => playable(g.id, pairs));
    return (
      <div className="pk-topic">
        <button className="un-link" onClick={() => setOpenId(null)}>← {S(REGIONS[topic.level].name)} · all topics</button>
        <div className="pk-thead">
          <span className="pk-ticon" aria-hidden="true">{topic.icon}</span>
          <div><h3 className="ks-l-sa">{S(topic.sa)}</h3><p>{topic.en} · {topic.blurb}</p></div>
          <Stars n={prog.stars[topic.id] ?? 0} />
        </div>
        <h4 className="pk-h">प्रतिस्पर्धा · {topic.boss ? "The challenge" : "Challenges"} <small>lives, hints and a score — the classic way</small></h4>
        <div className="pk-games">
          {stationsOf(topic).map(s => (
            <button key={s.id} className={`pk-game ${s.boss ? "boss" : ""}`} onClick={() => setCard(s.id)}>
              <span className="pk-gicon" aria-hidden="true">{s.icon}</span><b className="ks-l-sa">{S(s.title)}</b><span>{s.en}</span>
              <small>{KIND[s.kind].name}</small>
              <Stars n={prog.ch[s.id] ?? 0} />
            </button>))}
        </div>
        {games.length > 0 && <>
          <h4 className="pk-h">क्रीडाः · Games <small>the same questions, played differently</small></h4>
          <div className="pk-games">
            {games.map(g => (
              <button key={g.id} className="pk-game" onClick={() => { setRound(r => r + 1); setGame(g.id); window.scrollTo(0, 0); }}>
                <span className="pk-gicon" aria-hidden="true">{g.icon}</span><b className="ks-l-sa">{S(g.sa)}</b><span>{g.en}</span><small>{g.blurb}</small>
              </button>))}
          </div>
        </>}
        <p className="pk-foot">Any challenge or game earns this topic's stars; one star opens the next topic.</p>
        {card && (() => {
          const s = STATIONS.find(x => x.id === card)!;
          const rounds = s.kind === "memory" ? "6 pairs" : s.kind === "build" ? `${s.rounds} to build` : `${s.rounds} questions`;
          return (
            <div className="jy-card-bg" onClick={() => setCard(null)}>
              <div className="jy-card" role="dialog" aria-label={s.en} style={{ "--rc": REGIONS[s.region].color } as React.CSSProperties} onClick={e => e.stopPropagation()}>
                <span className="jy-card-icon">{s.icon}</span>
                <span className="jy-card-region">{S(REGIONS[s.region].name)} · {S(topic.sa)}</span>
                <h3 className="ks-l-sa">{S(s.title)}</h3>
                <p className="jy-card-en">{s.en}</p>
                <p className="jy-card-blurb">{s.blurb}</p>
                <div className="jy-card-kind"><b>{KIND[s.kind].name}</b><span>{KIND[s.kind].how}</span></div>
                <div className="jy-card-rules">
                  <span>🎯 {rounds}</span>
                  {s.lives !== null && <span>❤️ × {s.lives}</span>}
                  {s.kind === "quiz" && s.timeLimit && <span>⏱ {s.timeLimit}s each</span>}
                  {s.kind !== "memory" && <span>{s.hints ? "💡 hints allowed" : "🚫 no hints"}</span>}
                  <span>best: {"★".repeat(prog.ch[s.id] ?? 0) || "—"}</span>
                </div>
                <div className="jy-card-btns">
                  <button onClick={() => setCard(null)}>Close</button>
                  <button className="jy-go" onClick={() => { setCard(null); setRound(r => r + 1); setClassic(s.id); window.scrollTo(0, 0); }}>आरभस्व · Start ▶</button>
                </div>
              </div>
            </div>);
        })()}
      </div>
    );
  }

  // the levels and their topics
  const list = TOPICS.map((t, i) => ({ t, i })).filter(x => x.t.level === level);
  return (
    <div>
      <div className="pk-pathtop">
        <span className="pk-total">⭐ {total} / {TOPICS.length * 3}</span>
        <label className="pk-openall"><input type="checkbox" checked={prog.openAll} onChange={e => setOpenAll(e.target.checked)} /> सर्वम् उद्घाटय · open all</label>
      </div>
      <div className="pk-levels" role="tablist" aria-label="Levels">
        {(Object.keys(REGIONS) as Region[]).map(r => {
          const ts = TOPICS.filter(t => t.level === r); const done = ts.filter(t => (prog.stars[t.id] ?? 0) > 0).length;
          return (
            <button key={r} role="tab" aria-selected={level === r} className={`pk-level ${level === r ? "on" : ""}`} style={{ "--lc": REGIONS[r].color } as React.CSSProperties} onClick={() => setLevel(r)}>
              <b className="ks-l-sa">{S(REGIONS[r].name)}</b><span>{REGIONS[r].en}</span>
              <span className="pk-lbar" aria-hidden="true"><span style={{ width: `${100 * done / ts.length}%` }} /></span>
              <small>{done} / {ts.length} topics · {REGIONS[r].who}</small>
            </button>);
        })}
      </div>
      {(() => {
        const reg = REGIONS[level]; const ROW = 124; const XS = [24, 50, 76, 50];
        const h = list.length * ROW;
        const pts = list.map((_, k) => `${XS[k % 4]},${k * ROW + ROW / 2}`).join(" ");
        return (
          <section className="jy-region pk-map" style={{ "--rc": reg.color } as React.CSSProperties}>
            <header className="jy-region-head">
              <span className="jy-region-name ks-l-sa">{S(reg.name)}</span><span className="jy-region-en">{reg.en}</span>
              <span className="jy-region-who">{reg.who}</span>
              <span className="jy-region-count">{list.filter(x => (prog.stars[x.t.id] ?? 0) > 0).length}/{list.length}</span>
            </header>
            <div className="jy-path" style={{ height: h }}>
              <svg className="jy-svg" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true"><polyline points={pts} fill="none" /></svg>
              {list.map(({ t, i }, k) => {
                const open = topicOpen(prog, i); const stars = prog.stars[t.id] ?? 0;
                return (
                  <button key={t.id} disabled={!open} onClick={() => { setOpenId(t.id); window.scrollTo(0, 0); }}
                    className={`jy-node ${open ? "" : "jy-locked"} ${i === current && open ? "jy-current" : ""} ${t.boss ? "jy-boss" : ""} ${stars ? "jy-done" : ""}`}
                    style={{ left: `${XS[k % 4]}%`, top: k * ROW + ROW / 2, "--i": k } as React.CSSProperties}>
                    <span className="jy-node-circle">{open ? t.icon : "🔒"}</span>
                    <span className="jy-node-title ks-l-sa">{S(t.sa)}</span>
                    <span className="jy-node-en">{t.en}</span>
                    <span className="jy-node-stars">{[1, 2, 3].map(n => <span key={n} className={n <= stars ? "on" : ""}>★</span>)}</span>
                  </button>);
              })}
            </div>
          </section>);
      })()}
    </div>
  );
};

// ═══ the page ═══
export const Play: React.FC = () => {
  const [tab, setTab] = useState<"path" | "free" | "vakya">(() => fromHash() ? "free" : location.hash.startsWith("#play/s") ? "vakya" : "path");
  const [busy, setBusy] = useState(false);
  return (
    <div className="ks pk-page">
      {!busy && <>
        <KsTop title="क्रीडाङ्गणम्" en="Play & learn" sub="Learn Sanskrit by playing: follow the path from बालः to निपुणः, or play freely with any word or root." />
        <div className="pk-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "path"} className={tab === "path" ? "on" : ""} onClick={() => setTab("path")}>🗺️ <b className="ks-l-sa">मार्गः</b> · Path</button>
          <button role="tab" aria-selected={tab === "free"} className={tab === "free" ? "on" : ""} onClick={() => setTab("free")}>🎲 <b className="ks-l-sa">स्वतन्त्रक्रीडा</b> · Free play</button>
          <button role="tab" aria-selected={tab === "vakya"} className={tab === "vakya" ? "on" : ""} onClick={() => setTab("vakya")}>📝 <b className="ks-l-sa">वाक्यरचना</b> · Sentences</button>
        </div>
      </>}
      {tab === "path" ? <Path setBusy={setBusy} /> : tab === "free" ? <FreePlay setBusy={setBusy} /> : <VakyaGame />}
    </div>
  );
};
