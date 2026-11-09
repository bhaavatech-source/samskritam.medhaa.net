// ═══════════════════════════════════════════════════════════════
//  i18n/pronouns.ts — real pronoun forms in every language
//  (मुझको · హమ దోనోం కో · నా చేత · by me · mich · мной · بي · 私を …)
//  for अस्मद्, युष्मद्, तद्, एतद्, इदम्, अदस्, यद्, किम्.
// ═══════════════════════════════════════════════════════════════
import { CASES_FOR_PRONOUNS, korean } from "./forms";

type B = "I" | "we" | "you" | "youpl" | "he" | "she" | "it" | "they" | "this" | "these" | "who" | "what";
/** Sanskrit pronoun → [singular bucket, plural bucket] */
export const PRON_IDS: Record<string, [B, B]> = {
  "SH-000142": ["I", "we"], "SH-000143": ["you", "youpl"], "SH-000134": ["he", "they"], "SH-000135": ["she", "they"],
  "SH-000136": ["it", "they"], "SH-000137": ["this", "these"], "SH-000144": ["this", "these"], "SH-000145": ["he", "they"],
  "SH-000138": ["who", "who"], "SH-000139": ["who", "who"], "SH-000140": ["who", "who"], "SH-000141": ["what", "what"],
};
const ORDER: B[] = ["I", "we", "you", "youpl", "he", "she", "it", "they", "this", "these", "who", "what"];
const T = (rows: string) => Object.fromEntries(rows.trim().split("\n").map((r, i) => [ORDER[i], r.split("|").map(s => s.trim())])) as Record<B, string[]>;

// Indian languages: nominative | accusative | oblique (before case endings) | possessive
const INDIC: Record<string, Record<B, string[]>> = {
  ta: T(`நான்|என்னை|என்|என்னுடைய
நாங்கள்|எங்களை|எங்கள்|எங்களுடைய
நீ|உன்னை|உன்|உன்னுடைய
நீங்கள்|உங்களை|உங்கள்|உங்களுடைய
அவன்|அவனை|அவன்|அவனுடைய
அவள்|அவளை|அவள்|அவளுடைய
அது|அதை|அதன்|அதனுடைய
அவர்கள்|அவர்களை|அவர்கள்|அவர்களுடைய
இவன்|இவனை|இவன்|இவனுடைய
இவர்கள்|இவர்களை|இவர்கள்|இவர்களுடைய
யார்|யாரை|யார்|யாருடைய
என்ன|எதை|எதன்|எதனுடைய`),
  kn: T(`ನಾನು|ನನ್ನನ್ನು|ನನ್ನ|ನನ್ನ
ನಾವು|ನಮ್ಮನ್ನು|ನಮ್ಮ|ನಮ್ಮ
ನೀನು|ನಿನ್ನನ್ನು|ನಿನ್ನ|ನಿನ್ನ
ನೀವು|ನಿಮ್ಮನ್ನು|ನಿಮ್ಮ|ನಿಮ್ಮ
ಅವನು|ಅವನನ್ನು|ಅವನ|ಅವನ
ಅವಳು|ಅವಳನ್ನು|ಅವಳ|ಅವಳ
ಅದು|ಅದನ್ನು|ಅದರ|ಅದರ
ಅವರು|ಅವರನ್ನು|ಅವರ|ಅವರ
ಇವನು|ಇವನನ್ನು|ಇವನ|ಇವನ
ಇವರು|ಇವರನ್ನು|ಇವರ|ಇವರ
ಯಾರು|ಯಾರನ್ನು|ಯಾರ|ಯಾರ
ಏನು|ಯಾವುದನ್ನು|ಯಾವುದರ|ಯಾವುದರ`),
  ml: T(`ഞാൻ|എന്നെ|എന്|എന്റെ
ഞങ്ങൾ|ഞങ്ങളെ|ഞങ്ങൾ|ഞങ്ങളുടെ
നീ|നിന്നെ|നിന്|നിന്റെ
നിങ്ങൾ|നിങ്ങളെ|നിങ്ങൾ|നിങ്ങളുടെ
അവൻ|അവനെ|അവന്|അവന്റെ
അവൾ|അവളെ|അവൾ|അവളുടെ
അത്|അതിനെ|അതിന്|അതിന്റെ
അവർ|അവരെ|അവർ|അവരുടെ
ഇവൻ|ഇവനെ|ഇവന്|ഇവന്റെ
ഇവർ|ഇവരെ|ഇവർ|ഇവരുടെ
ആര്|ആരെ|ആര്|ആരുടെ
എന്ത്|എന്തിനെ|എന്തിന്|എന്തിന്റെ`),
  mr: T(`मी|मला|मज|माझा
आम्ही|आम्हाला|आम्हा|आमचा
तू|तुला|तुज|तुझा
तुम्ही|तुम्हाला|तुम्हा|तुमचा
तो|त्याला|त्या|त्याचा
ती|तिला|ति|तिचा
ते|त्याला|त्या|त्याचा
ते|त्यांना|त्यां|त्यांचा
हा|ह्याला|ह्या|ह्याचा
हे|ह्यांना|ह्यां|ह्यांचा
कोण|कोणाला|कोणा|कोणाचा
काय|कशाला|कशा|कशाचा`),
  bn: T(`আমি|আমাকে|আমার|আমার
আমরা|আমাদের|আমাদের|আমাদের
তুমি|তোমাকে|তোমার|তোমার
তোমরা|তোমাদের|তোমাদের|তোমাদের
সে|তাকে|তার|তার
সে|তাকে|তার|তার
এটা|এটাকে|এটার|এটার
তারা|তাদের|তাদের|তাদের
এ|একে|এর|এর
এরা|এদের|এদের|এদের
কে|কাকে|কার|কার
কী|কিসকে|কিসের|কিসের`),
  or: T(`ମୁଁ|ମୋତେ|ମୋ|ମୋର
ଆମେ|ଆମକୁ|ଆମ|ଆମର
ତୁ|ତୋତେ|ତୋ|ତୋର
ତୁମେ|ତୁମକୁ|ତୁମ|ତୁମର
ସେ|ତାକୁ|ତା|ତାର
ସେ|ତାକୁ|ତା|ତାର
ତାହା|ତାହାକୁ|ତାହା|ତାହାର
ସେମାନେ|ସେମାନଙ୍କୁ|ସେମାନଙ୍କ|ସେମାନଙ୍କର
ଏ|ଏହାକୁ|ଏହା|ଏହାର
ଏମାନେ|ଏମାନଙ୍କୁ|ଏମାନଙ୍କ|ଏମାନଙ୍କର
କିଏ|କାହାକୁ|କାହା|କାହାର
କଣ|କାହାକୁ|କାହା|କାହାର`),
};
const INDIC_TWO: Record<string, string> = { ta: "இருவர்", kn: "ಇಬ್ಬರು", ml: "രണ്ടുപേർ", mr: "दोघे", bn: "দুজন", or: "ଦୁଇଜଣ" };

// German: nominative | accusative | dative | possessive
const DE = T(`ich|mich|mir|mein
wir|uns|uns|unser
du|dich|dir|dein
ihr|euch|euch|euer
er|ihn|ihm|sein
sie|sie|ihr|ihr
es|es|ihm|sein
sie|sie|ihnen|ihr
dieser|diesen|diesem|dessen
diese|diese|diesen|deren
wer?|wen?|wem?|wessen?
was?|was?|was?|wessen?`);
// French / Spanish: subject | stressed object | possessive
const FR = T(`je|moi|mon / ma
nous|nous|notre
tu|toi|ton / ta
vous|vous|votre
il|lui|son / sa
elle|elle|son / sa
il|lui|son / sa
ils|eux|leur
celui-ci|celui-ci|de celui-ci
ceux-ci|ceux-ci|de ceux-ci
qui ?|qui ?|de qui ?
quoi ?|quoi ?|de quoi ?`);
const ES = T(`yo|mí|mi
nosotros|nosotros|nuestro
tú|ti|tu
vosotros|vosotros|vuestro
él|él|su
ella|ella|su
ello|ello|su
ellos|ellos|su
este|este|de este
estos|estos|de estos
¿quién?|¿quién?|¿de quién?
¿qué?|¿qué?|¿de qué?`);
// Russian: nom | acc | ins | dat | gen | prep | possessive
const RU = T(`я|меня|мной|мне|меня|мне|мой
мы|нас|нами|нам|нас|нас|наш
ты|тебя|тобой|тебе|тебя|тебе|твой
вы|вас|вами|вам|вас|вас|ваш
он|его|им|ему|него|нём|его
она|её|ей|ей|неё|ней|её
оно|его|им|ему|него|нём|его
они|их|ими|им|них|них|их
этот|этого|этим|этому|этого|этом|этого
эти|этих|этими|этим|этих|этих|этих
кто?|кого?|кем?|кому?|кого?|ком?|чей?
что?|что?|чем?|чему?|чего?|чём?|чего?`);
// Arabic: the eight relations written out (prepositions take attached pronouns)
const AR = T(`أنا|إيّاي|بي / معي|لي|منّي|ـي (لي)|فيّ
نحن|إيّانا|بنا / معنا|لنا|منّا|ـنا (لنا)|فينا
أنتَ|إيّاكَ|بكَ / معكَ|لكَ|منكَ|ـكَ (لكَ)|فيكَ
أنتم|إيّاكم|بكم / معكم|لكم|منكم|ـكم (لكم)|فيكم
هو|إيّاه|به / معه|له|منه|ـه (له)|فيه
هي|إيّاها|بها / معها|لها|منها|ـها (لها)|فيها
هو|إيّاه|به / معه|له|منه|ـه (له)|فيه
هم|إيّاهم|بهم / معهم|لهم|منهم|ـهم (لهم)|فيهم
هذا|هذا|بهذا / مع هذا|لهذا|من هذا|هذا (إضافة)|في هذا
هؤلاء|هؤلاء|بهؤلاء / مع هؤلاء|لهؤلاء|من هؤلاء|هؤلاء (إضافة)|في هؤلاء
مَن؟|مَن؟|بمَن؟ / مع مَن؟|لمَن؟|ممّن؟|لمَن؟|في مَن؟
ما؟|ماذا؟|بماذا؟|لماذا؟|ممّا؟|لِما؟|فيمَ؟`);
// Chinese / Japanese / Korean: the pronoun, then the language's own particles
const CJK: Record<string, Record<B, string>> = {
  zh: Object.fromEntries(ORDER.map((b, i) => [b, ["我", "我们", "你", "你们", "他", "她", "它", "他们", "这个", "这些", "谁", "什么"][i]])) as Record<B, string>,
  ja: Object.fromEntries(ORDER.map((b, i) => [b, ["私", "私たち", "あなた", "あなたたち", "彼", "彼女", "それ", "彼ら", "これ", "これら", "誰", "何"][i]])) as Record<B, string>,
  ko: Object.fromEntries(ORDER.map((b, i) => [b, ["나", "우리", "너", "너희", "그", "그녀", "그것", "그들", "이것", "이것들", "누구", "무엇"][i]])) as Record<B, string>,
};
const CJK_TWO: Record<string, string> = { zh: "俩", ja: "二人", ko: "둘" };

/** a pronoun form's meaning in one of the languages other than English / Hindi / Telugu */
export function pronounOther(id: string, lang: string, v: number, n: number): string | null {
  const ids = PRON_IDS[id]; if (!ids) return null;
  const b = n === 0 ? ids[0] : ids[1];
  const two = n === 1;
  const rel = id === "SH-000138";
  const strip = (s: string) => (rel ? s.replace(/[?？؟¿]/g, "").trim() : s);

  if (INDIC[lang]) {
    const [nom, acc, obl, poss] = INDIC[lang][b].map(strip);
    if (two && v === 0) return `${nom} ${INDIC_TWO[lang]}`;
    const t = two ? ` (${INDIC_TWO[lang]})` : "";
    if (v === 0 || v === 7) return nom + t;
    if (v === 1) return acc + t;
    if (v === 5) return poss + t;
    if (lang === "bn") return [, , `${poss} দ্বারা`, `${poss} জন্য`, `${poss} থেকে`, , `${poss} মধ্যে`][v] + t;   // আমার জন্য
    return CASES_FOR_PRONOUNS(lang, v, obl) + t;
  }
  if (lang === "de") {
    const [nom, acc, dat, poss] = DE[b].map(strip); const t = two ? " (beide)" : "";
    return [`${nom}${two ? " beide" : ""}`, acc, `durch ${acc} / mit ${dat}`, `für ${acc} / ${dat}`, `von ${dat}`, poss, `in / an ${dat}`, nom][v] + (v === 0 ? "" : t);
  }
  if (lang === "fr" || lang === "es") {
    const [nom, obj, poss] = (lang === "fr" ? FR : ES)[b].map(strip); const t = two ? (lang === "fr" ? " (tous les deux)" : " (los dos)") : "";
    if (lang === "fr") return [nom + t, obj + t, `par / avec ${obj}${t}`, `à / pour ${obj}${t}`, `de ${obj}${t}`, poss, `en / sur ${obj}${t}`, nom + t][v];
    const con = b === "I" ? "conmigo" : b === "you" ? "contigo" : `con ${obj}${t}`;
    return [nom + t, `a ${obj}${t}`, `por ${obj}${t} / ${con}`, `a / para ${obj}${t}`, `de / desde ${obj}${t}`, poss, `en ${obj}${t}`, nom + t][v];
  }
  if (lang === "ru") {
    const [nom, acc, ins, dat, gen, prep, poss] = RU[b].map(strip); const t = two ? " (оба)" : "";
    return [nom, acc, ins, dat, `от ${gen}`, poss, `в / на ${prep}`, nom][v] + t;
  }
  if (lang === "ar") {
    const f = AR[b].map(strip); const t = two ? " (اثنان)" : "";
    return (v === 7 ? f[0] : f[v]) + t;
  }
  if (CJK[lang]) {
    let x = CJK[lang][b]; if (rel) x = strip(x);
    if (two) x = lang === "ja" ? `${x}二人` : lang === "zh" ? `${x}${CJK_TWO.zh}` : `${x} ${CJK_TWO.ko}`;
    if (lang === "ko") {
      if (v === 0 && !two) { const nomKo: Record<string, string> = { "나": "내가", "너": "네가", "누구": "누가" }; if (nomKo[x]) return nomKo[x]; }
      if (v === 5 && !two) { const genKo: Record<string, string> = { "나": "나의 (내)", "너": "너의 (네)" }; if (genKo[x]) return genKo[x]; }
      return korean(x, v);
    }
    return CASES_FOR_PRONOUNS(lang, v, x).replace(/ 的$/, "的");
  }
  return null;
}
