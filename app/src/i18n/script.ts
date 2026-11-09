// ═══════════════════════════════════════════════════════════════
//  i18n/script.ts — show Sanskrit in the reader's script
//  देवनागरी · IAST · తెలుగు · ಕನ್ನಡ · മലയാളം · বাংলা · ଓଡ଼ିଆ · ગુજરાતી
//  The data stays in Devanāgarī; only the display changes. Audio always uses Devanāgarī.
// ═══════════════════════════════════════════════════════════════
import { useSyncExternalStore } from "react";
import { getLang, useLang } from "../settings";

export type Script = "auto" | "deva" | "iast" | "telu" | "knda" | "mlym" | "beng" | "orya" | "gujr";
export const SCRIPTS: [Script, string][] = [
  ["auto", "स्वयम् · Auto"], ["deva", "देवनागरी"], ["iast", "IAST (ā ī ś ṣ)"], ["telu", "తెలుగు"], ["knda", "ಕನ್ನಡ"],
  ["mlym", "മലയാളം"], ["beng", "বাংলা"], ["orya", "ଓଡ଼ିଆ"], ["gujr", "ગુજરાતી"],
];
/** what "Auto" picks for each meaning language: Indian languages get their own script, others get IAST */
const AUTO: Record<string, Script> = { hi: "deva", mr: "deva", en: "deva", te: "telu", kn: "knda", ml: "mlym", bn: "beng", or: "orya", ta: "iast" };

const KEY = "samskrita-medhaa-script";
let script: Script = (() => { try { return (localStorage.getItem(KEY) as Script) || "auto"; } catch { return "auto"; } })();
const subs = new Set<() => void>();
export function setScript(s: Script) { script = s; try { localStorage.setItem(KEY, s); } catch { /* ignore */ } subs.forEach(f => f()); }
export function useScriptSetting(): Script { return useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, () => script); }
export const effectiveScript = (s: Script, lang: string): Script => s === "auto" ? (AUTO[lang] ?? "iast") : s;

// ── Devanāgarī → other Brahmic scripts: the blocks are parallel, so shift the code point ──
const OFFSET: Partial<Record<Script, number>> = { telu: 0x300, knda: 0x380, mlym: 0x400, beng: 0x80, orya: 0x200, gujr: 0x180 };
const FIX: Partial<Record<Script, Record<string, string>>> = {
  beng: { "व": "ব", "ळ": "ল়", "ऴ": "ল়" },           // Bengali has no separate va / ḷa letters
  gujr: { "ऌ": "ઌ" },
  orya: { "व": "ବ", "य": "ୟ" },            // Odia writes Sanskrit va as ବ and ya as ୟ
};
function brahmic(text: string, s: Script) {
  const off = OFFSET[s]!; const fix = FIX[s] ?? {};
  let out = "";
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (fix[ch]) out += fix[ch];
    else if (c >= 0x0901 && c <= 0x096F && c !== 0x0964 && c !== 0x0965 && c !== 0x0950) out += String.fromCodePoint(c + off);
    else out += ch;                                   // danda, spaces, Latin stay as they are
  }
  return out;
}

// ── Devanāgarī → IAST ──
const V: Record<string, string> = { "अ": "a", "आ": "ā", "इ": "i", "ई": "ī", "उ": "u", "ऊ": "ū", "ऋ": "ṛ", "ॠ": "ṝ", "ऌ": "ḷ", "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au" };
const M: Record<string, string> = { "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ", "ॢ": "ḷ", "े": "e", "ै": "ai", "ो": "o", "ौ": "au" };
const C: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ṅ", "च": "c", "छ": "ch", "ज": "j", "झ": "jh", "ञ": "ñ",
  "ट": "ṭ", "ठ": "ṭh", "ड": "ḍ", "ढ": "ḍh", "ण": "ṇ", "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m", "य": "y", "र": "r", "ल": "l", "ळ": "ḻ", "व": "v",
  "श": "ś", "ष": "ṣ", "स": "s", "ह": "h",
};
const O: Record<string, string> = { "ं": "ṃ", "ः": "ḥ", "ँ": "m̐", "ऽ": "'", "।": "|", "॥": "||", "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };
function iast(text: string) {
  let out = ""; const a = [...text];
  for (let i = 0; i < a.length; i++) {
    const ch = a[i];
    if (C[ch]) {
      let base = C[ch];
      if (a[i + 1] === "़") { i++; base = { "क": "q", "ख": "x", "ग": "ġ", "ज": "z", "फ": "f", "ड": "ṛ", "ढ": "ṛh" }[ch] ?? base; }
      const nx = a[i + 1];
      if (nx === "्") { out += base; i++; }
      else if (nx && M[nx]) { out += base + M[nx]; i++; }
      else out += base + "a";
    } else if (V[ch]) out += V[ch];
    else if (O[ch] !== undefined) out += O[ch];
    else out += ch;
  }
  return out;
}

/** show a Devanāgarī string in the chosen script */
export function sa(text: string | undefined | null, s: Script): string {
  if (!text) return "";
  if (s === "deva" || s === "auto") return text;
  if (s === "iast") return iast(text);
  return brahmic(text, s);
}
/** the hook every screen uses: const S = useSa(); S("रामः") */
export function useSa(): (t: string | undefined | null) => string {
  const s = useScriptSetting();
  useLang();
  const eff = effectiveScript(s, getLang());
  return (t) => sa(t, eff);
}
