// ═══════════════════════════════════════════════════════════════
//  kosha/krtAnim.tsx — the कृत्प्रत्ययाः part of व्याकरणम्: groups, animations and the quiz.
//    KRT_GROUPS     the suffixes in five groups (अव्यय → वर्तमान → निष्ठा → कृत्य → संज्ञा)
//    SuffixScene    a suffix loses its इत् letters, what remains joins roots → the checked forms
//    ANUBANDHA      six derivations that show what the marker letters do (played as films)
//    PadaCard       शतृ or शानच्: which roots take which (from the roots' pada)
//    KrtQuiz        six levels; every answer is a checked form from app/src/data/krt.json
//  Forms are never put together here: they all come from the checked table (krt.json, made
//  from dhatu_400_krt.json). Sense-restricted suffixes (घञ्, अच्, अप्) are quizzed only
//  with forms attested in the dictionary.
// ═══════════════════════════════════════════════════════════════
import React, { useMemo, useState } from "react";
import { GRAMMAR, KRT, shuffle, type KrtRoot } from "../data";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import { FlagButton } from "../FlagUI";
import { useSteps, Controls } from "../learn/anim";
import { StageFilm, sounds } from "./grammarAnim";

export const KRT_GROUPS: { id: string; sa: string; en: string; members: string[] }[] = [
  { id: "avyaya", sa: "अव्ययकृतः", en: "indeclinables: having done, in order to do", members: ["क्त्वा", "ल्यप्", "तुमुन्", "णमुल्"] },
  { id: "vartamana", sa: "वर्तमानकृतः", en: "present participles: while doing", members: ["शतृ", "शानच्"] },
  { id: "nishtha", sa: "निष्ठा", en: "past participles: done, has done", members: ["क्त", "क्तवतु"] },
  { id: "kritya", sa: "कृत्याः", en: "to be done, ought to be done", members: ["तव्यत्", "तव्य", "अनीयर्", "यत्", "ण्यत्", "क्यप्", "केलिमर्"] },
  { id: "sanjna", sa: "संज्ञाकृतः", en: "nouns: the doer, the act", members: ["ण्वुल्", "तृच्", "अच्", "णिनि", "ल्युट्", "घञ्", "अप्", "क्तिन्"] },
];
export const groupOf = (p: string) => KRT_GROUPS.find(g => g.members.includes(p));
const RESTRICTED = new Set(["घञ्", "अच्", "अप्"]);                 // derivable by rule, used only in some senses
const usable = (r: KrtRoot, p: string) => { const f = r.f[p]; return !!f?.[0] && (!RESTRICTED.has(p) || f[2] === 1); };

/** the suffix as sounds: इत् letters marked, the rest is what joins the root */
export const SuffixScene: React.FC<{ p: string; it: string; rem: string }> = ({ p, it, rem }) => {
  const S = useSa();
  const its = it.split(/[,\s]+/).filter(x => x && x !== "—");
  const snd = sounds(p);
  const marked = new Set<number>();
  // a marker is matched from the end (तुमुन्: the second उ; तव्यत्: the final त्)
  for (const x of its) { let k = -1; snd.forEach((y, i) => { if (!marked.has(i) && y === x) k = i; }); if (k >= 0) marked.add(k); }
  const roots = useMemo(() => shuffle(KRT.filter(r => usable(r, p))).slice(0, 8), [p]);
  const s = useSteps(roots.length + 1, 2400);
  const r = s.i > 0 ? roots[s.i - 1] : null;
  return (
    <div className="an-scene">
      <div className="an-scene-title">🎬 {S(p)} · what joins the root</div>
      <div className="kr-suf" key={`s${s.i === 0 ? 0 : 1}`}>
        {snd.map((x, i) => <span key={i} className={`kr-snd ks-l-sa ${marked.has(i) ? "it" : "keep"} ${s.i > 0 && marked.has(i) ? "gone" : ""}`}>{S(x)}</span>)}
        <span className="kr-arrow">→</span><span className="kr-rem ks-l-sa">{S(rem)}</span>
      </div>
      {s.i === 0
        ? <p className="an-cap">{its.length ? <>The letters in red are <b className="ks-l-sa">{S("इत्")}</b> (markers): they drop, but they decide what happens to the root.</> : "This suffix has no marker letters."}</p>
        : r && <div className="kr-eq" key={r.id}>
            <span className="kr-root ks-l-sa">{S(r.w)}</span><span className="kr-plus">+</span><span className="kr-rem ks-l-sa">{S(rem)}</span>
            <span className="kr-arrow">→</span>
            <button className="an-result ks-l-sa" onClick={() => speak(r.f[p][0])}>{S(r.f[p][0])} <small>🔊</small></button>
            <span className="kr-gl">{r.f[p][1]}</span>
          </div>}
      <Controls s={s} />
    </div>
  );
};

/** what the marker letters do: six derivations, each final form checked against krt.json in the build test */
export const ANUBANDHA: { title: string; steps: [string, string][]; note: string; check: [string, string, string] }[] = [
  { title: "कृ + क्त्वा → कृत्वा", check: ["कृ", "क्त्वा", "कृत्वा"], steps: [
    ["कृ + क्त्वा", "root + suffix"],
    ["कृ + त्वा", "क् at the start of a kṛt suffix is इत् (लशक्वतद्धिते 1.3.8) and drops"],
    ["कृत्वा", "कित्: no guṇa (क्ङिति च 1.1.5); कृ is अनिट् (एकाच उपदेशेऽनुदात्तात् 7.2.10): no इ"]],
    note: "कित् — the root stays as it is." },
  { title: "कृ + तव्यत् → कर्तव्यः", check: ["कृ", "तव्यत्", "कर्तव्यः"], steps: [
    ["कृ + तव्यत्", "root + suffix"],
    ["कृ + तव्य", "the final त् is इत् (हलन्त्यम् 1.3.3)"],
    ["कर्तव्य", "not कित्: guṇa (सार्वधातुकार्धधातुकयोः 7.3.84), ऋ → अर् (उरण् रपरः 1.1.51)"],
    ["कर्तव्यः", "+ सु: masculine, first case, singular"]],
    note: "No क्/ङ् marker — the root vowel is strengthened (guṇa)." },
  { title: "कृ + ण्वुल् → कारकः", check: ["कृ", "ण्वुल्", "कारकः"], steps: [
    ["कृ + ण्वुल्", "root + suffix"],
    ["कृ + वु", "ण् (चुटू 1.3.7) and ल् (हलन्त्यम् 1.3.3) are इत्"],
    ["कृ + अक", "युवोरनाकौ (7.1.1): वु → अक"],
    ["कारक", "णित्: vṛddhi (अचो ञ्णिति 7.2.115), ऋ → आर्"],
    ["कारकः", "+ सु: masculine, first case, singular"]],
    note: "ण् or ञ् marker — the root vowel takes vṛddhi." },
  { title: "पच् + घञ् → पाकः", check: ["पच्", "घञ्", "पाकः"], steps: [
    ["पच् + घञ्", "root + suffix"],
    ["पच् + अ", "घ् (लशक्वतद्धिते 1.3.8) and ञ् (हलन्त्यम् 1.3.3) are इत्"],
    ["पाच् + अ", "ञित्: the अ before the last consonant becomes आ (अत उपधायाः 7.2.116)"],
    ["पाक", "चजोः कु घिण्ण्यतोः (7.3.52): च् → क्"],
    ["पाकः", "+ सु: masculine, first case, singular"]],
    note: "ञित् — vṛddhi of the vowel before the last consonant." },
  { title: "भू + तुमुन् → भवितुम्", check: ["भू", "तुमुन्", "भवितुम्"], steps: [
    ["भू + तुमुन्", "root + suffix"],
    ["भू + तुम्", "उ (उपदेशेऽजनुनासिक इत् 1.3.2) and न् (हलन्त्यम् 1.3.3) are इत्"],
    ["भू + इतुम्", "इट् (आर्धधातुकस्येड्वलादेः 7.2.35): भू is सेट्"],
    ["भो + इतुम्", "guṇa (सार्वधातुकार्धधातुकयोः 7.3.84): ऊ → ओ"],
    ["भवितुम्", "एचोऽयवायावः (6.1.78): ओ → अव्; the word is an avyaya"]],
    note: "इट् — a सेट् root takes इ before the suffix (compare कर्तुम्, from the अनिट् root कृ)." },
  { title: "दृश् + शतृ → पश्यन्", check: ["दृश्", "शतृ", "पश्यन्"], steps: [
    ["दृश् + शतृ", "root + suffix"],
    ["दृश् + अत्", "श् (लशक्वतद्धिते 1.3.8) and ऋ (1.3.2) are इत्"],
    ["दृश् + अ + अत्", "शित् → सार्वधातुक (तिङ्शित्सार्वधातुकम् 3.4.113): शप् is added (कर्तरि शप् 3.1.68); its श् and प् drop"],
    ["पश्य + अ + अत्", "पाघ्राध्मा… (7.3.78): दृश् → पश्य before a शित् suffix"],
    ["पश्यत्", "अतो गुणे (6.1.97): the अ-sounds merge"],
    ["पश्यन्", "+ सु: नुम् (उगिदचां सर्वनामस्थानेऽधातोः 7.1.70), सु drops (6.1.68), the final त् drops (संयोगान्तस्य लोपः 8.2.23)"]],
    note: "श् marker — the suffix is सार्वधातुक, so it is added to the present stem (पश्य-, गच्छ-, कुर्व-)." },
];

export const AnubandhaFilms: React.FC = () => {
  const S = useSa();
  const [k, setK] = useState(0);
  const a = ANUBANDHA[k];
  return (
    <>
      <div className="ga-tabs">{ANUBANDHA.map((x, i) => <button key={x.title} className={i === k ? "on" : ""} onClick={() => setK(i)}><span className="ks-l-sa">{S(x.check[2])}</span></button>)}</div>
      <StageFilm key={k} st={a} />
    </>
  );
};

/** शतृ or शानच्: decided by the root's pada */
export const PadaCard: React.FC = () => {
  const S = useSa();
  const pick = (pada: string, p: string, n = 5) => KRT.filter(r => r.pada === pada && r.f[p]?.[0]).slice(0, n).map(r => r.f[p][0]);
  const rows: [string, string, string[]][] = [
    ["परस्मैपदी", "शतृ only", pick("परस्मैपदी", "शतृ")],
    ["आत्मनेपदी", "शानच् only", pick("आत्मनेपदी", "शानच्")],
    ["उभयपदी", "both", KRT.filter(r => r.pada === "उभयपदी" && r.f["शतृ"]?.[0] && r.f["शानच्"]?.[0]).slice(0, 4).map(r => `${r.f["शतृ"][0]} / ${r.f["शानच्"][0]}`)],
  ];
  return (
    <div className="kr-pada">
      <h4>{S("शतृ वा शानच्?")} · which present participle a root takes</h4>
      <p>Both replace लट् (लटः शतृशानचावप्रथमासमानाधिकरणे 3.2.124). <b>शतृ</b> takes the place of the परस्मैपद endings, <b>शानच्</b> of the आत्मनेपद endings (तङानावात्मनेपदम् 1.4.100). So the root's pada decides:</p>
      <div className="ks-table-wrap"><table className="ks-karaka"><tbody>
        {rows.map(([pada, which, ex]) => <tr key={pada}><td className="ks-l-sa"><b>{S(pada)}</b></td><td>{which}</td><td className="ks-l-sa">{ex.map(x => S(x)).join(", ")}</td></tr>)}
        <tr><td className="ks-l-sa"><b>{S("कर्मणि / भावे")}</b></td><td>passive: शानच् for any root</td><td className="ks-l-sa">{["पठ्यमानः", "क्रियमाणः", "दृश्यमानः", "गम्यमानः"].map(x => S(x)).join(", ")}</td></tr>
      </tbody></table></div>
      <p className="ks-note-plain">So <span className="ks-l-sa">{S("भवमानः, पठमानः, गच्छमानः")}</span> do not exist: भू, पठ्, गम् are परस्मैपदी. And शतृ is a शित् suffix, so it is added to the present stem: <span className="ks-l-sa">{S("पठन्, गच्छन्, पश्यन्, कुर्वन्")}</span> — not *दृशन्, *कृन्.</p>
    </div>
  );
};

// ═══ the quiz ═══
type Q = { id: string; prompt: string; ask: string; options: string[]; answer: string; also: string };
const ROUNDS = 10;
const LEVELS: [number, string, string, string][] = [
  ...KRT_GROUPS.map((g, i) => [i + 1, g.sa, g.en, g.members.join(", ")] as [number, string, string, string]),
  [6, "अनुबन्धाः", "what the marker letters do", "इत्, guṇa, vṛddhi, इट्, the present stem"],
];
const P = GRAMMAR.pratyaya.list;
function opts(answer: string, pool: string[], bad: Set<string> = new Set()): string[] {
  const out = [answer]; const seen = new Set([answer, ...bad]);
  for (const p of shuffle(pool)) { if (out.length >= 4) break; if (p && !seen.has(p)) { seen.add(p); out.push(p); } }
  return shuffle(out);
}
/** hand-checked questions for level 6 */
const ANU_Q: Q[] = [
  { id: "a1", prompt: "कृतः, कृत्वा", ask: "Why is there no guṇa (not *कर्तः)?", answer: "क्ङिति च (1.1.5)", options: ["क्ङिति च (1.1.5)", "सार्वधातुकार्धधातुकयोः (7.3.84)", "अचो ञ्णिति (7.2.115)", "अत उपधायाः (7.2.116)"], also: "क्त and क्त्वा are कित्: a कित् or ङित् suffix blocks guṇa and vṛddhi." },
  { id: "a2", prompt: "कारकः", ask: "Which sūtra gives the आ in का-?", answer: "अचो ञ्णिति (7.2.115)", options: ["अचो ञ्णिति (7.2.115)", "क्ङिति च (1.1.5)", "अकः सवर्णे दीर्घः (6.1.101)", "आद्गुणः (6.1.87)"], also: "ण्वुल् is णित्: a root ending in a vowel takes vṛddhi." },
  { id: "a3", prompt: "पाकः (पच् + घञ्)", ask: "Which sūtra lengthens the अ of पच्?", answer: "अत उपधायाः (7.2.116)", options: ["अत उपधायाः (7.2.116)", "अचो ञ्णिति (7.2.115)", "पुगन्तलघूपधस्य च (7.3.86)", "अकः सवर्णे दीर्घः (6.1.101)"], also: "घञ् is ञित्: the अ before the last consonant becomes आ." },
  { id: "a4", prompt: "पाकः (पच् + घञ्)", ask: "Why क् and not च्?", answer: "चजोः कु घिण्ण्यतोः (7.3.52)", options: ["चजोः कु घिण्ण्यतोः (7.3.52)", "झलां जशोऽन्ते (8.2.39)", "खरि च (8.4.55)", "स्तोः श्चुना श्चुः (8.4.40)"], also: "Before a घित् or ण्यत् suffix, च्/ज् become क्/ग्: पाकः, भोग्यम्." },
  { id: "a5", prompt: "भवितुम्", ask: "Where does the इ come from?", answer: "आर्धधातुकस्येड्वलादेः (7.2.35)", options: ["आर्धधातुकस्येड्वलादेः (7.2.35)", "इको यणचि (6.1.77)", "एकाच उपदेशेऽनुदात्तात् (7.2.10)", "क्ङिति च (1.1.5)"], also: "An आर्धधातुक suffix beginning with a consonant other than य् takes इट् after a सेट् root." },
  { id: "a6", prompt: "कर्तुम्", ask: "Why is there no इ, unlike भवितुम्?", answer: "कृ is अनिट् (एकाच उपदेशेऽनुदात्तात् 7.2.10)", options: ["कृ is अनिट् (एकाच उपदेशेऽनुदात्तात् 7.2.10)", "तुमुन् never takes इ", "the suffix is कित्", "कृ is आत्मनेपदी"], also: "Most one-vowel roots that are अनुदात्त in the Dhātupāṭha do not take इट्." },
  { id: "a7", prompt: "कारकः, करणम्", ask: "Which sūtra turns वु into अक and यु into अन?", answer: "युवोरनाकौ (7.1.1)", options: ["युवोरनाकौ (7.1.1)", "आने मुक् (7.2.82)", "ल्युट् च (3.3.115)", "ण्वुल्तृचौ (3.1.133)"], also: "ण्वुल् → वु → अक; ल्युट् → यु → अन." },
  { id: "a8", prompt: "पश्यन्", ask: "Why पश्य-, and not दृश्-?", answer: "शतृ is शित्, so the present stem is used (7.3.78)", options: ["शतृ is शित्, so the present stem is used (7.3.78)", "the suffix is कित्", "दृश् is आत्मनेपदी", "इट् is added"], also: "शित् suffixes are सार्वधातुक (3.4.113): they take शप् and the present-stem substitutes (पाघ्राध्मा… 7.3.78)." },
  { id: "a9", prompt: "लभमानः", ask: "Why शानच्, and not शतृ (*लभन्)?", answer: "लभ् is आत्मनेपदी", options: ["लभ् is आत्मनेपदी", "लभ् is परस्मैपदी", "शानच् is for the past", "शतृ needs a prefix"], also: "शानच् replaces the आत्मनेपद endings of लट् (तङानावात्मनेपदम् 1.4.100)." },
  { id: "a10", prompt: "भवमानः", ask: "Is this a correct form of भू?", answer: "No: भू is परस्मैपदी, so only भवन्", options: ["No: भू is परस्मैपदी, so only भवन्", "Yes: the active present participle", "Yes: the passive present participle", "Yes: both भवन् and भवमानः"], also: "शानच् (कर्तरि) is only for आत्मनेपदी and उभयपदी roots; भू is परस्मैपदी." },
];
export function makeQuiz(level: number): Q[] {
  if (level === 6) {
    const made: Q[] = P.filter(x => x.it && x.it !== "—").flatMap(x => [
      { id: `it:${x.p}`, prompt: x.p, ask: "इत् · Which letters are markers (they drop)?", answer: x.it,
        options: opts(x.it, P.map(y => y.it).filter(y => y && y !== "—")), also: `${x.p} → ${x.rem} · ${x.sutra}` },
      { id: `rem:${x.p}`, prompt: x.p, ask: "शिष्टः · What is added to the root?", answer: x.rem,
        // leave out options that start the same way (अ vs अ (+ वृद्धि)), so only one can look right
        options: opts(x.rem, P.map(y => y.rem).filter(y => y.split(" ")[0] !== x.rem.split(" ")[0])), also: `इत्: ${x.it} · ${x.sutra}` },
    ]);
    return shuffle([...shuffle(ANU_Q).slice(0, 6), ...shuffle(made).slice(0, 4)]);
  }
  const g = KRT_GROUPS[level - 1];
  const members = g.members.filter(m => KRT.some(r => usable(r, m)));
  const out: Q[] = []; const seen = new Set<string>(); let guard = 0;
  while (out.length < ROUNDS && guard++ < 500) {
    const p = members[Math.floor(Math.random() * members.length)];
    const roots = KRT.filter(r => usable(r, p)); const r = roots[Math.floor(Math.random() * roots.length)];
    const form = r.f[p][0]; const meta = P.find(x => x.p === p);
    const also = `${r.w} + ${p} = ${form} · ${r.f[p][1]}${meta ? ` · ${meta.sutra}` : ""}`;
    const kind = level === 2 && Math.random() < .35 ? "pada" : Math.random() < .55 ? "form" : "suffix";
    if (kind === "pada") {
      const ans = r.pada === "परस्मैपदी" ? "शतृ only" : r.pada === "आत्मनेपदी" ? "शानच् only" : "both (उभयपदी)";
      const ok = (r.pada !== "आत्मनेपदी" ? !!r.f["शतृ"]?.[0] : true) && (r.pada !== "परस्मैपदी" ? !!r.f["शानच्"]?.[0] : true);
      if (!ok || seen.has(`pada:${r.w}`)) continue;
      seen.add(`pada:${r.w}`);
      out.push({ id: `pada:${r.w}`, prompt: `${r.w} (${r.en})`, ask: "Which present participle does this root take (कर्तरि)?", answer: ans, options: shuffle(["शतृ only", "शानच् only", "both (उभयपदी)"]), also: `${r.w} is ${r.pada}${r.f["शतृ"]?.[0] ? ` · शतृ: ${r.f["शतृ"][0]}` : ""}${r.f["शानच्"]?.[0] ? ` · शानच्: ${r.f["शानच्"][0]}` : ""}` });
    } else if (kind === "form") {
      const id = `f:${r.w}:${p}`; if (seen.has(id)) continue; seen.add(id);
      // wrong options: the same root's real forms with other suffixes (none of them can also be right)
      const pool = Object.entries(r.f).filter(([s, f]) => s !== p && f[0] && f[0] !== form).map(([, f]) => f[0]);
      if (pool.length < 3) continue;
      out.push({ id, prompt: `${r.w} + ${p}`, ask: "किं रूपम्? · Which form?", answer: form, options: opts(form, pool), also });
    } else {
      const id = `s:${r.w}:${p}`; if (seen.has(id)) continue; seen.add(id);
      // wrong options: other suffixes that do NOT give this same form for this root (तव्यत् and तव्य look alike)
      const same = new Set(Object.entries(r.f).filter(([, f]) => f[0] === form).map(([s]) => s));
      const pool = [...members, ...KRT_GROUPS.flatMap(x => x.members)].filter(s => !same.has(s) && P.some(x => x.p === s));
      out.push({ id, prompt: form, ask: `कः प्रत्ययः? · ${r.w} + which suffix?`, answer: p, options: opts(p, pool, new Set([...same].filter(s => s !== p))), also });
    }
  }
  return out;
}

export const KrtQuiz: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const S = useSa();
  const [level, setLevel] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => (level ? makeQuiz(level) : []), [level, round]);   // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const restart = (lv: number | null) => { setLevel(lv); setRound(r => r + 1); setI(0); setChosen(null); setScore(0); };
  if (level === null) return (
    <div className="un-levels">
      <p className="ks-note-plain">स्तरं चिनुत · Choose a level. Each round has {ROUNDS} questions. Every answer is a checked form from the kṛdanta table; the wrong options are real forms of the same root with other suffixes. <button className="un-link" onClick={onClose}>← back to the suffixes</button></p>
      {LEVELS.map(([id, sa, en, focus]) => (
        <button key={id} className="un-level" onClick={() => restart(id)}>
          <b className="ks-l-sa">{id}. {S(sa)}</b><span>{en}</span><small className="ks-l-sa">{S(focus)}</small>
        </button>))}
    </div>
  );
  const lv = LEVELS.find(l => l[0] === level)!;
  if (i >= qs.length) return (
    <div className="ks-card un-done">
      <h3 className="ks-l-sa">{S(lv[1])}</h3>
      <p className="un-score">{score} / {qs.length}</p>
      <div className="ks-chips"><button className="on" onClick={() => restart(level)}>पुनः · Play again</button><button onClick={() => restart(null)}>स्तराः · Choose a level</button></div>
    </div>
  );
  const q = qs[i];
  const answer = (o: string) => { if (chosen !== null) return; setChosen(o); if (o === q.answer) setScore(n => n + 1); };
  return (
    <div className="ks-card un-quiz">
      <div className="un-top"><span className="ks-sub ks-l-sa">{level}. {S(lv[1])}</span><span>{i + 1} / {qs.length} · Score: {score}</span>
        <button className="un-link" onClick={() => restart(null)}>स्तराः · Levels</button></div>
      <div className="ks-head"><h3 className="ks-l-sa">{S(q.prompt)}</h3></div>
      <p className="un-ask ks-l-sa">{S(q.ask)}</p>
      <div className="un-opts">{q.options.map(o => (
        <button key={o} onClick={() => answer(o)} disabled={chosen !== null}
          className={`un-opt ks-l-sa ${chosen === null ? "" : o === q.answer ? "ok" : o === chosen ? "bad" : "dim"}`}>{S(o)}</button>))}</div>
      {chosen !== null && <>
        <p className={`un-verdict ${chosen === q.answer ? "ok" : "bad"}`}>{chosen === q.answer ? "साधु! · Correct" : <>उत्तरम् · Answer: <span className="ks-l-sa">{S(q.answer)}</span></>}</p>
        <p className="un-also ks-l-sa">{S(q.also)}</p>
        <div className="un-next">
          <FlagButton t={{ kind: "grammar", id: `krt-quiz:${q.id}`, field: "question", value: `${q.prompt} | ${q.ask} → ${q.answer}`, where: `कृत्परीक्षा ${level}` }} label="Report" />
          <button className="on" onClick={() => { setI(i + 1); setChosen(null); }}>{i + 1 < qs.length ? "अग्रे · Next" : "फलम् · Result"}</button>
        </div>
      </>}
    </div>
  );
};
