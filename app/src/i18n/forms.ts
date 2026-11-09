// ═══════════════════════════════════════════════════════════════
//  i18n/forms.ts — the meaning of EVERY FORM in the chosen language.
//
//  Word meanings come from the data (dictionaries / wordnets / drafts).
//  The meaning of each FORM is built here from small per-language patterns:
//    • nouns   — the word's meaning + that language's case marker
//                (Telugu: రాముని చేత, Hindi: राम से, Japanese: ラーマで …)
//    • verbs   — pronoun · verb meaning · tense / voice, in that language
//    • kṛdantas — verb meaning · what the suffix does, in that language
//  A native speaker reviews each language's patterns ONCE; every word then follows.
//  Everything built here is labelled "pattern" in the app.
// ═══════════════════════════════════════════════════════════════
import { krtLocal, KRT_GROUP, KRT_NAME, KG } from "./krtForms";
import { firstSense, type Word, type Verb } from "../data";
import { naturalVerb } from "./verbsNatural";
import { pronounOther } from "./pronouns";

type Case8 = [string, string, string, string, string, string, string, string]; // prathamā … sambodhana
const X = "{X}";
const fill = (t: string, x: string) => t.split(X).join(x);

// ── noun case patterns: {X} = the word's meaning in that language ──
const CASES: Record<string, Case8> = {
  hi: [X, `${X} को`, `${X} से / ${X} के द्वारा`, `${X} के लिए / ${X} को`, `${X} से (अलग होकर)`, `${X} का / के / की`, `${X} में / ${X} पर`, `हे ${X}!`],
  ta: [X, `${X}-ஐ`, `${X}-ஆல் / ${X}-உடன்`, `${X}-க்கு`, `${X}-இலிருந்து`, `${X}-இன் / ${X}-உடைய`, `${X}-இல்`, `ஓ ${X}!`],
  kn: [X, `${X}-ಅನ್ನು`, `${X}-ಇಂದ / ${X}-ಒಡನೆ`, `${X}-ಗೆ / ${X}-ಕ್ಕೆ`, `${X}-ಇಂದ (ದೂರ)`, `${X}-ಅ / ${X}-ದ`, `${X}-ಅಲ್ಲಿ / ${X}-ಮೇಲೆ`, `ಓ ${X}!`],
  ml: [X, `${X}-ഏ`, `${X}-ആൽ / ${X}-ഓട്`, `${X}-ക്ക് / ${X}-ന്`, `${X}-ഇൽ നിന്ന്`, `${X}-ഉടെ / ${X}-ന്റെ`, `${X}-ഇൽ`, `ഹേ ${X}!`],
  mr: [X, `${X}-ला / ${X}-ते`, `${X}-ने / ${X}-मुळे`, `${X}-ला / ${X}-साठी`, `${X}-हून / ${X}-पासून`, `${X}-चा / -ची / -चे`, `${X}-त / ${X}-वर`, `हे ${X}!`],
  bn: [X, `${X}-কে`, `${X}-দ্বারা / ${X}-দিয়ে`, `${X}-এর জন্য / ${X}-কে`, `${X}-থেকে`, `${X}-এর`, `${X}-এ / ${X}-তে`, `হে ${X}!`],
  or: [X, `${X}-କୁ`, `${X}-ଦ୍ୱାରା`, `${X}-ପାଇଁ / ${X}-କୁ`, `${X}-ଠାରୁ`, `${X}-ର`, `${X}-ରେ`, `ହେ ${X}!`],
  de: [X, `${X} (Objekt: wen? was?)`, `durch / mit ${X}`, `für / an ${X}`, `von / aus ${X}`, `von ${X} (wessen?)`, `in / an / auf ${X}`, `o ${X}!`],
  fr: [X, `${X} (objet direct)`, `par / avec ${X}`, `à / pour ${X}`, `de / depuis ${X}`, `de ${X}`, `dans / sur ${X}`, `ô ${X} !`],
  es: [X, `${X} (objeto directo)`, `por / con ${X}`, `a / para ${X}`, `de / desde ${X}`, `de ${X}`, `en / sobre ${X}`, `¡oh, ${X}!`],
  ru: [X, `${X} (вин. п.: кого? что?)`, `${X} (твор. п.: кем? чем?)`, `${X} (дат. п.: кому? чему?)`, `${X} (род. п. с «от / из»)`, `${X} (род. п.: кого? чего?)`, `${X} (предл. п. с «в / на»)`, `о, ${X}!`],
  ar: [X, `${X} (مفعول به)`, `بواسطة ${X} / مع ${X}`, `إلى ${X} / لأجل ${X}`, `من ${X}`, `${X} (مضاف إليه)`, `في ${X} / على ${X}`, `يا ${X}!`],
  zh: [X, `（把）${X}`, `用 ${X} / 被 ${X}`, `给 ${X} / 为了 ${X}`, `从 ${X}`, `${X} 的`, `在 ${X}（里 / 上）`, `啊，${X}！`],
  ja: [`${X}が`, `${X}を`, `${X}で / ${X}によって`, `${X}に / ${X}のために`, `${X}から`, `${X}の`, `${X}に / ${X}で`, `おお、${X}よ！`],
};

/** a case pattern applied to a pronoun's oblique form (used by pronouns.ts) */
export const CASES_FOR_PRONOUNS = (lang: string, v: number, x: string) => CASES[lang] ? fill(CASES[lang][v], x) : x;

// Hindi: masculine nouns in -ā take the oblique -e before a postposition (लड़का → लड़के से)
const HI_NO_OBLIQUE = new Set(["राजा", "पिता", "चाचा", "दादा", "नाना", "देवता", "योद्धा", "दाता", "नेता", "आत्मा", "मामा", "काका", "युवा", "विधाता", "कर्ता", "भ्राता", "सखा"]);
function hindi(x: string, g: string, v: number) {
  if (v === 0) return x;
  const obl = g === "m" && x.endsWith("ा") && !x.includes(" ") && !HI_NO_OBLIQUE.has(x) ? x.slice(0, -1) + "े" : x;
  return fill(CASES.hi[v], obl);
}

// Telugu: -డు nouns take the oblique -ని (రాముడు → రాముని చేత); -ం nouns take -ా- (పుస్తకం → పుస్తకాన్ని)
function telugu(x: string, v: number) {
  if (v === 0) return x;
  // only masculine -ుడు / -ాడు … (రాముడు, బాలుడు), not పండు, రెండు
  const du = /[\u0C3E-\u0C4C]డు$/.test(x), am = x.endsWith("ం") && x.length > 1;
  const obl = du ? x.slice(0, -2) + "ని" : x;
  const stemA = x.slice(0, -1);
  switch (v) {
    case 1: return du ? obl : am ? stemA + "ాన్ని" : x + "ను";
    case 2: return am ? `${x}తో / ${x} చేత` : `${obl} చేత / ${obl}తో`;
    case 3: return am ? `${stemA}ానికి / ${x} కొరకు` : `${obl} కొరకు / ${obl}కి`;
    case 4: return `${obl} నుండి / ${obl} వలన`;
    case 5: return `${obl} యొక్క`;
    case 6: return am ? `${x}లో` : `${obl}లో / ${obl}యందు`;
    default: return du ? `ఓ ${x.slice(0, -1)}ా!` : `ఓ ${x}!`;
  }
}

// Korean particles depend on whether the last syllable ends in a consonant (받침)
export function korean(x: string, v: number) {
  const c = x.charCodeAt(x.length - 1) - 0xac00;
  const has = c >= 0 && c < 11172 && c % 28 !== 0, rieul = c >= 0 && c % 28 === 8;
  const p = (a: string, b: string) => x + (has ? a : b);
  return [
    p("이", "가"), p("을", "를"), `${x}${has && !rieul ? "으로" : "로"} / ${p("과", "와")} 함께`, `${x}에게 / ${x}에 / ${p("을", "를")} 위해`,
    `${x}에게서 / ${x}에서`, `${x}의`, `${x}에 / ${x}에서`, p("아!", "야!"),
  ][v];
}

// ── English: proper phrases with plurals ──
const EN_IRREG: Record<string, string> = { man: "men", woman: "women", child: "children", person: "people", foot: "feet", tooth: "teeth", mouse: "mice", ox: "oxen", goose: "geese", wife: "wives", knife: "knives", leaf: "leaves", life: "lives", wolf: "wolves", sheep: "sheep", deer: "deer", fish: "fish", cow: "cows", water: "waters", milk: "milk", honey: "honey", curd: "curd", knowledge: "knowledge" };
function enPlural(x: string) {
  const parts = x.split(" "); const last = parts.pop()!; const low = last.toLowerCase();
  let pl = EN_IRREG[low] ?? (/(s|x|z|ch|sh)$/.test(low) ? last + "es" : /[^aeiou]y$/.test(low) ? last.slice(0, -1) + "ies" : last + "s");
  if (last[0] === last[0]?.toUpperCase() && EN_IRREG[low]) pl = pl[0].toUpperCase() + pl.slice(1);
  return [...parts, pl].join(" ");
}
const EN_CASES: Case8 = [X, `${X} (as object)`, `by / with ${X}`, `to / for ${X}`, `from ${X}`, `of ${X}`, `in / on ${X}`, `O ${X}!`];
/** names keep their capital and take no "the" */
const EN_PROPER = new Set(["राम", "हरि", "गङ्गा", "लक्ष्मी", "गौरी", "रमा"]);
function english(w: Word, x: string, v: number, n: number, countable: boolean) {
  const proper = EN_PROPER.has(w.w);
  const lc = proper || /^[A-Z]{2}/.test(x) ? x : x.charAt(0).toLowerCase() + x.slice(1);
  if (!countable) return fill(EN_CASES[v], lc);
  const noun = n === 0 ? lc : n === 1 ? `both ${enPlural(lc)}` : `all ${enPlural(lc)}`;
  const the = proper || v === 7 || n > 0 ? "" : "the ";
  if (v === 7) return `O ${n === 0 ? lc : enPlural(lc)}!`;
  return fill(EN_CASES[v], v === 0 ? noun : the + noun);
}

// ── pronouns: real case forms in English, Hindi, Telugu ──
type PronForms = { en: [string, string, string]; hi: [string, string, string]; te: [string, string, string] };
// [subject, object/oblique, possessive] for singular and plural
const PRON: Record<string, [PronForms, PronForms]> = {
  "SH-000142": [{ en: ["I", "me", "my"], hi: ["मैं", "मुझ", "मेरा"], te: ["నేను", "నా", "నన్ను"] }, { en: ["we", "us", "our"], hi: ["हम", "हम", "हमारा"], te: ["మేము", "మా", "మమ్మల్ని"] }],
  "SH-000143": [{ en: ["you", "you", "your"], hi: ["तू", "तुझ", "तेरा"], te: ["నీవు", "నీ", "నిన్ను"] }, { en: ["you", "you", "your"], hi: ["तुम", "तुम", "तुम्हारा"], te: ["మీరు", "మీ", "మిమ్మల్ని"] }],
  "SH-000134": [{ en: ["he", "him", "his"], hi: ["वह", "उस", "उसका"], te: ["అతడు", "అతని", "అతనిని"] }, { en: ["they", "them", "their"], hi: ["वे", "उन", "उनका"], te: ["వారు", "వారి", "వారిని"] }],
  "SH-000135": [{ en: ["she", "her", "her"], hi: ["वह", "उस", "उसका"], te: ["ఆమె", "ఆమె", "ఆమెను"] }, { en: ["they", "them", "their"], hi: ["वे", "उन", "उनका"], te: ["వారు", "వారి", "వారిని"] }],
  "SH-000136": [{ en: ["it", "it", "its"], hi: ["वह", "उस", "उसका"], te: ["అది", "దాని", "దానిని"] }, { en: ["they", "them", "their"], hi: ["वे", "उन", "उनका"], te: ["అవి", "వాటి", "వాటిని"] }],
  "SH-000137": [{ en: ["this one", "this one", "this one's"], hi: ["यह", "इस", "इसका"], te: ["ఇతడు", "ఇతని", "ఇతనిని"] }, { en: ["these", "these", "of these"], hi: ["ये", "इन", "इनका"], te: ["వీరు", "వీరి", "వీరిని"] }],
  "SH-000144": [{ en: ["this one", "this one", "this one's"], hi: ["यह", "इस", "इसका"], te: ["ఇతడు", "ఇతని", "ఇతనిని"] }, { en: ["these", "these", "of these"], hi: ["ये", "इन", "इनका"], te: ["వీరు", "వీరి", "వీరిని"] }],
  "SH-000145": [{ en: ["that one", "that one", "that one's"], hi: ["वह", "उस", "उसका"], te: ["అతడు", "అతని", "అతనిని"] }, { en: ["those", "those", "of those"], hi: ["वे", "उन", "उनका"], te: ["వారు", "వారి", "వారిని"] }],
  "SH-000138": [{ en: ["who (which)", "whom", "whose"], hi: ["जो", "जिस", "जिसका"], te: ["ఎవడైతే", "ఎవని", "ఎవనినైతే"] }, { en: ["who (which)", "whom", "whose"], hi: ["जो", "जिन", "जिनका"], te: ["ఎవరైతే", "ఎవరి", "ఎవరినైతే"] }],
  "SH-000139": [{ en: ["who?", "whom?", "whose?"], hi: ["कौन", "किस", "किसका"], te: ["ఎవడు", "ఎవని", "ఎవనిని"] }, { en: ["who?", "whom?", "whose?"], hi: ["कौन", "किन", "किनका"], te: ["ఎవరు", "ఎవరి", "ఎవరిని"] }],
  "SH-000140": [{ en: ["who?", "whom?", "whose?"], hi: ["कौन", "किस", "किसका"], te: ["ఎవతె", "ఎవతె", "ఎవతెను"] }, { en: ["who?", "whom?", "whose?"], hi: ["कौन", "किन", "किनका"], te: ["ఎవరు", "ఎవరి", "ఎవరిని"] }],
  "SH-000141": [{ en: ["what?", "what?", "of what?"], hi: ["क्या", "किस", "किसका"], te: ["ఏది", "దేని", "దేనిని"] }, { en: ["what?", "what?", "of what?"], hi: ["क्या", "किन", "किनका"], te: ["ఏవి", "వేటి", "వేటిని"] }],
};
function pronoun(p: PronForms, lang: "en" | "hi" | "te", v: number, two: boolean): string {
  const [s, o, g] = p[lang];
  const ask = s.endsWith("?");
  if (lang === "en") {
    const b = two && !ask ? " both" : "";
    return [s + b, o + b, `by / with ${o}${b}`, `to / for ${o}${b}`, `from ${o}${b}`, two && !ask ? `of ${o} both` : g, `in / on ${o}${b}`, s + b][v];
  }
  if (lang === "hi") {
    if (two) return [`${s} दोनों`, `${o} दोनों को`, `${o} दोनों से`, `${o} दोनों के लिए`, `${o} दोनों से`, `${o} दोनों का / की`, `${o} दोनों में`, `${s} दोनों`][v];
    const gObl = g.endsWith("ा") ? g.slice(0, -1) + "े" : g;
    return [s, `${o}को`, `${o}से`, `${gObl} लिए`, `${o}से`, `${g} / ${g.slice(0, -1)}ी`, `${o}में`, s][v];
  }
  if (two) {
    const thing = s === "అవి" || s === "ఏవి";
    const [all, of] = thing ? ["రెండూ", `${o} రెండింటి`] : ["ఇద్దరూ", `${o} ఇద్దరి`];
    return [`${s} ${all}`, `${of}నీ`, `${of} చేత / ${of}తో`, `${of} కొరకు`, `${of} నుండి`, `${of} యొక్క`, `${of}లో`, `${s} ${all}`][v];
  }
  return [s, g, `${o} చేత / ${o}తో`, `${o} కొరకు`, `${o} నుండి`, `${o} యొక్క`, `${o}లో`, s][v];
}

// ── what each case does, in each language (used where a pattern cannot be built) ──
const ROLE: Record<string, Case8> = {
  en: ["subject", "object", "by / with", "to / for", "from", "of", "in / on", "address"],
  hi: ["कर्ता", "कर्म (को)", "करण (से)", "सम्प्रदान (के लिए)", "अपादान (से)", "सम्बन्ध (का)", "अधिकरण (में)", "सम्बोधन"],
  te: ["కర్త", "కర్మ (ని / ను)", "కరణం (చేత / తో)", "సంప్రదానం (కొరకు)", "అపాదానం (నుండి)", "సంబంధం (యొక్క)", "అధికరణం (లో)", "సంబోధన"],
  ta: ["எழுவாய்", "செயப்படுபொருள் (ஐ)", "கருவி (ஆல்)", "கொடை (கு)", "நீக்கம் (இலிருந்து)", "உடைமை (இன்)", "இடம் (இல்)", "விளி"],
  kn: ["ಕರ್ತೃ", "ಕರ್ಮ (ಅನ್ನು)", "ಕರಣ (ಇಂದ)", "ಸಂಪ್ರದಾನ (ಗೆ)", "ಅಪಾದಾನ (ಇಂದ)", "ಸಂಬಂಧ (ಅ)", "ಅಧಿಕರಣ (ಅಲ್ಲಿ)", "ಸಂಬೋಧನೆ"],
  ml: ["കർത്താവ്", "കർമ്മം (എ)", "കരണം (ആൽ)", "സമ്പ്രദാനം (ക്ക്)", "അപാദാനം (ഇൽ നിന്ന്)", "സംബന്ധം (ഉടെ)", "അധികരണം (ഇൽ)", "സംബോധന"],
  mr: ["कर्ता", "कर्म (ला)", "करण (ने)", "सम्प्रदान (साठी)", "अपादान (हून)", "सम्बन्ध (चा)", "अधिकरण (त)", "सम्बोधन"],
  bn: ["কর্তা", "কর্ম (কে)", "করণ (দ্বারা)", "সম্প্রদান (জন্য)", "অপাদান (থেকে)", "সম্বন্ধ (এর)", "অধিকরণ (এ)", "সম্বোধন"],
  or: ["କର୍ତ୍ତା", "କର୍ମ (କୁ)", "କରଣ (ଦ୍ୱାରା)", "ସମ୍ପ୍ରଦାନ (ପାଇଁ)", "ଅପାଦାନ (ଠାରୁ)", "ସମ୍ବନ୍ଧ (ର)", "ଅଧିକରଣ (ରେ)", "ସମ୍ବୋଧନ"],
  de: ["Subjekt", "Objekt", "Mittel (womit?)", "Empfänger (für wen?)", "Herkunft (woher?)", "Besitz (wessen?)", "Ort (wo?)", "Anrede"],
  fr: ["sujet", "objet", "moyen (avec quoi ?)", "destinataire (pour qui ?)", "origine (d'où ?)", "possession (de qui ?)", "lieu (où ?)", "apostrophe"],
  es: ["sujeto", "objeto", "medio (¿con qué?)", "destinatario (¿para quién?)", "origen (¿de dónde?)", "posesión (¿de quién?)", "lugar (¿dónde?)", "vocativo"],
  ru: ["именительный", "винительный", "творительный", "дательный", "отложительный (от / из)", "родительный", "предложный (где?)", "звательный"],
  ar: ["الفاعل", "المفعول به", "الأداة (بـ)", "المستفيد (لـ)", "المصدر (من)", "الإضافة", "الظرف (في)", "النداء"],
  zh: ["主语", "宾语", "工具（用）", "对象（给）", "来源（从）", "所属（的）", "处所（在）", "呼格"],
  ja: ["主語（が）", "目的語（を）", "手段（で）", "相手（に）", "起点（から）", "所有（の）", "場所（に・で）", "呼びかけ"],
  ko: ["주어(이/가)", "목적어(을/를)", "도구(로)", "대상(에게)", "출발점(에서)", "소유(의)", "장소(에)", "부름"],
};
export const caseRole = (lang: string, v: number) => (ROLE[lang] ?? ROLE.en)[v];

// ═══════════ dual and plural: real number words ═══════════
/** words for people (and gods): Telugu ఇద్దరు / ముగ్గురు, Kannada ಇಬ್ಬರು, Japanese 二人 … ; everything else takes the "thing" words */
const PEOPLE = new Set(("राम देव बालक नृप छात्र पुरुष हरि कवि मुनि ऋषि पति भूपति सखि गुरु शिशु दातृ पितृ भ्रातृ रमा बाला गौरी वधू मातृ धातृ जन पुत्र रिपु प्रजा " +
  "कन्या नारी लक्ष्मी मित्र राजन् विद्वस् सुहृद् श्रीमत् धीमत् भगवत् गच्छत् दण्डिन् स्वामिन् गुणिन् ज्ञानिन् योगिन् तपस्विन् तेजस्विन् मनस्विन् सुवाच् " +
  "सर्वजित् धर्मवित् सत्यवाद् विश्वपा प्रधी ग्रामणी खलपू सुधी निर्जर पूषन् वृत्रहन् स्वसृ नृ कमला विद्याधर गन्धर्व किन्नर असुर राक्षस सिद्ध सारथि " +
  "योद्धा रक्षक पालक नायक लेखक पाठक गायक नर्तक सेवक आचार्य पण्डित वैज्ञानिक चिकित्सक शिल्पिन् कृषक वणिक् " +
  "भिषज् ऋत्विज् सम्राज् भूभृत् योषित् गोदुह् युवन् मघवन् ब्रह्मन् मन्त्रिन् धनिन् अप्सरस् वेधस् पुंस् बलवत् बुद्धिमत्").split(" "));
export const isPerson = (w: Word) => PEOPLE.has(w.w);

// [dual, plural] number words; person / thing where the language distinguishes them
const NUMW: Record<string, { p: [string, string]; t: [string, string] }> = {
  hi: { p: ["दोनों", "सभी"], t: ["दोनों", "सभी"] },
  te: { p: ["ఇద్దరు", "ముగ్గురు"], t: ["రెండు", "మూడు"] },
  ta: { p: ["இரு", "பல"], t: ["இரண்டு", "பல"] },
  kn: { p: ["ಇಬ್ಬರು", "ಹಲವರು"], t: ["ಎರಡು", "ಹಲವು"] },
  ml: { p: ["രണ്ടു", "പല"], t: ["രണ്ട്", "പല"] },
  mr: { p: ["दोन्ही", "सर्व"], t: ["दोन्ही", "सर्व"] },
  bn: { p: ["দুজন", "সব"], t: ["দুটি", "সব"] },
  or: { p: ["ଦୁଇଜଣ", "ସମସ୍ତ"], t: ["ଦୁଇଟି", "ସମସ୍ତ"] },
  ja: { p: ["二人の", "多くの"], t: ["二つの", "多くの"] },
  zh: { p: ["两位", "许多"], t: ["两个", "许多"] },
  ko: { p: ["두", "여러"], t: ["두", "여러"] },
  fr: { p: ["deux", "plusieurs"], t: ["deux", "plusieurs"] },
  es: { p: ["dos", "varios"], t: ["dos", "varios"] },
  de: { p: ["(zwei)", "(mehrere)"], t: ["(zwei)", "(mehrere)"] },
  ru: { p: ["(двое)", "(многие)"], t: ["(два)", "(много)"] },
  ar: { p: ["(اثنان)", "(عدة)"], t: ["(اثنان)", "(عدة)"] },
};
const numWord = (lang: string, person: boolean, n: number) => { const e = NUMW[lang]; return e ? (person ? e.p : e.t)[n - 1] : ""; };

// Hindi plurals: direct (सभी लताएँ) and oblique before postpositions (सभी रामों को)
function hiPlural(x: string, g: string, oblique: boolean) {
  const parts = x.split(" "); const w = parts.pop()!; const pre = parts.length ? parts.join(" ") + " " : "";
  const fem = g === "f"; const last = w.slice(-1);
  let out: string;
  if (oblique) {
    if (last === "ी" || last === "ि") out = w.slice(0, -1) + "ियों";
    else if (last === "ु" || last === "ू") out = w.slice(0, -1) + "ुओं";
    else if (last === "ा") out = fem || HI_NO_OBLIQUE.has(w) ? w + "ओं" : w.slice(0, -1) + "ों";
    else if (last === "े" || last === "ो") out = w + "ओं";
    else out = w + "ों";
  } else if (fem) {
    if (last === "ी" || last === "ि") out = w.slice(0, -1) + "ियाँ";
    else if (last === "ू" || last === "ु") out = w.slice(0, -1) + "ुएँ";
    else if (last === "ा") out = w + "एँ";
    else out = w + "ें";
  } else out = last === "ा" && !HI_NO_OBLIQUE.has(w) ? w.slice(0, -1) + "े" : w;
  return pre + out;
}
function hindiNum(x: string, g: string, v: number, n: number, person: boolean) {
  const nw = numWord("hi", person, n);
  if (v === 0) return `${nw} ${hiPlural(x, g, false)}`;
  const obl = hiPlural(x, g, true);
  if (v === 7) return `हे ${obl.replace(/ों$/, "ो").replace(/ओं$/, "ओ")}!`;
  return fill(CASES.hi[v], `${nw} ${obl}`).replace(new RegExp(` / ${nw} `, "g"), " / ");
}

// Telugu plurals: రాముడు → రాములు, పుస్తకం → పుస్తకాలు, నది → నదులు, తీగ → తీగలు
const TE_PL_IRREG: Record<string, string> = { "పండు": "పండ్లు", "చెట్టు": "చెట్లు", "కన్ను": "కళ్ళు", "నీరు": "నీళ్ళు", "ఇల్లు": "ఇళ్ళు", "రోజు": "రోజులు", "కాలు": "కాళ్ళు", "పువ్వు": "పువ్వులు", "మాట": "మాటలు" };
function tePlural(x: string) {
  const parts = x.split(" "); const w = parts.pop()!; const pre = parts.length ? parts.join(" ") + " " : "";
  let out: string;
  if (TE_PL_IRREG[w]) out = TE_PL_IRREG[w];
  else if (/లు$|ళ్ళు$/.test(w)) out = w;
  else if (/[ా-ౌ]డు$/.test(w)) out = w.slice(0, -2) + "లు";
  else if (w.endsWith("ం")) out = w.slice(0, -1) + "ాలు";
  else if (w.endsWith("ి")) out = w.slice(0, -1) + "ులు";
  else out = w + "లు";
  return pre + out;
}
function teluguNum(x: string, v: number, n: number, person: boolean) {
  const nw = numWord("te", person, n);
  const pl = tePlural(x); const obl = pl.replace(/ు$/, "");          // రాములు → రాముల
  switch (v) {
    case 0: return `${nw} ${pl}`;
    case 1: return `${nw} ${obl}ను`;
    case 2: return `${nw} ${obl} చేత / ${obl}తో`;
    case 3: return `${nw} ${obl} కొరకు / ${obl}కు`;
    case 4: return `${nw} ${obl} నుండి / ${obl} వలన`;
    case 5: return `${nw} ${obl} యొక్క`;
    case 6: return `${nw} ${obl}లో`;
    default: return `ఓ ${obl}ారా!`;
  }
}
// French / Spanish: a number word and a plural noun (deux fruits, dos frutas)
const frPlural = (x: string) => x.split(" ").map((w, i, a) => i === a.length - 1 && !/[sxz]$/.test(w) ? (w.endsWith("al") ? w.slice(0, -2) + "aux" : w + "s") : w).join(" ");
const esPlural = (x: string) => x.split(" ").map((w, i, a) => i !== a.length - 1 ? w : /[aeiouáéó]$/.test(w) ? w + "s" : w.endsWith("z") ? w.slice(0, -1) + "ces" : w + "es").join(" ");

/** the meaning of one noun form, in one language */
export function nounGloss(w: Word, v: number, n: number, lang: string): string {
  const p = PRON[w.id];
  if (p && (lang === "en" || lang === "hi" || lang === "te")) return pronoun(n === 0 ? p[0] : p[1], lang, v, n === 1);
  const raw = w.m?.[lang]?.[0] || w.m?.en?.[0] || w.w;
  const senses = raw.split(/\s*;\s*/);
  // अस्मद् / युष्मद्: "I ; we" — the second sense is the plural
  const x = firstSense(p && n > 0 && senses[1] ? senses[1] : senses[0], 60).replace(/\s*\(.*?\)\s*$/, "");
  if (p) return pronounOther(w.id, lang, v, n) ?? `${x} — ${caseRole(lang, v)}`;
  const countable = w.cat !== "numeral" && w.cat !== "pronoun";
  if (lang === "en") return english(w, x, v, n, countable);
  const many = countable && n > 0, person = isPerson(w);
  if (lang === "hi") return many ? hindiNum(x, w.g, v, n, person) : hindi(x, w.g, v);
  if (lang === "te") return many ? teluguNum(x, v, n, person) : telugu(x, v);
  const nw = many ? numWord(lang, person, n) : "";
  let noun = x;
  if (many) {
    if (lang === "fr") noun = `${nw} ${frPlural(x)}`;
    else if (lang === "es") { const pl = esPlural(x); noun = `${n === 2 && /as$/.test(pl) ? "varias" : nw} ${pl}`; }
    else if (lang === "ja") noun = `${nw}${x}`;
    else if (lang === "zh" || lang === "ko" || /^[^(]/.test(nw)) noun = `${nw} ${x}`;
  }
  const suffix = many && nw.startsWith("(") ? ` ${nw}` : "";          // de / ru / ar: "(zwei)"
  if (lang === "ko") return korean(noun, v) + suffix;
  const pat = CASES[lang];
  return (pat ? fill(pat[v], noun) : `${noun} — ${caseRole(lang, v)}`) + suffix;
}

// ═══════════ verbs ═══════════
// pronouns [puruṣa][vacana]
const PRONOUNS: Record<string, string[][]> = {
  hi: [["वह", "वे दोनों", "वे"], ["तू", "तुम दोनों", "तुम सब"], ["मैं", "हम दोनों", "हम"]],
  te: [["అతడు / ఆమె / అది", "వారిద్దరు", "వారు"], ["నీవు", "మీరిద్దరు", "మీరు"], ["నేను", "మేమిద్దరం", "మేము"]],
  ta: [["அவன் / அவள் / அது", "அவர்கள் இருவர்", "அவர்கள்"], ["நீ", "நீங்கள் இருவர்", "நீங்கள்"], ["நான்", "நாங்கள் இருவர்", "நாங்கள்"]],
  kn: [["ಅವನು / ಅವಳು / ಅದು", "ಅವರಿಬ್ಬರು", "ಅವರು"], ["ನೀನು", "ನೀವಿಬ್ಬರು", "ನೀವು"], ["ನಾನು", "ನಾವಿಬ್ಬರು", "ನಾವು"]],
  ml: [["അവൻ / അവൾ / അത്", "അവർ രണ്ടുപേർ", "അവർ"], ["നീ", "നിങ്ങൾ രണ്ടുപേർ", "നിങ്ങൾ"], ["ഞാൻ", "ഞങ്ങൾ രണ്ടുപേർ", "ഞങ്ങൾ"]],
  mr: [["तो / ती / ते", "ते दोघे", "ते"], ["तू", "तुम्ही दोघे", "तुम्ही"], ["मी", "आम्ही दोघे", "आम्ही"]],
  bn: [["সে", "তারা দুজন", "তারা"], ["তুমি", "তোমরা দুজন", "তোমরা"], ["আমি", "আমরা দুজন", "আমরা"]],
  or: [["ସେ", "ସେମାନେ ଦୁଇଜଣ", "ସେମାନେ"], ["ତୁ", "ତୁମେ ଦୁଇଜଣ", "ତୁମେମାନେ"], ["ମୁଁ", "ଆମେ ଦୁଇଜଣ", "ଆମେ"]],
  de: [["er / sie / es", "die beiden", "sie"], ["du", "ihr beide", "ihr"], ["ich", "wir beide", "wir"]],
  fr: [["il / elle", "eux deux", "ils / elles"], ["tu", "vous deux", "vous"], ["je", "nous deux", "nous"]],
  es: [["él / ella", "ellos dos", "ellos / ellas"], ["tú", "vosotros dos", "vosotros"], ["yo", "nosotros dos", "nosotros"]],
  ru: [["он / она / оно", "они вдвоём", "они"], ["ты", "вы вдвоём", "вы"], ["я", "мы вдвоём", "мы"]],
  ar: [["هو / هي", "هما", "هم"], ["أنتَ", "أنتما", "أنتم"], ["أنا", "نحن الاثنان", "نحن"]],
  zh: [["他 / 她 / 它", "他们俩", "他们"], ["你", "你们俩", "你们"], ["我", "我们俩", "我们"]],
  ja: [["彼 / 彼女 / それ", "彼ら二人", "彼ら"], ["あなた", "あなたたち二人", "あなたたち"], ["私", "私たち二人", "私たち"]],
  ko: [["그 / 그녀 / 그것", "그들 둘", "그들"], ["너", "너희 둘", "너희"], ["나", "우리 둘", "우리"]],
};
// tense / mood names: lat lan lot vidhilin lrt lut lit lun asirlin lrn
const LAK_ORDER = ["lat", "lan", "lot", "vidhilin", "lrt", "lut", "lit", "lun", "asirlin", "lrn"];
const TENSE: Record<string, string[]> = {
  hi: ["वर्तमान काल", "भूतकाल (अनद्यतन)", "आज्ञा", "विधि / संभावना", "भविष्यत् काल", "भविष्यत् (अनद्यतन)", "परोक्ष भूतकाल", "भूतकाल (सामान्य)", "आशीर्वाद", "संकेत (यदि…तो)"],
  te: ["వర్తమాన కాలం", "భూతకాలం (అనద్యతన)", "ఆజ్ఞార్థకం", "విధ్యర్థకం", "భవిష్యత్ కాలం", "భవిష్యత్ (అనద్యతన)", "పరోక్ష భూతకాలం", "భూతకాలం (సామాన్య)", "ఆశీరర్థకం", "సంకేతార్థకం (అయితే…)"],
  ta: ["நிகழ்காலம்", "இறந்தகாலம்", "ஏவல்", "வியங்கோள் / வேண்டும்", "எதிர்காலம்", "எதிர்காலம் (பின்னாள்)", "இறந்தகாலம் (தொலைவு)", "இறந்தகாலம் (பொது)", "வாழ்த்து", "நிபந்தனை"],
  kn: ["ವರ್ತಮಾನ ಕಾಲ", "ಭೂತಕಾಲ", "ಆಜ್ಞಾರ್ಥಕ", "ವಿಧ್ಯರ್ಥಕ", "ಭವಿಷ್ಯತ್ ಕಾಲ", "ಭವಿಷ್ಯತ್ (ಅನದ್ಯತನ)", "ಪರೋಕ್ಷ ಭೂತಕಾಲ", "ಭೂತಕಾಲ (ಸಾಮಾನ್ಯ)", "ಆಶೀರ್ವಾದಾರ್ಥಕ", "ಸಂಕೇತಾರ್ಥಕ"],
  ml: ["വർത്തമാനകാലം", "ഭൂതകാലം", "ആജ്ഞ", "വിധി", "ഭാവികാലം", "ഭാവികാലം (അനദ്യതനം)", "പരോക്ഷ ഭൂതകാലം", "ഭൂതകാലം (സാമാന്യം)", "ആശീർവാദം", "സംകേതം"],
  mr: ["वर्तमान काळ", "भूतकाळ", "आज्ञार्थ", "विध्यर्थ", "भविष्य काळ", "भविष्य (अनद्यतन)", "परोक्ष भूतकाळ", "भूतकाळ (सामान्य)", "आशीर्वादार्थ", "संकेतार्थ"],
  bn: ["বর্তমান কাল", "অতীত কাল", "আজ্ঞা", "বিধি / সম্ভাবনা", "ভবিষ্যৎ কাল", "ভবিষ্যৎ (অনদ্যতন)", "পরোক্ষ অতীত", "অতীত (সাধারণ)", "আশীর্বাদ", "শর্তবাচক"],
  or: ["ବର୍ତ୍ତମାନ କାଳ", "ଅତୀତ କାଳ", "ଆଜ୍ଞା", "ବିଧି", "ଭବିଷ୍ୟତ କାଳ", "ଭବିଷ୍ୟତ (ଅନଦ୍ୟତନ)", "ପରୋକ୍ଷ ଅତୀତ", "ଅତୀତ (ସାଧାରଣ)", "ଆଶୀର୍ବାଦ", "ସଙ୍କେତ"],
  de: ["Präsens", "Vergangenheit", "Imperativ", "Optativ (sollte)", "Futur", "Futur (später)", "Perfekt (lange her)", "Aorist", "Segenswunsch", "Konditional"],
  fr: ["présent", "imparfait", "impératif", "optatif (devrait)", "futur", "futur (lointain)", "parfait (lointain)", "aoriste", "bénédictif", "conditionnel"],
  es: ["presente", "imperfecto", "imperativo", "optativo (debería)", "futuro", "futuro (lejano)", "perfecto (remoto)", "aoristo", "benedictivo", "condicional"],
  ru: ["настоящее время", "прошедшее время", "повелительное", "желательное (следует)", "будущее время", "будущее (отдалённое)", "давнопрошедшее", "аорист", "благопожелание", "условное"],
  ar: ["المضارع", "الماضي", "الأمر", "التمنّي (ينبغي)", "المستقبل", "المستقبل البعيد", "الماضي البعيد", "الماضي المطلق", "الدعاء", "الشرط"],
  zh: ["现在时", "过去时", "命令式", "祈愿式（应该）", "将来时", "将来时（较远）", "完成时（远古）", "不定过去时", "祝愿式", "条件式"],
  ja: ["現在", "過去", "命令", "願望（〜べき）", "未来", "未来（後日）", "完了（遠い過去）", "アオリスト", "祈願", "条件"],
  ko: ["현재", "과거", "명령", "희망(~해야)", "미래", "미래(먼)", "완료(먼 과거)", "부정과거", "기원", "조건"],
};
const VOICE: Record<string, [string, string]> = {
  hi: ["कर्मवाच्य", "भाववाच्य"], te: ["కర్మణి ప్రయోగం", "భావే ప్రయోగం"], ta: ["செயப்பாட்டுவினை", "பாவே (ஆள்சாரா)"],
  kn: ["ಕರ್ಮಣಿ ಪ್ರಯೋಗ", "ಭಾವೇ ಪ್ರಯೋಗ"], ml: ["കർമ്മണി പ്രയോഗം", "ഭാവേ പ്രയോഗം"], mr: ["कर्मणी प्रयोग", "भावे प्रयोग"],
  bn: ["কর্মবাচ্য", "ভাববাচ্য"], or: ["କର୍ମବାଚ୍ୟ", "ଭାବବାଚ୍ୟ"], de: ["Passiv", "unpersönlich"], fr: ["passif", "impersonnel"],
  es: ["pasiva", "impersonal"], ru: ["страдательный залог", "безличное"], ar: ["المبني للمجهول", "غير شخصي"],
  zh: ["被动", "无人称"], ja: ["受動", "非人称"], ko: ["수동", "비인칭"],
};

/** the meaning of one verb form, in one language (English comes from the data: c[2]) */
export function verbGloss(v: Verb, key: "P" | "A" | "K" | "B", lak: string, p: number, n: number, lang: string, enGloss: string): string {
  if (lang === "en") return enGloss;
  const nat = naturalVerb(lang, v.w, key, lak, p, n);
  if (nat) return nat;
  const verb = firstSense((v.m as Record<string, string | undefined>)[lang] || v.m.en || "", 40).split(/\s*\/\s*|,\s*|，|、|・/)[0];
  const t = (TENSE[lang] ?? [])[LAK_ORDER.indexOf(lak)] ?? (lak === "asirlin" ? "blessing" : lak);
  const mood = lak === "asirlin" ? `(${t})` : t;
  if (key === "B") return `${verb} · ${mood} · ${VOICE[lang]?.[1] ?? "impersonal"}`;
  const pr = PRONOUNS[lang]?.[p]?.[n] ?? "";
  return key === "K" ? `${pr} · ${verb} · ${mood} · ${VOICE[lang]?.[0] ?? "passive"}` : `${pr} · ${verb} · ${mood}`;
}

// ═══════════ kṛdantas: see krtForms.ts ═══════════
/** the meaning of one kṛdanta, in one language. root: the Sanskrit root (to use that language's own verb forms);
 *  verbMeaning: fallback when a root has no table — the root's meaning + the kind of kṛdanta */
export function krtGloss(pratyaya: string, lang: string, enGloss: string, verbMeaning: string, root?: string): string {
  if (lang === "en") return enGloss;
  const real = root ? krtLocal(root, pratyaya, lang) : null;
  if (real) return real;
  const g = KRT_GROUP[pratyaya];
  const label = g ? KRT_NAME[lang]?.[KG.indexOf(g as typeof KG[number])] : undefined;
  const verb = firstSense(verbMeaning, 40).split(/\s*\/\s*|,\s*|，|、|・/)[0];
  return label ? `${verb} · ${label}` : enGloss;
}

/** languages whose form-meanings come from patterns (all except English verb/kṛt glosses, which are hand-written) */
export const PATTERN_NOTE = "pattern";
