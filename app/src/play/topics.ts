// ═══════════════════════════════════════════════════════════════
//  play/topics.ts — the क्रीडाङ्गणम् path: the 37 stations of the old यात्रा, grouped into
//  19 topics in the same three levels (बालः → अध्येता → निपुणः).
//  Every topic keeps its stations as "challenges" (the original quiz / memory / build game with
//  lives, hints and timer), and also feeds the same questions to the new games in kit.tsx.
//  Questions are still made fresh on each play by the generators in game/stations.ts.
// ═══════════════════════════════════════════════════════════════
import { STATIONS, type Region, type Station, type QuizItem, type MemoryPair, type BuildItem } from "../game/stations";
import { isDeva } from "../data";
import type { Pair } from "./kit";

export type Topic = { id: string; level: Region; sa: string; en: string; icon: string; blurb: string; stations: string[]; boss?: boolean };

export const TOPICS: Topic[] = [
  // ── बालः ──
  { id: "t-shabda", level: "BAALA", sa: "शब्दाः", en: "Words & meanings", icon: "🌸", stations: ["b1", "b2"], blurb: "First nouns and what they mean." },
  { id: "t-rupa", level: "BAALA", sa: "शब्दरूपाणि", en: "Noun forms", icon: "🧩", stations: ["b3", "b4", "b5"], blurb: "रामः, रामौ, रामाः; रामेण, रामाय… one, two, many and the cases." },
  { id: "t-dhatu", level: "BAALA", sa: "धातवः लट् च", en: "Roots & the present", icon: "🌱", stations: ["b6", "b7"], blurb: "What the roots mean, and भवति, भवतः, भवन्ति." },
  { id: "t-avyaya", level: "BAALA", sa: "अव्ययानि", en: "Little words", icon: "🔗", stations: ["b8"], blurb: "कुत्र, कदा, अत्र… words that never change." },
  { id: "t-vakya", level: "BAALA", sa: "वाक्यरचना", en: "Build sentences", icon: "💬", stations: ["b9"], blurb: "Put the words in order to make a sentence." },
  { id: "t-bala-boss", level: "BAALA", sa: "बाल-परीक्षा", en: "Bāla challenge", icon: "👑", stations: ["b10"], boss: true, blurb: "A bit of everything from बालः, against the clock." },
  // ── अध्येता ──
  { id: "t-kala", level: "ADHYETA", sa: "कालाः", en: "Past, command, future", icon: "🕰️", stations: ["a1"], blurb: "अभवत्, भवतु, भविष्यति." },
  { id: "t-vibhakti", level: "ADHYETA", sa: "सर्वविभक्तयः", en: "All eight cases", icon: "🎯", stations: ["a2"], blurb: "Every case of every kind of noun, with सम्बोधनम्." },
  { id: "t-sarvanama", level: "ADHYETA", sa: "सर्वनामानि", en: "Pronouns & numbers", icon: "🔢", stations: ["a3"], blurb: "सः, सा, तत्, अहम्, त्वम्, एकः, द्वौ…" },
  { id: "t-krt", level: "ADHYETA", sa: "कृदन्तानि प्रत्ययाः च", en: "Participles & suffixes", icon: "🌾", stations: ["a4", "a11"], blurb: "गत्वा, गन्तुम्, गतः, and what each kind of suffix does." },
  { id: "t-vakya2", level: "ADHYETA", sa: "वाक्यानि", en: "Sentences", icon: "🧱", stations: ["a5", "a6", "a6b"], blurb: "Fill the little word, longer sentences, spot the mistake." },
  { id: "t-sandhi1", level: "ADHYETA", sa: "सन्धिः समासः च", en: "Sandhi & compounds", icon: "🪢", stations: ["a8", "a9", "a10"], blurb: "Vowel sandhi, the four kinds of compound, and vigrahas." },
  { id: "t-adhyeta-boss", level: "ADHYETA", sa: "अध्येतृ-परीक्षा", en: "Adhyetā challenge", icon: "👑", stations: ["a7"], boss: true, blurb: "Cases, pronouns, tenses and participles, against the clock." },
  // ── निपुणः ──
  { id: "t-lakara", level: "NIPUNA", sa: "लकाराः प्रयोगाः च", en: "All lakāras & the passive", icon: "🌀", stations: ["n1", "n2"], blurb: "लिट्, लुङ्, आशीर्लिङ्, लृङ्; कर्मणि and भावे." },
  { id: "t-krt2", level: "NIPUNA", sa: "कृत्प्रत्ययाः", en: "Every kṛdanta", icon: "🧬", stations: ["n3", "n8"], blurb: "All twenty kṛt suffixes, and which suffix made the word." },
  { id: "t-shloka", level: "NIPUNA", sa: "श्लोकाः", en: "Ślokas", icon: "📜", stations: ["n3b", "n3c", "n3d"], blurb: "Split a śloka, put it in prose order, name the kārakas." },
  { id: "t-sandhi2", level: "NIPUNA", sa: "सन्धयः समासाः च", en: "Every sandhi & tatpuruṣa", icon: "⛓️", stations: ["n5", "n6", "n7"], blurb: "All sandhis, splitting them, and the kinds of tatpuruṣa." },
  { id: "t-prakriya", level: "NIPUNA", sa: "प्रक्रिया", en: "Build a word step by step", icon: "🪜", stations: ["n9"], blurb: "Put the steps of a derivation in Pāṇini's order." },
  { id: "t-nipuna-boss", level: "NIPUNA", sa: "निपुण-परीक्षा", en: "Nipuṇa challenge", icon: "👑", stations: ["n4"], boss: true, blurb: "Any form of any word or root. Two lives, no hints." },
];

export const stationsOf = (t: Topic): Station[] => t.stations.map(id => STATIONS.find(s => s.id === id)!).filter(Boolean);

// ── the same questions as pairs for the new games ──
const quizPair = (it: QuizItem): Pair => {
  // some questions have no prompt and put their text in the sentence (fill the blank, spot the mistake)
  const q = it.prompt || it.sentence || "";
  return { q, a: it.answer, opts: it.options, qSa: isDeva(q), aSa: it.optDeva, say: it.speak,
    sub: [it.prompt ? it.sentence ?? "" : "", it.prompt ? "" : it.clue ?? "", it.tags.join(" · "), it.ask].filter(Boolean) };
};
const memoryPair = (m: MemoryPair): Pair => ({ q: m.a, a: m.b, qSa: isDeva(m.a), aSa: m.bSa ?? isDeva(m.b) });
const buildPair = (b: BuildItem): Pair => {
  const q = b.show ?? b.clue;
  return { q, a: b.toks.join(" "), tiles: b.toks, qSa: isDeva(q), aSa: true, say: b.speak, sub: [b.show ? b.clue : "", b.ask].filter(Boolean) };
};

/** a fresh set of pairs from all the stations of a topic (boss topics are played only as challenges) */
export function topicPairs(t: Topic, lang: string, want = 16): Pair[] {
  const out: Pair[] = []; const seen = new Set<string>();
  const add = (p: Pair) => { const k = `${p.q}→${p.a}`; if (!seen.has(k) && p.q && p.a) { seen.add(k); out.push(p); } };
  for (let tries = 0; tries < 4 && out.length < want; tries++) {
    for (const s of stationsOf(t)) {
      try {
        if (s.kind === "quiz") s.items(lang).filter(Boolean).forEach(it => add(quizPair(it)));
        else if (s.kind === "memory") s.pairs(lang).forEach(m => add(memoryPair(m)));
        else s.items(lang).filter(Boolean).forEach(b => add(buildPair(b)));
      } catch { /* a generator that cannot make items today: skip it */ }
    }
  }
  return out;
}

// ── progress: best stars per topic, in this browser ──
const KEY = "medhaa.play.v1";
const OLD_KEY = "samskrita-medhaa-yatra-v1";        // the old यात्रा: its stars carry over
/** stars: best per topic; ch: best per challenge (station id); openAll: every topic open */
export type PlayProgress = { stars: Record<string, number>; ch: Record<string, number>; openAll: boolean };
export function loadPlayProgress(): PlayProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { stars: {}, ch: {}, openAll: false, ...JSON.parse(raw) };
    const old = JSON.parse(localStorage.getItem(OLD_KEY) || "null") as { stars?: Record<string, number>; openAll?: boolean } | null;
    if (old?.stars) {
      const stars: Record<string, number> = {};
      for (const t of TOPICS) { const best = Math.max(0, ...t.stations.map(id => old.stars![id] ?? 0)); if (best) stars[t.id] = best; }
      return { stars, ch: { ...old.stars }, openAll: !!old.openAll };
    }
  } catch { /* storage unavailable */ }
  return { stars: {}, ch: {}, openAll: false };
}
export function savePlayProgress(p: PlayProgress) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ } }
export const topicOpen = (p: PlayProgress, i: number) => p.openAll || i === 0 || (p.stars[TOPICS[i - 1].id] ?? 0) > 0;
