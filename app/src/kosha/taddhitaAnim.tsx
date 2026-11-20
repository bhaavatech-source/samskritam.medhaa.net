// ═══════════════════════════════════════════════════════════════
//  kosha/taddhitaAnim.tsx — the तद्धिताः part of व्याकरणम्: the map, animations and the quiz.
//    TaddhitaMap    the adhikāra 4.1.76 → 5.4.160 as a bar of eight pādas; each heading lights up its stretch
//    TD_FILMS       seven derivations that show what the markers and replacements do (played as films)
//    TdSuffixScene  a suffix loses its इत् letters, what remains joins the stems of its own examples
//    TaddhitaQuiz   seven levels; every answer is a form, suffix or meaning from GRAMMAR.taddhita
//  Nothing is put together here: forms come from the checked list (data-source/04-taddhita).
// ═══════════════════════════════════════════════════════════════
import React, { useMemo, useState } from "react";
import { GRAMMAR, shuffle, type TaddhitaPratyaya } from "../data";
import { useSa } from "../i18n/script";
import { useLang } from "../settings";
import { speak } from "../speech";
import { FlagButton } from "../FlagUI";
import { useSteps, Controls } from "../learn/anim";
import { StageFilm, sounds } from "./grammarAnim";

const T = GRAMMAR.taddhita;
const mean = (m: Record<string, string>, lang: string) => m[lang] || m.en;

// ═══ the map ═══
const PADA_LEN = T.padas.map(([, a, z]) => z - a + 1);
const TOTAL = PADA_LEN.reduce((a, b) => a + b, 0);
/** "4.2.67" → position 0…TOTAL along the adhikāra */
function pos(n: string): number {
  const [a, b, c] = n.split(".");
  const k = T.padas.findIndex(([p]) => p === `${a}.${b}`);
  if (k < 0) return 0;
  return PADA_LEN.slice(0, k).reduce((x, y) => x + y, 0) + (+c - T.padas[k][1]);
}
const span = (a: string, z: string) => pos(z) - pos(a) + 1;

export const TaddhitaMap: React.FC = () => {
  const S = useSa();
  const s = useSteps(T.map.length, 3200);
  const m = T.map[s.i];
  const left = pos(m.a) / TOTAL * 100, width = span(m.a, m.z) / TOTAL * 100;
  return (
    <div className="an-scene td-map">
      <div className="an-scene-title">🗺️ {S("तद्धिताधिकारः")} · {TOTAL.toLocaleString("en")} sūtras, 4.1.76 – 5.4.160</div>
      <div className="td-bar">
        {T.padas.map(([p], i) => <div key={p} className="td-pada" style={{ flexGrow: PADA_LEN[i], animationDelay: `${i * .08}s` }}><span>{p}</span><small>{PADA_LEN[i]}</small></div>)}
        <div className="td-hi" key={s.i} style={{ left: `${left}%`, width: `${Math.max(width, .8)}%` }} />
      </div>
      <div className="td-card" key={`c${s.i}`}>
        <div className="td-head"><b className="ks-l-sa">{S(m.s)}</b> <span>({m.n})</span></div>
        <div className="td-range">{m.a === m.z ? m.a : `${m.a} – ${m.z}`} · {span(m.a, m.z)} sūtras</div>
        <p>{m.en}{m.p && <> · <span className="ks-l-sa">{S(m.p)}</span></>}</p>
        {m.ex && <p className="td-ex ks-l-sa">{m.ex.split(", ").map(w => <button key={w} className="an-result" onClick={() => speak(w)}>{S(w)}</button>)}</p>}
      </div>
      <Controls s={s} />
    </div>
  );
};

// ═══ derivations; the build test checks that each final form is an example of its suffix ═══
export const TD_FILMS: { title: string; steps: [string, string][]; note: string; check: [string, string, string] }[] = [
  { title: "दशरथ + इञ् → दाशरथिः", check: ["दशरथ", "इञ्", "दाशरथिः"], steps: [
    ["दशरथ + इञ्", "stem + suffix (अत इञ् 4.1.95: son of)"],
    ["दशरथ + इ", "ञ् is इत् (हलन्त्यम् 1.3.3) and drops"],
    ["दशरथ् + इ", "यस्येति च (6.4.148): the final अ of the stem drops before the suffix"],
    ["दाशरथ् + इ", "ञित्: the first vowel takes vṛddhi (तद्धितेष्वचामादेः 7.2.117): द → दा"],
    ["दाशरथिः", "+ सु: masculine, first case, singular"]],
    note: "ञ् or ण् marker — vṛddhi of the first vowel of the stem." },
  { title: "उपगु + अण् → औपगवः", check: ["उपगु", "अण्", "औपगवः"], steps: [
    ["उपगु + अण्", "stem + suffix (तस्यापत्यम् 4.1.92)"],
    ["उपगु + अ", "ण् is इत् (हलन्त्यम् 1.3.3)"],
    ["उपगो + अ", "ओर्गुणः (6.4.146): the final उ takes guṇa"],
    ["उपगव् + अ", "एचोऽयवायावः (6.1.78): ओ → अव्"],
    ["औपगव", "णित्: vṛddhi of the first vowel (7.2.117): उ → औ"],
    ["औपगवः", "+ सु"]],
    note: "A final उ does not drop: it becomes अव्." },
  { title: "कुन्ती + ढक् → कौन्तेयः", check: ["कुन्ती", "ढक्", "कौन्तेयः"], steps: [
    ["कुन्ती + ढक्", "stem + suffix (स्त्रीभ्यो ढक् 4.1.120)"],
    ["कुन्ती + ढ", "क् is इत् by हलन्त्यम् (1.3.3). (लशक्वतद्धिते 1.3.8 does not apply: it excludes taddhitas.)"],
    ["कुन्ती + एय", "आयनेयीनीयियः फढखच्छघां प्रत्ययादीनाम् (7.1.2): ढ → एय्"],
    ["कुन्त् + एय", "यस्येति च (6.4.148): the final ई drops"],
    ["कौन्तेय", "कित्: vṛddhi of the first vowel (किति च 7.2.118): उ → औ"],
    ["कौन्तेयः", "+ सु"]],
    note: "A क् marker also brings vṛddhi in a taddhita (7.2.118) — unlike a kṛt suffix, where it blocks guṇa." },
  { title: "दिन + ठञ् → दैनिकम्", check: ["दिन", "ठञ्", "दैनिकम्"], steps: [
    ["दिन + ठञ्", "stem + suffix (कालाट्ठञ् 4.3.11)"],
    ["दिन + ठ", "ञ् is इत् (1.3.3)"],
    ["दिन + इक", "ठस्येकः (7.3.50): ठ → इक"],
    ["दिन् + इक", "यस्येति च (6.4.148)"],
    ["दैनिक", "ञित्: vṛddhi (7.2.117): इ → ऐ"],
    ["दैनिकम्", "+ सु: neuter"]],
    note: "ठ is never heard: it always becomes इक (or क after इस्, उस्, उक्, त् — 7.3.51)." },
  { title: "लघु + इष्ठन् → लघिष्ठः", check: ["लघु", "इष्ठन्", "लघिष्ठः"], steps: [
    ["लघु + इष्ठन्", "stem + suffix (अतिशायने तमबिष्ठनौ 5.3.55)"],
    ["लघु + इष्ठ", "न् is इत् (1.3.3)"],
    ["लघ् + इष्ठ", "टेः (6.4.155): the last vowel with what follows it (the टि) drops before इष्ठ, इमन्, ईयस्"],
    ["लघिष्ठः", "+ सु"]],
    note: "The same rule gives लघीयान्, लघिमा; महत् → महिष्ठः (the टि is अत्)." },
  { title: "गुण + मतुप् → गुणवान्", check: ["गुण", "मतुप्", "गुणवान्"], steps: [
    ["गुण + मतुप्", "stem + suffix (तदस्यास्त्यस्मिन्निति मतुप् 5.2.94)"],
    ["गुण + मत्", "उ (उपदेशेऽजनुनासिक इत् 1.3.2) and प् (1.3.3) are इत्"],
    ["गुणवत्", "मादुपधायाश्च मतोर्वोऽयवादिभ्यः (8.2.9): after a stem in अ, म → व"],
    ["गुणवन्त् + स्", "+ सु: नुम् (उगिदचां सर्वनामस्थानेऽधातोः 7.1.70: मतुप् has the marker उ)"],
    ["गुणवान्त् + स्", "अत्वसन्तस्य चाधातोः (6.4.14): the अ is lengthened"],
    ["गुणवान्", "सु drops (6.1.68), then the final त् (संयोगान्तस्य लोपः 8.2.23)"]],
    note: "After श्री, बुद्धि, धी the म stays: श्रीमान्, बुद्धिमान्." },
  { title: "शुक्ल + च्वि → शुक्लीभवति", check: ["शुक्ल", "च्वि", "शुक्लीभवति"], steps: [
    ["शुक्ल + च्वि", "stem + suffix, with भू (कृभ्वस्तियोगे सम्पद्यकर्तरि च्विः 5.4.50: becomes what it was not)"],
    ["शुक्ल + व्", "च् (1.3.7) and the इ (1.3.2) are इत्"],
    ["शुक्ल", "वेरपृक्तस्य (6.1.67): the lone व् drops — nothing of the suffix is left"],
    ["शुक्ली", "अस्य च्वौ (7.4.32): the final अ → ई"],
    ["शुक्लीभवति", "the stem is now a gati (ऊर्यादिच्विडाचश्च 1.4.61) and joins भवति"]],
    note: "The suffix leaves no sound — only its effect: अ → ई (and इ/उ → ई/ऊ: शुचीभवति)." },
];

export const TdFilms: React.FC = () => {
  const S = useSa();
  const [k, setK] = useState(0);
  const a = TD_FILMS[k];
  return (
    <>
      <div className="ga-tabs">{TD_FILMS.map((x, i) => <button key={x.title} className={i === k ? "on" : ""} onClick={() => setK(i)}><span className="ks-l-sa">{S(x.check[2])}</span></button>)}</div>
      <StageFilm key={k} st={a} />
    </>
  );
};

/** the suffix as sounds: इत् letters marked; then its own examples, stem + what remains → form */
export const TdSuffixScene: React.FC<{ x: TaddhitaPratyaya }> = ({ x }) => {
  const S = useSa(); const lang = useLang();
  const head = x.p.split(" ")[0];
  const snd = sounds(head);
  const its = x.it.split(/[\s,]+/).filter(t => t && !t.startsWith("(") && t !== "—");
  const marked = new Set<number>();
  for (const t of its) { let k = -1; snd.forEach((y, i) => { if (!marked.has(i) && y === t) k = i; }); if (k >= 0) marked.add(k); }
  const rem = x.rem.split(" (")[0];
  const s = useSteps(x.ex.length + 1, 2600);
  const e = s.i > 0 ? x.ex[s.i - 1] : null;
  return (
    <div className="an-scene">
      <div className="an-scene-title">🎬 {S(x.p)} · what joins the stem</div>
      <div className="kr-suf" key={`s${s.i === 0 ? 0 : 1}`}>
        {snd.map((t, i) => <span key={i} className={`kr-snd ks-l-sa ${marked.has(i) ? "it" : "keep"} ${s.i > 0 && marked.has(i) ? "gone" : ""}`}>{S(t)}</span>)}
        <span className="kr-arrow">→</span><span className="kr-rem ks-l-sa">{S(rem)}</span>
      </div>
      {s.i === 0
        ? <p className="an-cap">{marked.size ? <>The letters in red are <b className="ks-l-sa">{S("इत्")}</b> (markers): they drop, but they decide what happens to the stem.</> : "This suffix has no marker letters."}</p>
        : e && <div className="kr-eq" key={e.w}>
            <span className="kr-root ks-l-sa">{S(e.b)}</span><span className="kr-plus">+</span><span className="kr-rem ks-l-sa">{S(rem)}</span>
            <span className="kr-arrow">→</span>
            <button className="an-result ks-l-sa" onClick={() => speak(e.w)}>{S(e.w)} <small>🔊</small></button>
            <span className="kr-gl">{mean(e.m, lang)}</span>
          </div>}
      <Controls s={s} />
    </div>
  );
};

// ═══ the quiz ═══
type Q = { id: string; prompt: string; ask: string; options: string[]; answer: string; also: string };
const ROUNDS = 10;
export const TD_LEVELS: { n: number; sa: string; en: string; g: string[] }[] = [
  { n: 1, sa: "अपत्यार्थकाः", en: "son, descendant", g: ["apatya"] },
  { n: 2, sa: "भावार्थकाः", en: "-ness: abstract nouns", g: ["bhava"] },
  { n: 3, sa: "मत्वर्थीयाः · सम्बन्धः · विशेषः", en: "having; of, from; made of, like, small", g: ["matup", "sambandha", "vishesha"] },
  { n: 4, sa: "तारतम्यम्", en: "more and most", g: ["tulana"] },
  { n: 5, sa: "अव्ययानि · संख्याः · च्व्यादयः", en: "where, when, how; numbers; becoming", g: ["avyaya", "sankhya", "cvi"] },
  { n: 6, sa: "समासान्ताः", en: "added at the end of compounds", g: ["samasanta"] },
  { n: 7, sa: "अनुबन्धाः", en: "what the markers and replacements do", g: [] },
];
const L = T.list;
const ALL = L.flatMap(x => x.ex.map(e => ({ x, e })));
const remKey = (r: string) => r.split(" (")[0].split(" /")[0].trim();
function opts(answer: string, pool: string[]): string[] {
  const out = [answer]; const seen = new Set([answer]);
  for (const p of shuffle(pool)) { if (out.length >= 4) break; if (p && !seen.has(p)) { seen.add(p); out.push(p); } }
  return shuffle(out);
}
/** hand-checked questions for the last level */
export const TD_ANU_Q: Q[] = [
  { id: "t1", prompt: "दाशरथिः", ask: "Which sūtra gives the आ in दा-?", answer: "तद्धितेष्वचामादेः (7.2.117)", options: ["तद्धितेष्वचामादेः (7.2.117)", "अचो ञ्णिति (7.2.115)", "अत उपधायाः (7.2.116)", "अकः सवर्णे दीर्घः (6.1.101)"], also: "इञ् is ञित्: in a taddhita, the first vowel of the stem takes vṛddhi." },
  { id: "t2", prompt: "कौन्तेयः", ask: "ढक् has no ञ् or ण्. Why the vṛddhi कौ-?", answer: "किति च (7.2.118)", options: ["किति च (7.2.118)", "क्ङिति च (1.1.5)", "तद्धितेष्वचामादेः (7.2.117)", "ओर्गुणः (6.4.146)"], also: "In a taddhita a क् marker also brings vṛddhi of the first vowel." },
  { id: "t3", prompt: "कौन्तेयः", ask: "Where does -एय come from?", answer: "ढ → एय् (7.1.2)", options: ["ढ → एय् (7.1.2)", "ठ → इक (7.3.50)", "वु → अक (7.1.1)", "छ → ईय् (7.1.2)"], also: "आयनेयीनीयियः फढखच्छघां प्रत्ययादीनाम्: फ → आयन्, ढ → एय्, ख → ईन्, छ → ईय्, घ → इय्." },
  { id: "t4", prompt: "ढक्", ask: "Which sūtra makes the क् of ढक् a marker (इत्)?", answer: "हलन्त्यम् (1.3.3)", options: ["हलन्त्यम् (1.3.3)", "लशक्वतद्धिते (1.3.8)", "चुटू (1.3.7)", "उपदेशेऽजनुनासिक इत् (1.3.2)"], also: "It is the last consonant of the suffix. 1.3.8 (an initial ल्, श् or क-row letter) does not apply to taddhita suffixes." },
  { id: "t5", prompt: "दैनिकम्", ask: "Which sūtra turns ठ into इक?", answer: "ठस्येकः (7.3.50)", options: ["ठस्येकः (7.3.50)", "युवोरनाकौ (7.1.1)", "आयनेयीनीयियः… (7.1.2)", "इसुसुक्तान्तात्कः (7.3.51)"], also: "ठ → इक; after इस्, उस्, उक् or त् it becomes क (7.3.51)." },
  { id: "t6", prompt: "दाशरथिः", ask: "What removes the final अ of दशरथ?", answer: "यस्येति च (6.4.148)", options: ["यस्येति च (6.4.148)", "अतो गुणे (6.1.97)", "अतो लोपः (6.4.48)", "टेः (6.4.155)"], also: "Before a taddhita (or ई), a भ stem drops its final अ/आ/इ/ई." },
  { id: "t7", prompt: "औपगवः", ask: "Why -गव and not *-ग?", answer: "ओर्गुणः (6.4.146), then ओ → अव्", options: ["ओर्गुणः (6.4.146), then ओ → अव्", "यस्येति च (6.4.148)", "इको यणचि (6.1.77)", "टेः (6.4.155)"], also: "A final उ/ऊ of a भ stem takes guṇa before a taddhita; it does not drop." },
  { id: "t8", prompt: "गुणवान्", ask: "Why व, and not *गुणमान्?", answer: "मादुपधायाश्च मतोर्वोऽयवादिभ्यः (8.2.9)", options: ["मादुपधायाश्च मतोर्वोऽयवादिभ्यः (8.2.9)", "झयः (8.2.10)", "यरोऽनुनासिकेऽनुनासिको वा (8.4.45)", "मोऽनुस्वारः (8.3.23)"], also: "After a stem ending in म् or अ/आ, or with म/अ before its last letter, मतुप् has व: गुणवान्, but श्रीमान्, बुद्धिमान्." },
  { id: "t9", prompt: "लघिष्ठः", ask: "Where did the उ of लघु go?", answer: "टेः (6.4.155)", options: ["टेः (6.4.155)", "यस्येति च (6.4.148)", "ओर्गुणः (6.4.146)", "लोपो व्योर्वलि (6.1.66)"], also: "Before इष्ठ, इमन्, ईयस् the टि (last vowel with what follows) drops: लघिष्ठः, महिमा." },
  { id: "t10", prompt: "शुक्लीभवति", ask: "The अ of शुक्ल becomes ई by…", answer: "अस्य च्वौ (7.4.32)", options: ["अस्य च्वौ (7.4.32)", "अकृत्सार्वधातुकयोर्दीर्घः (7.4.25)", "यस्येति च (6.4.148)", "तद्धितेष्वचामादेः (7.2.117)"], also: "Before च्वि a final अ becomes ई: कृष्णीकरोति, भस्मीभवति (न् drops: 8.2.7)." },
  { id: "t11", prompt: "शुक्लीभवति", ask: "What is left of the suffix च्वि?", answer: "Nothing: the lone व् drops (वेरपृक्तस्य 6.1.67)", options: ["Nothing: the lone व् drops (वेरपृक्तस्य 6.1.67)", "वि", "ई", "इ"], also: "च् and इ are इत्; the remaining व् is a one-letter suffix (अपृक्त) and drops." },
  { id: "t12", prompt: "दशरथस्य अपत्यम् = दाशरथिः", ask: "Must the taddhita be used?", answer: "No: the phrase may be used instead (समर्थानां प्रथमाद्वा 4.1.82)", options: ["No: the phrase may be used instead (समर्थानां प्रथमाद्वा 4.1.82)", "Yes, always", "Only in verse", "Only with names of kings"], also: "वा in 4.1.82 makes every taddhita optional: the meaning can also be said in words." },
  { id: "t13", prompt: "महाराजः", ask: "Why -राजः and not *-राजा?", answer: "टच् is added (राजाऽहस्सखिभ्यष्टच् 5.4.91)", options: ["टच् is added (राजाऽहस्सखिभ्यष्टच् 5.4.91)", "राजन् is an अ-stem", "the न् drops by 8.2.7 only", "it is a bahuvrīhi"], also: "A tatpuruṣa ending in राजन् takes the samāsānta टच्; the टि अन् drops (नस्तद्धिते 6.4.144)." },
];

export function makeTdQuiz(level: number, lang: string): Q[] {
  if (level === 7) {
    const withIt = L.filter(x => x.it && !x.it.includes("(") && x.it !== "—");
    const remOk = L.filter(x => !/[(/—]/.test(x.rem));
    const made: Q[] = [
      ...withIt.map(x => ({ id: `it:${x.id}`, prompt: x.p, ask: "इत् · Which letters are markers (they drop)?", answer: x.it,
        options: opts(x.it, withIt.map(y => y.it)), also: `${x.p} → ${x.rem} · ${x.sutra} (${x.num})` })),
      ...remOk.map(x => ({ id: `rem:${x.id}`, prompt: x.p, ask: "शिष्टः · What is added to the stem?", answer: x.rem,
        options: opts(x.rem, remOk.map(y => y.rem).filter(r => remKey(r) !== remKey(x.rem))), also: `${x.ex.slice(0, 2).map(e => `${e.b} → ${e.w}`).join(", ")} · ${x.sutra}` })),
    ];
    return shuffle([...shuffle(TD_ANU_Q).slice(0, 6), ...shuffle(made).slice(0, 4)]);
  }
  const lv = TD_LEVELS[level - 1];
  const pool = ALL.filter(({ x }) => lv.g.includes(x.g));
  const out: Q[] = []; const seen = new Set<string>(); let guard = 0;
  while (out.length < Math.min(ROUNDS, pool.length) && guard++ < 600) {
    const { x, e } = pool[Math.floor(Math.random() * pool.length)];
    const also = `${e.b} + ${x.p} = ${e.w} · ${mean(e.m, lang)} · ${x.sutra} (${x.num})`;
    const r = Math.random();
    // same stem, other suffixes: real words that are wrong here
    const sibs = ALL.filter(o => o.e.b === e.b && o.e.w !== e.w && o.x.p !== x.p).map(o => o.e.w);
    if (r < .4 && sibs.length >= 3) {
      const id = `f:${x.id}:${e.w}`; if (seen.has(id)) continue; seen.add(id);
      out.push({ id, prompt: `${e.b} + ${x.p}`, ask: "किं रूपम्? · Which form?", answer: e.w, options: opts(e.w, sibs), also });
    } else if (r < .75) {
      const id = `s:${x.id}:${e.w}`; if (seen.has(id)) continue; seen.add(id);
      // leave out suffixes that leave the same sound (यञ्, ण्य, यक्, यत् all leave य): only one option may look right
      const cands = [...L.filter(y => lv.g.includes(y.g)), ...L].filter(y => remKey(y.rem) !== remKey(x.rem)).map(y => y.p);
      out.push({ id, prompt: e.w, ask: `कः प्रत्ययः? · ${e.b} + which suffix?`, answer: x.p, options: opts(x.p, cands), also });
    } else {
      const id = `m:${x.id}:${e.w}`; if (seen.has(id)) continue; seen.add(id);
      const ans = mean(e.m, lang);
      // leave out meanings that share a phrase with the answer (तदा “then” and तर्हि “then, in that case”)
      const parts = (t: string) => t.toLowerCase().split(/[,;/()]+/).map(z => z.trim()).filter(Boolean);
      const mine = new Set(parts(ans));
      const others = pool.filter(o => o.e.w !== e.w).map(o => mean(o.e.m, lang)).filter(t => t !== ans && !parts(t).some(z => mine.has(z)));
      out.push({ id, prompt: e.w, ask: "कोऽर्थः? · What does it mean?", answer: ans, options: opts(ans, others), also });
    }
  }
  return out;
}

export const TaddhitaQuiz: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const S = useSa(); const lang = useLang();
  const [level, setLevel] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const qs = useMemo(() => (level ? makeTdQuiz(level, lang) : []), [level, round, lang]);   // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const restart = (lv: number | null) => { setLevel(lv); setRound(r => r + 1); setI(0); setChosen(null); setScore(0); };
  if (level === null) return (
    <div className="un-levels">
      <p className="ks-note-plain">स्तरं चिनुत · Choose a level. Each round has up to {ROUNDS} questions. Every answer is a checked form from the list; the wrong forms are real words made from the same stem with other suffixes. <button className="un-link" onClick={onClose}>← back to the suffixes</button></p>
      {TD_LEVELS.map(l => (
        <button key={l.n} className="un-level" onClick={() => restart(l.n)}>
          <b className="ks-l-sa">{l.n}. {S(l.sa)}</b><span>{l.en}</span>
          <small className="ks-l-sa">{S(l.g.length ? L.filter(x => l.g.includes(x.g)).map(x => x.p).filter((p, k, a) => a.indexOf(p) === k).join(", ") : "इत्, वृद्धि, ढ → एय, ठ → इक, यस्येति च, टेः, मतुप् म → व")}</small>
        </button>))}
    </div>
  );
  const lv = TD_LEVELS[level - 1];
  if (i >= qs.length) return (
    <div className="ks-card un-done">
      <h3 className="ks-l-sa">{S(lv.sa)}</h3>
      <p className="un-score">{score} / {qs.length}</p>
      <div className="ks-chips"><button className="on" onClick={() => restart(level)}>पुनः · Play again</button><button onClick={() => restart(null)}>स्तराः · Choose a level</button></div>
    </div>
  );
  const q = qs[i];
  const answer = (o: string) => { if (chosen !== null) return; setChosen(o); if (o === q.answer) setScore(n => n + 1); };
  return (
    <div className="ks-card un-quiz">
      <div className="un-top"><span className="ks-sub ks-l-sa">{level}. {S(lv.sa)}</span><span>{i + 1} / {qs.length} · ✓ {score}</span>
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
          <FlagButton t={{ kind: "grammar", id: `taddhita-quiz:${q.id}`, field: "question", value: `${q.prompt} | ${q.ask} → ${q.answer}`, where: `तद्धितपरीक्षा ${level}` }} label="Report" />
          <button className="on" onClick={() => { setI(i + 1); setChosen(null); }}>{i + 1 < qs.length ? "अग्रे · Next" : "फलम् · Result"}</button>
        </div>
      </>}
    </div>
  );
};
