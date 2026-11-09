// ═══════════════════════════════════════════════════════════════
//  i18n/krtForms.ts — the meaning of every kṛdanta in every language,
//  built from the real verb of that language:
//    पीत्वा → hi पीकर · te తాగి · ta குடித்து · de nachdem er getrunken hat
//           · ja 飲んで · zh 喝了之后 · ar بعد أن شرب …
//  Tables: data-source/14-krt-meanings/<lang>.tsv (tools/build_krt_lex.py).
//  Each language gives only the few verb forms its grammar needs; the nine
//  kinds of kṛdanta are put together here by that language's own rules.
//  English is hand-written in the kṛt data and is not touched here.
// ═══════════════════════════════════════════════════════════════
import LEX from "../data/krtlex.json";
import { READINGS, kanaRomaji } from "./roman";

const L = LEX as unknown as Record<string, Record<string, string[]>>;

/** the nine meaning groups of the twenty kṛt suffixes */
export const KRT_GROUP: Record<string, string> = {
  "क्त्वा": "abs", "ल्यप्": "abs", "तुमुन्": "inf", "णमुल्": "rep", "शतृ": "prp", "शानच्": "prp", "क्त": "ppp", "क्तवतु": "pap",
  "तव्यत्": "ger", "अनीयर्": "ger", "यत्": "ger", "ण्यत्": "ger", "क्यप्": "ger", "तव्य": "ger", "केलिमर्": "ger",
  "ण्वुल्": "agt", "तृच्": "agt", "णिनि": "agt", "ल्युट्": "act", "घञ्": "act", "क्तिन्": "act", "अच्": "act", "अप्": "act",
};
export const KG = ["abs", "inf", "rep", "prp", "ppp", "pap", "ger", "agt", "act"] as const;
type G = typeof KG[number];

/** short names of the nine kinds, per language (no dummy verb inside) */
export const KRT_NAME: Record<string, string[]> = {
  hi: ["पूर्वकालिक क्रिया", "प्रयोजन", "बार-बार", "वर्तमान कृदंत", "भूत कृदंत", "भूतकालिक कर्ता", "कृत्य (करने योग्य)", "कर्ता", "क्रियार्थक संज्ञा"],
  te: ["పూర్వకాలిక క్రియ", "ప్రయోజనం", "మళ్ళీ మళ్ళీ", "వర్తమాన కృదంతం", "భూత కృదంతం", "భూతకాల కర్త", "కృత్యం (చేయదగినది)", "కర్త", "క్రియా నామం"],
  ta: ["வினையெச்சம்", "நோக்கம்", "மீண்டும் மீண்டும்", "நிகழ்கால பெயரெச்சம்", "இறந்தகால பெயரெச்சம்", "செய்து முடித்தவர்", "செய்யத்தக்கது", "செய்பவர்", "தொழிற்பெயர்"],
  kn: ["ಪೂರ್ವಕಾಲಿಕ ಕ್ರಿಯೆ", "ಉದ್ದೇಶ", "ಮತ್ತೆ ಮತ್ತೆ", "ವರ್ತಮಾನ ಕೃದಂತ", "ಭೂತ ಕೃದಂತ", "ಭೂತಕಾಲದ ಕರ್ತೃ", "ಕೃತ್ಯ (ಮಾಡತಕ್ಕದ್ದು)", "ಕರ್ತೃ", "ಕ್ರಿಯಾನಾಮ"],
  ml: ["മുൻവിനയെച്ചം", "ഉദ്ദേശ്യം", "വീണ്ടും വീണ്ടും", "വർത്തമാന കൃദന്തം", "ഭൂത കൃദന്തം", "ഭൂതകാല കർത്താവ്", "കൃത്യം (ചെയ്യേണ്ടത്)", "കർത്താവ്", "ക്രിയാനാമം"],
  mr: ["पूर्वकालवाचक", "हेतू", "पुन्हा पुन्हा", "वर्तमान कृदंत", "भूत कृदंत", "भूतकालीन कर्ता", "कृत्य (करण्याजोगे)", "कर्ता", "क्रियावाचक नाम"],
  bn: ["অসমাপিকা ক্রিয়া", "উদ্দেশ্য", "বারবার", "বর্তমান কৃদন্ত", "অতীত কৃদন্ত", "অতীতের কর্তা", "করণীয়", "কর্তা", "ক্রিয়াবাচক বিশেষ্য"],
  or: ["ପୂର୍ବକାଳିକ କ୍ରିୟା", "ଉଦ୍ଦେଶ୍ୟ", "ବାରମ୍ବାର", "ବର୍ତ୍ତମାନ କୃଦନ୍ତ", "ଅତୀତ କୃଦନ୍ତ", "ଅତୀତର କର୍ତ୍ତା", "କରଣୀୟ", "କର୍ତ୍ତା", "କ୍ରିୟାବାଚକ ବିଶେଷ୍ୟ"],
  de: ["Absolutiv", "Zweck", "Wiederholung", "Partizip Präsens", "Partizip Perfekt", "Täter (Vergangenheit)", "Gerundiv", "Täter", "Verbalnomen"],
  fr: ["absolutif", "but", "répétition", "participe présent", "participe passé", "agent (passé)", "gérondif d'obligation", "agent", "nom d'action"],
  es: ["absolutivo", "finalidad", "repetición", "gerundio", "participio pasado", "agente (pasado)", "gerundivo", "agente", "nombre de acción"],
  ru: ["деепричастие", "цель", "повторение", "причастие наст. вр.", "причастие прош. вр.", "деятель (в прошлом)", "долженствование", "деятель", "отглагольное сущ."],
  ar: ["حال", "الغاية", "التكرار", "اسم الفاعل", "اسم المفعول", "الفاعل في الماضي", "الوجوب", "الفاعل", "المصدر"],
  zh: ["独立式", "目的", "反复", "现在分词", "过去分词", "过去的施事", "义务", "施事", "动名词"],
  ja: ["絶対分詞", "目的", "反復", "現在分詞", "過去分詞", "過去の行為者", "義務", "行為者", "動名詞"],
  ko: ["절대분사", "목적", "반복", "현재분사", "과거분사", "과거의 행위자", "의무", "행위자", "동명사"],
};
const NAME_READ: Record<string, string[]> = {
  ar: ["ḥāl", "al-ghāya", "at-takrār", "ism al-fāʿil", "ism al-mafʿūl", "al-fāʿil fī al-māḍī", "al-wujūb", "al-fāʿil", "al-maṣdar"],
  zh: ["dúlìshì", "mùdì", "fǎnfù", "xiànzài fēncí", "guòqù fēncí", "guòqù de shīshì", "yìwù", "shīshì", "dòngmíngcí"],
  ja: ["zettai bunshi", "mokuteki", "hanpuku", "genzai bunshi", "kako bunshi", "kako no kōisha", "gimu", "kōisha", "dōmeishi"],
};

// ── per-language builders: (columns of the table) → the nine forms (+ reading where it cannot be read by rule) ──
type Out = Partial<Record<G, string>>;
const swapEnd = (s: string, a: string, b: string) => (s.endsWith(a) ? s.slice(0, -a.length) + b : s + b);

const hi = ([st, pp, tr]: string[]): Out => {
  const abs = st === "कर" || st.endsWith(" कर") ? st + "के" : st + "कर";
  const fem = pp.endsWith("ी");
  return { abs, inf: `${st}ने के लिए`, rep: `बार-बार ${abs}`, prp: `${st}ता हुआ`,
    ppp: tr === "1" ? `${pp} ${fem ? "गई" : "गया"}` : pp.endsWith("हुआ") ? pp : `${pp} हुआ`,
    pap: tr === "1" ? `जिसने ${pp} है` : `जो ${pp} है`, ger: `${st}ने योग्य`, agt: `${st}ने वाला`, act: `${st}ना` };
};
const te = ([abs, inf, vn, prp, past, hab, tr]: string[]): Out => ({
  abs, inf: swapEnd(vn, "ం", "ానికి"), rep: `${abs} ${abs}`, prp, ppp: tr === "1" ? `${inf}బడిన` : past,
  pap: `${past}వాడు`, ger: `${inf}దగిన`, agt: `${hab}వాడు`, act: vn });
const ta = ([abs, inf, vn, prp, past, tr]: string[]): Out => ({
  abs, inf, rep: `மீண்டும் மீண்டும் ${abs}`, prp, ppp: tr === "1" ? `${inf}ப்பட்ட` : past,
  pap: `${past}வர்`, ger: `${inf} வேண்டிய`, agt: `${prp}வர்`, act: vn });
const kn = ([abs, inf, vn, prp, past, tr]: string[]): Out => ({
  abs, inf, rep: `ಮತ್ತೆ ಮತ್ತೆ ${abs}`, prp, ppp: tr === "1" ? swapEnd(inf, "ಲು", "ಲ್ಪಟ್ಟ") : past,
  pap: `${past}ವನು`, ger: swapEnd(inf, "ಲು", "ಬೇಕಾದ"), agt: swapEnd(vn, "ವುದು", "ವವನು"), act: vn });
const ml = ([abs, inf, vn, prp, past, tr]: string[]): Out => ({
  abs, inf, rep: `വീണ്ടും വീണ്ടും ${abs}`, prp, ppp: tr === "1" ? swapEnd(inf, "ാൻ", "പ്പെട്ട") : past,
  pap: `${past}വൻ`, ger: swapEnd(inf, "ാൻ", "േണ്ട"), agt: `${prp}വൻ`, act: vn });
const mr = ([abs, vn, prs, pp, tr]: string[]): Out => ({
  abs, inf: swapEnd(vn, "णे", "ण्यासाठी"), rep: `पुन्हा पुन्हा ${abs}`, prp: `${prs} असलेला`, ppp: pp,
  pap: tr === "1" ? `ज्याने ${swapEnd(pp, "लेला", "ले")} आहे` : `जो ${swapEnd(pp, "लेला", "ला")} आहे`,
  ger: swapEnd(vn, "णे", "ण्याजोगा"), agt: swapEnd(vn, "णे", "णारा"), act: vn });
const bn = ([abs, inf, vn, prog, hab, tr]: string[]): Out => ({
  abs, inf, rep: `বারবার ${abs}`, prp: `যে ${prog}`, ppp: tr === "1" ? vn : `যে ${abs}ছে`, pap: `যে ${abs}ছে`,
  ger: `${vn} উচিত`, agt: `যে ${hab}`, act: vn });
const or = ([abs, inf, vn, prp, past]: string[]): Out => ({
  abs, inf, rep: `ବାରମ୍ବାର ${abs}`, prp, ppp: past, pap: `${past} ବ୍ୟକ୍ତି`, ger: `${vn} ଉଚିତ`, agt: `${prp} ବ୍ୟକ୍ତି`, act: vn });

// German: separable prefixes, reflexives and phrases follow German word order
const DE_SEP = ["umher", "zugrunde ", "ein", "weg", "aus", "an"];
const deZu = (inf: string) => {
  const w = inf.split(" ");
  if (w.length > 1) return [...w.slice(0, -1), "zu", w[w.length - 1]].join(" ");
  const p = DE_SEP.find(x => !x.includes(" ") && inf.startsWith(x) && inf.length > x.length + 3);
  return p ? p + "zu" + inf.slice(p.length) : "zu " + inf;
};
const deSub = (v3: string) => { const w = v3.split(" "); return w.length === 2 ? `${w[1]}${w[1] === "sich" || /^(zufrieden|satt|rein|geboren|Frucht|zugrunde)$/.test(w[1]) ? " " : ""}${w[0]}` : v3; };
const de = ([inf, pp, aux, v3]: string[]): Out => {
  const refl = inf.startsWith("sich ");
  const a = aux === "s" ? "ist" : "hat";
  const pt = (refl ? "sich " : "") + pp;
  const ppr = inf === "sein" ? "seiend" : inf === "tun" ? "tuend" : inf + "d";
  const noun = "das " + inf.replace(/^sich /, "").split(" ").map((w, i) => i ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)).join("");
  return { abs: `nachdem er ${pt} ${a}`, inf: `um ${deZu(inf)}`, rep: `immer wieder ${inf}`, prp: ppr, ppp: pp,
    pap: `einer, der ${pt} ${a}`, ger: deZu(inf), agt: `einer, der ${deSub(v3)}`, act: noun };
};
const fr = ([inf, pp, ppr, v3, aux]: string[]): Out => {
  const refl = /^s(e |')/.test(inf);
  const vow = (s: string) => /^[aeiouéèêhâîôû]/i.test(s);
  return { abs: refl ? `après s'être ${pp}` : aux === "e" ? `après être ${pp}` : `après avoir ${pp}`, inf: `pour ${inf}`,
    rep: `${inf} encore et encore`, prp: ppr, ppp: pp, pap: `celui qui ${refl ? "s'est" : aux === "e" ? "est" : "a"} ${pp}`,
    ger: `à ${inf}`, agt: `celui qui ${v3}`, act: `le fait ${vow(inf) ? "d'" : "de "}${inf}` };
};
const es = ([inf, pp, ger, v3]: string[]): Out => {
  const refl = /se$/.test(inf.split(" ")[0]) && inf.split(" ")[0].length > 4;
  return { abs: `después de ${inf}`, inf: `para ${inf}`, rep: `${inf} una y otra vez`, prp: ger, ppp: pp,
    pap: `el que ${refl ? "se " : ""}ha ${pp}`, ger: `por ${inf}`, agt: `el que ${v3}`, act: `el ${inf}` };
};
const ru = ([inf, dpr, prap, ppp, past, vn]: string[]): Out => ({
  abs: dpr, inf: `чтобы ${inf}`, rep: `снова и снова ${inf}`, prp: prap, ppp, pap: `тот, кто ${past}`, ger: `нужно ${inf}`, agt: prap, act: vn });

// Arabic: forms + their readings (Arabic cannot be read by rule)
const ar = ([imp, perf, act, pass, masd]: string[], [rImp, rPerf, rAct, rPass, rMasd]: string[]): [Out, Out] => {
  const one = !masd.includes(" ");
  const ger = one ? `جدير بال${masd}` : `جدير بـ${masd}`;
  const sun = rMasd.match(/^(th|dh|sh|[tdrzsṣḍṭẓln])/);              // sun letters assimilate the l of al-
  const rGer = one ? `jadīr bi-${sun ? sun[1] : "l"}-${rMasd}` : `jadīr bi-${rMasd}`;
  const ppp = pass !== "–" ? pass : `الذي ${perf}`, rPpp = pass !== "–" ? rPass : `alladhī ${rPerf}`;
  return [
    { abs: `بعد أن ${perf}`, inf: `لكي ${imp}`, rep: `${imp} مرارًا`, prp: act, ppp, pap: `الذي ${perf}`, ger, agt: `الذي ${imp}`, act: masd },
    { abs: `baʿda an ${rPerf}`, inf: `likay ${rImp}`, rep: `${rImp} mirāran`, prp: rAct, ppp: rPpp, pap: `alladhī ${rPerf}`, ger: rGer, agt: `alladhī ${rImp}`, act: rMasd },
  ];
};
// Chinese: one verb + fixed frames
const zh = ([v, py, tr]: string[]): [Out, Out] => [
  { abs: `${v}了之后`, inf: `为了${v}`, rep: `反复地${v}`, prp: `正在${v}的`, ppp: tr === "1" ? `被${v}的` : `${v}了的`, pap: `已经${v}的人`,
    ger: tr === "1" ? `应该被${v}的` : `应该${v}的`, agt: `${v}的人`, act: `${v}这件事` },
  { abs: `${py} le zhīhòu`, inf: `wèile ${py}`, rep: `fǎnfù de ${py}`, prp: `zhèngzài ${py} de`, ppp: tr === "1" ? `bèi ${py} de` : `${py} le de`,
    pap: `yǐjīng ${py} de rén`, ger: tr === "1" ? `yīnggāi bèi ${py} de` : `yīnggāi ${py} de`, agt: `${py} de rén`, act: `${py} zhè jiàn shì` },
];
// Japanese: conjugated from the dictionary form by verb class, on the writing and on the reading together
const GODAN_TE: Record<string, [string, string]> = { "う": ["って", "った"], "つ": ["って", "った"], "る": ["って", "った"], "む": ["んで", "んだ"], "ぶ": ["んで", "んだ"],
  "ぬ": ["んで", "んだ"], "く": ["いて", "いた"], "ぐ": ["いで", "いだ"], "す": ["して", "した"] };
const GODAN_A: Record<string, string> = { "う": "わ", "く": "か", "ぐ": "が", "す": "さ", "つ": "た", "ぬ": "な", "ぶ": "ば", "む": "ま", "る": "ら" };
const jaConj = (d: string, cls: string): { te: string; ta: string; pass: string } => {
  const stem = d.slice(0, -1), end = d.slice(-1);
  if (cls === "1") return { te: stem + "て", ta: stem + "た", pass: stem + "られる" };
  if (cls === "s") { const s = d.slice(0, -2); return { te: s + "して", ta: s + "した", pass: s + "される" }; }
  if (cls === "k") return { te: "来て", ta: "来た", pass: "来られる" };
  if (d.endsWith("行く") || d.endsWith("いく")) return { te: stem + "って", ta: stem + "った", pass: stem + "かれる" };
  if (d.endsWith("乞う") || d.endsWith("こう")) return { te: d + "て", ta: d + "た", pass: stem + "われる" };
  const [te, ta] = GODAN_TE[end] ?? ["て", "た"];
  return { te: stem + te, ta: stem + ta, pass: stem + (GODAN_A[end] ?? "") + "れる" };
};
const ja = ([d, rd, cls, tr]: string[]): [Out, Out] => {
  const w = jaConj(d, cls), r = jaConj(rd, cls);
  const make = (x: { te: string; ta: string; pass: string }, dict: string, h: { many: string; tame: string; hito: string; koto: string; beki: string; iru: string }): Out => ({
    abs: x.te, inf: dict + h.tame, rep: h.many + x.te, prp: x.te + h.iru, ppp: tr === "1" ? swapEnd(x.pass, "る", "た") : x.ta,
    pap: x.ta + h.hito, ger: (tr === "1" ? x.pass : dict) + h.beki, agt: dict + h.hito, act: dict + h.koto });
  const text = make(w, d, { many: "何度も", tame: "ために", hito: "人", koto: "こと", beki: "べき", iru: "いる" });
  const read = make(r, rd, { many: "なんども ", tame: " ため に", hito: " ひと", koto: " こと", beki: " べき", iru: " いる" });
  return [text, Object.fromEntries(Object.entries(read).map(([k, v]) => [k, kanaRomaji(v as string)])) as Out];
};
// Korean: Hangul endings attached by batchim rules (read by the Korean rules in roman.ts)
const jong = (s: string) => { const c = s.charCodeAt(s.length - 1) - 0xac00; return c >= 0 && c < 11172 ? c % 28 : -1; };
const addJong = (s: string, j: number) => { const c = s.charCodeAt(s.length - 1) - 0xac00; return s.slice(0, -1) + String.fromCharCode(0xac00 + c - (c % 28) + j); };
const ko = ([d, pastAdn, tr]: string[]): Out => {
  const st = d.slice(0, -1); const j = jong(st);
  const isL = j === 8, vow = j === 0;
  const noL = isL ? addJong(st, 0) : st;                           // ㄹ drops before ㄴ-endings: 놀다 → 노는
  const past = pastAdn || (vow ? addJong(st, 4) : isL ? addJong(st, 4) : st + "은");
  const fut = pastAdn ? swapEnd(pastAdn, "은", "을") : vow ? addJong(st, 8) : isL ? st : st + "을";
  void tr;
  return { abs: `${st}고 나서`, inf: `${st}기 위해`, rep: `거듭 ${st}고`, prp: `${noL}는`, ppp: past, pap: `${past} 사람`,
    ger: `${fut} 만한`, agt: `${noL}는 사람`, act: `${st}기` };
};

const BUILD: Record<string, (c: string[]) => Out> = { hi, te, ta, kn, ml, mr, bn, or, de, fr, es, ru, ko };

/** "form · kind" for a kṛdanta of `root` with `pratyaya`, in `lang`; null when this language/root has no table */
export function krtLocal(root: string, pratyaya: string, lang: string): string | null {
  const g = KRT_GROUP[pratyaya] as G | undefined; if (!g) return null;
  const row = L[lang]?.[root]; if (!row) return null;
  const name = KRT_NAME[lang]?.[KG.indexOf(g)] ?? "";
  let form: string | undefined, read: string | undefined;
  if (lang === "ar") { const [o, r] = ar(row, L.ar_roman?.[root] ?? []); form = o[g]; read = r[g]; }
  else if (lang === "zh") { const [o, r] = zh(row); form = o[g]; read = r[g]; }
  else if (lang === "ja") { const [o, r] = ja(row); form = o[g]; read = r[g]; }
  else form = BUILD[lang]?.(row)[g];
  if (!form) return null;
  const text = `${form} · ${name}`;
  if (read) READINGS.set(lang + "\u0000" + text, `${read} · ${NAME_READ[lang]?.[KG.indexOf(g)] ?? ""}`);
  return text;
}
