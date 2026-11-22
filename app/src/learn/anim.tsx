// ═══════════════════════════════════════════════════════════════
//  learn/anim.tsx — दृश्यानि: animated scenes for the बोधः chapters.
//  Each scene shows one idea moving, next to the text that explains it:
//    ShabdaScene   stem + ending → form, the 24 places filling
//    KarakaScene   a sentence built role by role (the six kārakas)
//    PotScene      विवक्षा: the same pot as place, instrument, doer
//    WorldScene    one relation, many languages
//    PersonScene   who acts × how many: the 3 × 3 verb grid with figures
//    LakaraScene   the ten lakāras on a time line and as moods
//    AvyayaScene   endings added and removed (लुक्): one form in all 24 places
//    Morph         a form whose changed letters light up (used by the prakriyā player)
//  All scenes can be played, paused and stepped; motion is reduced when the device asks.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import { WORDS, VERBS, LANGS, MEANING_LANGS, VIBHAKTI, VACANA, PURUSHA, LAKARA, LAKARA_INFO, type Word } from "../data";
import { nounGloss, verbGloss } from "../i18n/forms";
import { useLang } from "../settings";
import { useSaDeva } from "../i18n/script";
import { speak } from "../speech";

// ── a small player: step through n frames by hand or automatically ──
export function useSteps(n: number, ms = 1700) {
  const [i, setI] = useState(0);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!on) return;
    const t = setTimeout(() => setI(x => { if (x + 1 >= n) { setOn(false); return x; } return x + 1; }), ms);
    return () => clearTimeout(t);
  }, [on, i, n, ms]);
  useEffect(() => { if (i >= n) setI(Math.max(0, n - 1)); }, [n, i]);
  return {
    i, on, n,
    go: (k: number) => { setOn(false); setI(Math.max(0, Math.min(n - 1, k))); },
    play: () => { if (i >= n - 1) setI(0); setOn(true); },
    pause: () => setOn(false),
  };
}
export type Steps = ReturnType<typeof useSteps>;

export const Controls: React.FC<{ s: Steps; label?: string }> = ({ s, label }) => (
  <div className="an-ctrl">
    <button onClick={() => s.go(s.i - 1)} disabled={s.i <= 0} aria-label="Previous step">◀</button>
    {s.on ? <button className="an-play" onClick={s.pause} aria-label="Pause">⏸</button>
          : <button className="an-play" onClick={s.play} aria-label="Play">▶</button>}
    <button onClick={() => s.go(s.i + 1)} disabled={s.i >= s.n - 1} aria-label="Next step">▶|</button>
    <button onClick={() => s.go(0)} aria-label="Start again">↺</button>
    <span className="an-count">{label ?? `${s.i + 1} / ${s.n}`}</span>
    <span className="an-dots" aria-hidden="true">{s.n <= 24 && Array.from({ length: s.n }, (_, k) => <i key={k} className={k === s.i ? "on" : k < s.i ? "past" : ""} />)}</span>
  </div>
);

/** a frame around a scene, with its title */
export const Scene: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="an-scene"><div className="an-scene-title">🎬 {title}</div>{children}</div>
);

/** a form; the part that differs from the previous form lights up */
export const Morph: React.FC<{ prev?: string; cur: string; k: string | number; S?: (t: string) => string }> = ({ prev, cur, k, S: given }) => {
  const deva = useSaDeva(); const S = given ?? deva;
  const a = [...(prev ?? "")], b = [...cur];
  let p = 0; while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let q = 0; while (q < a.length - p && q < b.length - p && a[a.length - 1 - q] === b[b.length - 1 - q]) q++;
  // keep vowel signs and halant with their consonant
  const isMark = (c?: string) => !!c && /[ा-्ऀ-ः]/.test(c);
  while (p > 0 && isMark(b[p])) p--;
  const head = b.slice(0, p).join(""), mid = b.slice(p, b.length - q).join(""), tail = b.slice(b.length - q).join("");
  if (!prev) return <span className="an-morph ks-l-sa" key={k}>{S(cur)}</span>;
  return <span className="an-morph ks-l-sa" key={k}>{S(head)}<span className="an-ch">{S(mid) || "∅"}</span>{S(tail)}</span>;
};

// ═══ शब्दरूपाणि: stem + ending → form, and the 24 places ═══
const SUP = [["सु", "औ", "जस्"], ["अम्", "औट्", "शस्"], ["टा", "भ्याम्", "भिस्"], ["ङे", "भ्याम्", "भ्यस्"], ["ङसि", "भ्याम्", "भ्यस्"], ["ङस्", "ओस्", "आम्"], ["ङि", "ओस्", "सुप्"], ["सु", "औ", "जस्"]];
const DEMO_WORDS = ["SH-000001", "SH-000025", "SH-000035", "SH-000011", "SH-000029", "SH-000018"];
export const ShabdaScene: React.FC = () => {
  const S = useSaDeva();
  const words = DEMO_WORDS.map(id => WORDS.find(w => w.id === id)).filter(Boolean) as Word[];
  const [wid, setWid] = useState(words[0].id);
  const w = words.find(x => x.id === wid)!;
  const s = useSteps(24, 1500);
  const v = Math.floor(s.i / 3), n = s.i % 3;            // row by row: प्रथमा एक, द्वि, बहु, द्वितीया …
  const form = (v === 7 ? "हे " : "") + (w.d[n]?.[v] || "—");
  return (
    <Scene title="प्रातिपदिकम् + सुप् = पदम् · Watch a noun take its 24 forms">
      <div className="an-pick">{words.map(x => <button key={x.id} className={x.id === wid ? "on" : ""} onClick={() => { setWid(x.id); s.go(0); }}>{S(x.w)}</button>)}</div>
      <div className="an-eq" key={`${wid}-${s.i}`}>
        <span className="an-tile an-stem ks-l-sa">{S(w.w)}</span>
        <span className="an-plus">+</span>
        <span className="an-tile an-suf ks-l-sa">{S(SUP[v][n])}</span>
        <span className="an-arrow">→</span>
        <button className="an-result ks-l-sa" onClick={() => speak(form)}>{S(form)} <small>🔊</small></button>
      </div>
      <div className="an-grid24" role="grid" aria-label="the 24 places">
        <span />{VACANA.map(x => <span key={x} className="an-gh ks-l-sa">{S(x)}</span>)}
        {VIBHAKTI.map((vb, r) => <React.Fragment key={vb}>
          <span className="an-gh ks-l-sa">{S(vb)}</span>
          {[0, 1, 2].map(c => { const k = r * 3 + c; return (
            <button key={c} className={`an-cell ks-l-sa ${k === s.i ? "now" : k < s.i ? "full" : ""}`} onClick={() => s.go(k)}>
              {k <= s.i ? S((r === 7 ? "हे " : "") + (w.d[c]?.[r] || "—")) : ""}</button>); })}
        </React.Fragment>)}
      </div>
      <Controls s={s} label={`${s.i + 1} / 24`} />
    </Scene>
  );
};

// ═══ कारकाणि: a sentence built role by role ═══
const KARAKA_STEPS: [string, string, string, string, string][] = [
  // emoji, word, role, question, English
  ["🎁", "ददाति", "क्रिया", "the action", "gives"],
  ["🧑", "रामः", "कर्ता", "who does it?", "Rāma"],
  ["📕", "पुस्तकम्", "कर्म", "what does he give?", "a book"],
  ["✋", "हस्तेन", "करणम्", "with what?", "with his hand"],
  ["🧑‍🤝‍🧑", "मित्राय", "सम्प्रदानम्", "to whom?", "to his friend"],
  ["🏠", "गृहात्", "अपादानम्", "from where does he come?", "from home"],
  ["🌳", "उद्याने", "अधिकरणम्", "where?", "in the garden"],
];
const ORDER = [1, 5, 6, 4, 3, 2, 0];                      // the finished sentence: रामः गृहात् आगत्य उद्याने मित्राय हस्तेन पुस्तकं ददाति
export const KarakaScene: React.FC = () => {
  const S = useSaDeva();
  const s = useSteps(KARAKA_STEPS.length + 1, 1900);
  const shown = new Set(Array.from({ length: Math.min(s.i + 1, KARAKA_STEPS.length) }, (_, k) => k));
  const cur = KARAKA_STEPS[Math.min(s.i, KARAKA_STEPS.length - 1)];
  const done = s.i >= KARAKA_STEPS.length;
  return (
    <Scene title="कारकाणि · Six roles around one action">
      <div className="an-karaka">
        {ORDER.map(k => {
          const [e, word, role] = KARAKA_STEPS[k];
          return shown.has(k)
            ? <span key={k} className={`an-kw r${k} ${k === s.i ? "now" : ""}`}><span className="an-ke">{e}</span><b className="ks-l-sa">{S(k === 5 ? "गृहात् आगत्य" : word)}</b><small className="ks-l-sa">{S(role)}</small></span>
            : <span key={k} className="an-kw empty" aria-hidden="true">?</span>;
        })}
      </div>
      {done
        ? <p className="an-cap"><b className="ks-l-sa">{S("रामः गृहात् आगत्य उद्याने मित्राय हस्तेन पुस्तकं ददाति।")}</b><br />Rāma, coming from home, gives a book to his friend with his hand in the garden. Each noun answers one question about the action.</p>
        : <p className="an-cap" key={s.i}><span className="an-q">{cur[3]}</span> → <b className="ks-l-sa">{S(cur[1])}</b> “{cur[4]}” · <span className="ks-l-sa">{S(cur[2])}</span></p>}
      <Controls s={s} />
    </Scene>
  );
};

// ═══ विवक्षा: the same pot, three roles ═══
const POT: [string, string, string, string][] = [
  ["स्थाल्यां पचति", "अधिकरणम्", "cooks in the pot", "the pot is the place"],
  ["स्थाल्या पचति", "करणम्", "cooks with the pot", "the pot is the instrument"],
  ["स्थाली पचति", "कर्ता", "the pot cooks", "the pot itself is the doer"],
];
export const PotScene: React.FC = () => {
  const S = useSaDeva();
  const s = useSteps(POT.length, 2200);
  const [sa, role, en, why] = POT[s.i];
  return (
    <Scene title="विवक्षातः कारकाणि · The speaker decides the role">
      <div className={`an-pot p${s.i}`} key={s.i}>
        <span className="an-fire" aria-hidden="true">🔥</span><span className="an-potpot" aria-hidden="true">🍲</span>
        <div><b className="ks-l-sa">{S(sa)}</b><small>{en}</small><span className="an-role ks-l-sa">{S(role)} · {why}</span></div>
      </div>
      <Controls s={s} />
    </Scene>
  );
};

// ═══ सर्वासु भाषासु: one relation, many languages ═══
const WORLD_LANGS = ["en", "hi", "te", "ta", "kn", "de", "ru", "ja", "ar", "zh"];
export const WorldScene: React.FC = () => {
  const S = useSaDeva(); const lang = useLang();
  const w = WORDS.find(x => x.id === "SH-000001")!;
  const langs = useMemo(() => Array.from(new Set([lang, ...WORLD_LANGS])).filter(l => l !== "sa" && MEANING_LANGS.includes(l)).slice(0, 8), [lang]);
  const s = useSteps(8, 2600);
  const v = s.i; const f = (v === 7 ? "हे " : "") + w.d[0][v];
  return (
    <Scene title="एकः सम्बन्धः, बह्व्यः भाषाः · One relation, every language">
      <div className="an-world-head" key={v}><b className="ks-l-sa">{S(VIBHAKTI[v])}</b> <span className="ks-l-sa an-wsa">{S(f)}</span></div>
      <div className="an-world">
        {langs.map((l, k) => <div key={`${v}-${l}`} className="an-wcard" style={{ animationDelay: `${k * 0.12}s` }}><small>{LANGS[l]}</small><span dir="auto">{nounGloss(w, v, 0, l)}</span></div>)}
      </div>
      <p className="an-cap">Different markers (endings, separate words, word order), the same eight places.</p>
      <Controls s={s} />
    </Scene>
  );
};

// ═══ धातुरूपाणि: who acts × how many ═══
const WHO = ["🧍", "🧑", "🙋"];                            // प्रथमः (he/she), मध्यमः (you), उत्तमः (I)
const P_VERBS = () => VERBS.filter(v => v.P?.lat);
export const PersonScene: React.FC = () => {
  const S = useSaDeva();
  const verbs = P_VERBS();
  const [vid, setVid] = useState(verbs.find(v => v.w === "पठ्")?.id ?? verbs[0].id);
  const verb = verbs.find(v => v.id === vid)!;
  const s = useSteps(9, 1700);
  const p = Math.floor(s.i / 3), n = s.i % 3;
  const cell = verb.P!.lat[p]?.[n];
  return (
    <Scene title="पुरुषः × वचनम् · Who acts, and how many">
      <div className="an-pick">{verbs.slice(0, 8).map(v => <button key={v.id} className={v.id === vid ? "on" : ""} onClick={() => { setVid(v.id); s.go(0); }}>{S(v.w)}</button>)}</div>
      <div className="an-stage" key={`${vid}-${s.i}`}>
        <div className="an-people" aria-hidden="true">{Array.from({ length: n + 1 }, (_, k) => <span key={k} style={{ animationDelay: `${k * .12}s` }}>{WHO[p]}</span>)}</div>
        {cell && <button className="an-bubble ks-l-sa" onClick={() => speak(cell[0])}>{S(cell[0])} <small>🔊</small></button>}
      </div>
      <div className="an-grid9">
        <span />{VACANA.map(x => <span key={x} className="an-gh ks-l-sa">{S(x)}</span>)}
        {[0, 1, 2].map(r => <React.Fragment key={r}><span className="an-gh"><span aria-hidden="true">{WHO[r]}</span> <span className="ks-l-sa">{S(PURUSHA[r])}</span></span>
          {[0, 1, 2].map(c => { const k = r * 3 + c; return <button key={c} className={`an-cell ks-l-sa ${k === s.i ? "now" : k < s.i ? "full" : ""}`} onClick={() => s.go(k)}>{S(verb.P!.lat[r]?.[c]?.[0] ?? "")}</button>; })}
        </React.Fragment>)}
      </div>
      <Controls s={s} />
    </Scene>
  );
};

// ═══ लकाराः: time and mood ═══
/** where each lakāra sits: on the time line (x %, 50 = now) or among the moods */
const LK_POS: Record<string, { x?: number; mood?: number; tag: string }> = {
  lit: { x: 7, tag: "long ago, unseen" }, lan: { x: 22, tag: "past, not today" }, lun: { x: 37, tag: "past, any time" },
  lat: { x: 50, tag: "now" }, lrt: { x: 66, tag: "future, any time" }, lut: { x: 84, tag: "future, not today" },
  lot: { mood: 0, tag: "command, request" }, vidhilin: { mood: 1, tag: "should, may" }, asirlin: { mood: 2, tag: "blessing" }, lrn: { mood: 3, tag: "if … would have" },
};
const LK_SEQ = ["lat", "lun", "lan", "lit", "lrt", "lut", "lot", "vidhilin", "asirlin", "lrn"];
export const LakaraScene: React.FC = () => {
  const S = useSaDeva(); const lang = useLang();
  const verbs = P_VERBS().filter(v => LK_SEQ.every(l => v.P![l]));
  const [vid, setVid] = useState(verbs.find(v => v.w === "भू")?.id ?? verbs[0].id);
  const verb = verbs.find(v => v.id === vid) ?? verbs[0];
  const s = useSteps(LK_SEQ.length, 2300);
  const lk = LK_SEQ[s.i]; const pos = LK_POS[lk]; const cell = verb.P![lk]?.[0]?.[0];
  return (
    <Scene title="दश लकाराः · Six times and four moods">
      <div className="an-pick">{verbs.slice(0, 8).map(v => <button key={v.id} className={v.id === verb.id ? "on" : ""} onClick={() => setVid(v.id)}>{S(v.w)}</button>)}</div>
      <div className="an-timeline">
        <div className="an-axis"><span className="an-past">← भूतम् · past</span><span className="an-nowmark">वर्तमानम् · now</span><span className="an-fut">future · भविष्यत् →</span></div>
        {LK_SEQ.filter(l => LK_POS[l].x !== undefined).map(l => (
          <button key={l} className={`an-lk ${l === lk ? "on" : ""}`} style={{ left: `${LK_POS[l].x}%` }} onClick={() => s.go(LK_SEQ.indexOf(l))}><span className="ks-l-sa">{S(LAKARA[l][0])}</span></button>))}
        {pos.x !== undefined && <span className="an-pin" style={{ left: `${pos.x}%` }} aria-hidden="true">▼</span>}
      </div>
      <div className="an-moods">
        {LK_SEQ.filter(l => LK_POS[l].mood !== undefined).map(l => (
          <button key={l} className={`an-mood ${l === lk ? "on" : ""}`} onClick={() => s.go(LK_SEQ.indexOf(l))}><b className="ks-l-sa">{S(LAKARA[l][0])}</b><small>{LK_POS[l].tag}</small></button>))}
      </div>
      <div className="an-lkcard" key={`${verb.id}-${lk}`}>
        <b className="ks-l-sa">{S(LAKARA[lk][0])}</b> <small>{pos.tag}</small>
        {cell && <button className="an-bubble ks-l-sa" onClick={() => speak(cell[0])}>{S(cell[0])} <small>🔊</small></button>}
        {cell && <span className="an-gloss" dir="auto">“{verbGloss(verb, "P", lk, 0, 0, lang, cell[2])}”</span>}
        <small className="an-sutra ks-l-sa">{S(LAKARA_INFO[lk]?.sutra ?? "")}</small>
      </div>
      <Controls s={s} />
    </Scene>
  );
};

// ═══ अव्ययानि: the ending comes and goes (लुक्) ═══
export const AvyayaScene: React.FC = () => {
  const S = useSaDeva();
  const s = useSteps(9, 1500);
  const done = s.i >= 8;
  return (
    <Scene title="अव्ययादाप्सुपः · The ending is added, then removed">
      {!done
        ? <div className="an-eq" key={s.i}>
            <span className="an-tile an-stem ks-l-sa">{S("यदा")}</span><span className="an-plus">+</span>
            <span className="an-tile an-suf an-vanish ks-l-sa">{S(SUP[s.i][0])}</span>
            <span className="an-arrow">→</span><span className="an-result ks-l-sa">{S("यदा")}</span>
            <span className="an-luk">लुक्</span>
          </div>
        : <p className="an-cap">The same form in every place: the grid is still there, only invisible.</p>}
      <p className="an-cap" key={`c${s.i}`}>{done ? "" : <><b className="ks-l-sa">{S(VIBHAKTI[s.i])}</b>: the ending <span className="ks-l-sa">{S(SUP[s.i][0])}</span> is dropped by <span className="ks-l-sa">{S("अव्ययादाप्सुपः")}</span> (2.4.82)</>}</p>
      <div className="an-grid24 small">
        {Array.from({ length: 24 }, (_, k) => <span key={k} className={`an-cell ks-l-sa ${done || Math.floor(k / 3) <= s.i ? "full" : ""}`} style={{ animationDelay: `${(k % 12) * .04}s` }}>{done || Math.floor(k / 3) <= s.i ? S("यदा") : ""}</span>)}
      </div>
      <Controls s={s} />
    </Scene>
  );
};
