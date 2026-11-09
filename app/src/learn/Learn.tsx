// ═══════════════════════════════════════════════════════════════
//  learn/Learn.tsx — बोधः: WHY Sanskrit words have the forms they have
//  शब्दरूपाणि (24 forms), धातुरूपाणि (9 × 10 forms), अव्ययानि (one form),
//  and how related patterns can be compared across languages (from the author's PhD thesis,
//  ch. 4.7 सुबन्तदिशा, 4.8.6 तिङन्तदिशा, tables 4.7.2.2.1 & 4.8.11).
// ═══════════════════════════════════════════════════════════════
import React, { useState } from "react";
import {
  WORDS, VERBS, AVYAYA, AVYAYA_CATS, LANGS, MEANING_LANGS, VIBHAKTI, VACANA, PURUSHA, LAKARA, LAKARA_ORDER,
  headForm, wordMeaning, verbMeaning, avyayaMeaning, type Word,
} from "../data";
import { nounGloss, verbGloss } from "../i18n/forms";
import { useLang } from "../settings";
import { speak } from "../speech";
import "./learn.css";

type Ch = "shabda" | "dhatu" | "avyaya";
const CHAPTERS: [Ch, string, string][] = [
  ["shabda", "शब्दरूपाणि", "Why every noun has 24 forms"],
  ["dhatu", "धातुरूपाणि", "Why every verb has 9 forms in each tense"],
  ["avyaya", "अव्ययानि", "Words that never change"],
];

const Learn: React.FC = () => {
  const [ch, setCh] = useState<Ch>("shabda");
  return (
    <div className="ln">
      <div className="jy-top">
        <div>
          <h2 className="jy-title">बोधः <span>· How Sanskrit words work</span></h2>
          <p className="jy-sub">Why Sanskrit words take different forms, and how those forms can be compared across languages.</p>
        </div>
      </div>
      <div className="ln-chapters">
        {CHAPTERS.map(([k, sa, en]) => (
          <button key={k} className={ch === k ? "on" : ""} onClick={() => setCh(k)}><b>{sa}</b><small>{en}</small></button>
        ))}
      </div>
      {ch === "shabda" ? <Shabda /> : ch === "dhatu" ? <Dhatu /> : <Avyaya />}
      <p className="ln-source">आधारः · Based on Rajeswararao, <i>PhD thesis</i>: ch. 4.7 (सुबन्तदिशा), tables 4.7.2.2.1 (case tables of 20 languages), 4.7.2.2.3–4, ch. 4.8.6–4.8.11 (तिङन्तदिशा, conjugation tables) and ch. 5 (उपसंहारः); Pāṇini, <i>Aṣṭādhyāyī</i>.</p>
    </div>
  );
};
export default Learn;

// ── small building blocks ──────────────────────────────────────
const Sutra: React.FC<{ t: string; n: string }> = ({ t, n }) => <span className="ln-sutra">{t} <small>{n}</small></span>;
const Card: React.FC<{ title: string; children: React.ReactNode; tone?: string }> = ({ title, children, tone }) => (
  <section className={`ln-card ${tone ?? ""}`}><h3>{title}</h3>{children}</section>
);

/** pick up to four languages to compare side by side */
function useCompareLangs() {
  const lang = useLang();
  const [langs, setLangs] = useState<string[]>(() => Array.from(new Set([lang, "en", "hi", "ja"])).slice(0, 4));
  const toggle = (l: string) => setLangs(cur => cur.includes(l) ? cur.filter(x => x !== l) : cur.length >= 4 ? [...cur.slice(1), l] : [...cur, l]);
  return { langs, toggle };
}
const LangChips: React.FC<{ langs: string[]; toggle: (l: string) => void }> = ({ langs, toggle }) => (
  <div className="ln-langs" role="group" aria-label="Languages to compare">
    {MEANING_LANGS.map(l => <button key={l} className={langs.includes(l) ? "on" : ""} aria-pressed={langs.includes(l)} onClick={() => toggle(l)}>{LANGS[l]}</button>)}
    <small>choose up to 4</small>
  </div>
);

// ═══════════ 1. शब्दरूपाणि ═══════════
const KARAKA: [string, string, string, string, string][] = [
  ["प्रथमा", "कर्ता", "स्वतन्त्रः कर्ता", "1.4.54", "who does it?"],
  ["द्वितीया", "कर्म", "कर्तुरीप्सिततमं कर्म", "1.4.49", "what / whom is it done to?"],
  ["तृतीया", "करणम्", "साधकतमं करणम्", "1.4.42", "with what / by whom?"],
  ["चतुर्थी", "सम्प्रदानम्", "कर्मणा यमभिप्रैति स सम्प्रदानम्", "1.4.32", "for whom / to whom?"],
  ["पञ्चमी", "अपादानम्", "ध्रुवमपायेऽपादानम्", "1.4.24", "from where / from whom?"],
  ["षष्ठी", "सम्बन्धः", "षष्ठी शेषे", "2.3.50", "whose? (a relation between two nouns)"],
  ["सप्तमी", "अधिकरणम्", "आधारोऽधिकरणम्", "1.4.45", "where / in what?"],
  ["सम्बोधनम्", "सम्बोधनम्", "सम्बोधने च", "2.3.47", "calling someone: O …!"],
];
// finer meanings under each vibhakti (Pāṇini 2.3, 1.4)
const SUBTYPES: [string, string, string, string][] = [
  ["प्रथमा", "naming; the subject of an active verb, the object of a passive one", "रामः गच्छति · ग्रन्थः पठ्यते", "प्रातिपदिकार्थ… प्रथमा 2.3.46"],
  ["द्वितीया", "object (कर्म)", "ग्रामं गच्छति", "कर्मणि द्वितीया 2.3.2"],
  ["द्वितीया", "duration of time, extent of distance", "मासम् अधीते · क्रोशं कुटिला नदी", "कालाध्वनोरत्यन्तसंयोगे 2.3.5"],
  ["द्वितीया", "with अन्तरा / अन्तरेण (between, without)", "अन्तरा त्वां मां च", "अन्तरान्तरेणयुक्ते 2.3.4"],
  ["द्वितीया", "with अभितः, परितः, प्रति … (around, towards)", "ग्रामं परितः · वृक्षं प्रति", "कर्मप्रवचनीययुक्ते द्वितीया 2.3.8"],
  ["तृतीया", "instrument (करण)", "दात्रेण लुनाति", "कर्तृकरणयोस्तृतीया 2.3.18"],
  ["तृतीया", "doer in a passive sentence", "रामेण रावणः हतः", "कर्तृकरणयोस्तृतीया 2.3.18"],
  ["तृतीया", "accompaniment: with (comitative)", "पुत्रेण सह आगतः", "सहयुक्तेऽप्रधाने 2.3.19"],
  ["तृतीया", "a defect in a part of the body", "अक्ष्णा काणः", "येनाङ्गविकारः 2.3.20"],
  ["तृतीया", "a mark that identifies", "जटाभिः तापसः", "इत्थंभूतलक्षणे 2.3.21"],
  ["तृतीया", "cause", "विद्यया यशः", "हेतौ 2.3.23"],
  ["तृतीया", "time in which a task is completed", "मासेन अनुवाकः अधीतः", "अपवर्गे तृतीया 2.3.6"],
  ["चतुर्थी", "recipient (सम्प्रदान)", "विप्राय गां ददाति", "चतुर्थी सम्प्रदाने 2.3.13"],
  ["चतुर्थी", "the one pleased", "हरये रोचते भक्तिः", "रुच्यर्थानां प्रीयमाणः 1.4.33"],
  ["चतुर्थी", "purpose", "मुक्तये हरिं भजति", "तादर्थ्ये चतुर्थी (वार्त्तिकम्)"],
  ["चतुर्थी", "with नमः, स्वस्ति, स्वाहा, अलम् …", "गणेशाय नमः", "नमःस्वस्तिस्वाहा… 2.3.16"],
  ["पञ्चमी", "source, separation (अपादान)", "वृक्षात् पत्रं पतति", "अपादाने पञ्चमी 2.3.28"],
  ["पञ्चमी", "what one fears or is protected from", "चोरात् बिभेति", "भीत्रार्थानां भयहेतुः 1.4.25"],
  ["पञ्चमी", "comparison: than", "रामात् श्यामः पटुतरः", "पञ्चमी विभक्ते 2.3.42"],
  ["पञ्चमी", "with ऋते, अन्य, इतर, directions (without, other than, east of)", "ऋते ज्ञानात् न मुक्तिः", "अन्यारादितरर्ते… 2.3.29"],
  ["पञ्चमी", "cause (a quality)", "जाड्यात् बद्धः", "विभाषा गुणेऽस्त्रियाम् 2.3.25"],
  ["षष्ठी", "relation, possession", "राज्ञः पुरुषः", "षष्ठी शेषे 2.3.50"],
  ["षष्ठी", "doer / object of an action noun", "कृष्णस्य कृतिः · जगतः कर्ता", "कर्तृकर्मणोः कृति 2.3.65"],
  ["षष्ठी", "with the word हेतु", "अन्नस्य हेतोः वसति", "षष्ठी हेतुप्रयोगे 2.3.26"],
  ["षष्ठी", "in spite of (disregard)", "रुदतः प्राव्राजीत्", "षष्ठी चानादरे 2.3.38"],
  ["षष्ठी / सप्तमी", "the group a choice is made from", "नृणां / नृषु द्विजः श्रेष्ठः", "यतश्च निर्धारणम् 2.3.41"],
  ["सप्तमी", "place, time (अधिकरण)", "गृहे वसति · प्रभाते गच्छति", "सप्तम्यधिकरणे च 2.3.36"],
  ["सप्तमी", "when / while (absolute)", "गोषु दुह्यमानासु गतः", "यस्य च भावेन भावलक्षणम् 2.3.37"],
  ["सप्तमी", "topic: about, in the matter of", "मोक्षे इच्छा अस्ति", "आधारोऽधिकरणम् 1.4.45 (वैषयिकः)"],
  ["सम्बोधनम्", "calling, addressing", "हे राम", "सम्बोधने च 2.3.47"],
];
// avyayas made from nouns, defined by Pāṇini through vibhakti meanings
const TADDHITA_AVY: [string, string, string][] = [
  ["ततः", "तस्मात् (पञ्चमी)", "पञ्चम्यास्तसिल् 5.3.7"],
  ["तत्र", "तस्मिन् (सप्तमी)", "सप्तम्यास्त्रल् 5.3.10"],
  ["सर्वदा", "सर्वस्मिन् काले (सप्तमी)", "सर्वैकान्यकिंयत्तदः काले दा 5.3.15"],
  ["ग्रामतः (आगच्छति)", "ग्रामात् (अपादान)", "अपादाने चाहीयरुहोः 5.4.45"],
  ["बहुशः (ददाति)", "बहूनि, many at a time (a kāraka + distribution)", "बह्वल्पार्थाच्छस्कारकादन्यतरस्याम् 5.4.42"],
  ["राजवत्", "राज्ञा तुल्यम् (तृतीया + likeness)", "तेन तुल्यं क्रिया चेद्वतिः 5.1.115"],
  ["भस्मसात् (करोति)", "entirely into ash (becoming)", "विभाषा साति कार्त्स्न्ये 5.4.52"],
  ["शुक्लीभवति", "becomes white (what was not)", "अभूततद्भावे… च्विः 5.4.50"],
];
const SUP = [["सु", "औ", "जस्"], ["अम्", "औट्", "शस्"], ["टा", "भ्याम्", "भिस्"], ["ङे", "भ्याम्", "भ्यस्"], ["ङसि", "भ्याम्", "भ्यस्"], ["ङस्", "ओस्", "आम्"], ["ङि", "ओस्", "सुप्"]];
const WORLD: [string, string, string][] = [
  ["Telugu, Kannada", "8 vibhaktis, same Sanskrit names (ప్రథమ … సంబోధన)", "suffixes: -ని, -చేత, -కొరకు, -వలన, -యొక్క, -లో"],
  ["Tamil", "8 வேற்றுமை (cases)", "-ஐ, -ஆல், -க்கு, -இலிருந்து, -இன், -இல், விளி"],
  ["Hindi, Marathi, Bengali, Odia", "direct + oblique + postpositions", "को, से, के लिए, का, में; -ला, -ने, -चा …"],
  ["Latin", "6–7 cases", "nominative … ablative, vocative, (locative)"],
  ["Russian, Polish", "6–7 cases", "именительный … предложный; Polish adds the vocative"],
  ["German", "4 cases + prepositions", "Nominativ, Akkusativ, Dativ, Genitiv"],
  ["Modern Greek", "4 cases (one is the vocative) + prepositions", "nominative, genitive, accusative, vocative"],
  ["English, French, Spanish", "word order + prepositions", "by / with, to / for, from, of, in"],
  ["Arabic", "3 cases + prepositions + attached pronouns", "بِـ ، لِـ ، مِن ، في"],
  ["Hebrew", "no case endings: prepositions, the object marker את, word order", "בְּ ، לְ ، מִן ، שֶׁל"],
  ["Hungarian, Finnish", "15–27 cases (the count depends on the definition)", "fused postpositions: in / into / out of, on / onto / off, at / to / from, with, without, as, becoming"],
  ["Turkish, Georgian, Armenian", "6–7 cases", "the same kāraka relations, agglutinated"],
  ["Japanese, Korean", "particles after the noun", "が / を / で / に / から / の; 이/가, 을/를, 로, 에게, 에서, 의"],
  ["Chinese", "word order + prepositions", "把, 用 / 被, 给, 从, 的, 在"],
];

const Shabda: React.FC = () => {
  const { langs, toggle } = useCompareLangs();
  const nouns = WORDS.filter(w => w.cat === "noun" || w.cat === "pronoun");
  const [wid, setWid] = useState(nouns[0].id);
  const [num, setNum] = useState(0);
  const w = WORDS.find(x => x.id === wid) as Word;
  return (
    <div className="ln-body">
      <Card title="एकः शब्दः, चतुर्विंशतिः रूपाणि · One word, 24 forms">
        <p>A Sanskrit noun is a <b>stem</b> (प्रातिपदिकम्) plus an <b>ending</b> (सुप्-प्रत्ययः). Pāṇini gives exactly <b>21 endings</b> in one sūtra, seven groups of three:</p>
        <p className="ln-center"><Sutra t="स्वौजसमौट्छष्टाभ्याम्भिस्ङेभ्याम्भ्यस्ङसिभ्याम्भ्यस्ङसोसाम्ङ्योस्सुप्" n="4.1.2" /></p>
        <div className="ln-eq"><span className="ln-stem">राम</span> + <span className="ln-suf">टा</span> = <span className="ln-word">रामेण</span><small>stem + 3rd-case singular ending = “by Rāma”</small></div>
        <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>विभक्तिः</th>{VACANA.map(v => <th key={v}>{v}</th>)}</tr></thead>
          <tbody>{SUP.map((r, i) => <tr key={i}><th>{VIBHAKTI[i]}</th>{r.map((x, j) => <td key={j} className="ln-deva">{x}</td>)}</tr>)}
            <tr><th>सम्बोधनम्</th><td colSpan={3} className="ln-note-cell">uses the प्रथमा endings (<Sutra t="सम्बोधने च" n="2.3.47" />), so 7 × 3 + 3 = <b>24 forms</b></td></tr></tbody></table></div>
        <p>Three numbers (वचनानि: one, two, many) × eight relations (विभक्तयः) = <b>24</b>. Every declinable word has these 24 places, whatever its gender or stem. Some words fill only part of them: दाराः, आपः, प्राणाः occur only in the plural, द्वि only in the dual, and pronouns have no सम्बोधनम्. Traditional teaching memorises शब्दरूपाणि early because the whole grid comes with every new word.</p>
      </Card>

      <Card title="कारकाणि · The eight relations a noun can have">
        <p>The eight cases are not arbitrary endings. Each one names a <b>role in an action</b> (कारकम्, “that which makes the action happen”), plus one relation between nouns and one form for calling:</p>
        <p className="ln-center ln-verse">कर्ता कर्म च करणं सम्प्रदानं तथैव च ।<br />अपादानाधिकरणमित्याहुः कारकाणि षट् ॥</p>
        <div className="ln-karakas">
          {KARAKA.map(([v, k, s, n, q], i) => (
            <div key={v} className="ln-karaka">
              <span className="ln-k-num">{i + 1}</span>
              <b>{v}</b><span className="ln-k-name">{k}</span>
              <Sutra t={s} n={n} />
              <small>{q}</small>
              <span className="ln-k-eg">{w.d[0]?.[i] ? (i === 7 ? "हे " : "") + w.d[0][i] : ""}</span>
            </div>
          ))}
        </div>
        <p><b>विवक्षातः कारकाणि भवन्ति</b>: which role a thing plays depends on what the speaker wants to say. The same pot can be the place (स्थाल्यां पचति, “cooks in the pot”), the instrument (स्थाल्या पचति, “cooks with the pot”) or even the doer (स्थाली पचति, “the pot cooks”). Whatever the intention, the relation always lands in one of these eight.</p>
      </Card>

      <Card title="सूक्ष्मार्थाः · Finer meanings inside each vibhakti">
        <p>Each of the eight is a <b>head</b> with several finer meanings under it. Pāṇini lists them in the section 2.3 (and the kāraka rules 1.4.23–55). These finer meanings are where other languages' extra cases and prepositions land:</p>
        <div className="ln-table-wrap"><table className="ln-table ln-sub"><thead><tr><th>विभक्तिः</th><th>meaning</th><th>example</th><th>sūtra</th></tr></thead>
          <tbody>{SUBTYPES.map(([v, m, e, s], i) => <tr key={i} className={i > 0 && SUBTYPES[i - 1][0] === v ? "" : "ln-sub-first"}><th>{i > 0 && SUBTYPES[i - 1][0] === v ? "" : v}</th><td>{m}</td><td className="ln-deva">{e}</td><td className="ln-deva ln-small">{s}</td></tr>)}</tbody></table></div>
        <p>About thirty meanings under eight heads, each tied to a sūtra. This is the answer to the objection that षष्ठी शेषे is just a catch-all: the inventory is <b>listed</b>, not left open.</p>
      </Card>

      <Card title="तद्धिताव्ययानि समासाश्च · Words made from a noun keep these meanings">
        <p>Some words made from a noun look like extra cases: ततः, तत्र, ग्रामतः, बहुशः, राजवत्, भस्मसात्. They are <b>avyayas</b> (तद्धितश्चासर्वविभक्तिः 1.1.38), so each fills the 24 places with one form. Pāṇini also <b>defines them through the same vibhakti meanings</b>:</p>
        <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>word</th><th>= meaning</th><th>sūtra</th></tr></thead>
          <tbody>{TADDHITA_AVY.map(([w, m, s]) => <tr key={w}><th className="ln-deva">{w}</th><td className="ln-deva">{m}</td><td className="ln-deva ln-small">{s}</td></tr>)}</tbody></table></div>
        <p>Compound members work the same way. In राजपुरुषः = राज्ञः पुरुषः, the षष्ठी is present and is then dropped (<Sutra t="सुपो धातुप्रातिपदिकयोः" n="2.4.71" />). In aluk compounds it stays visible: युधिष्ठिरः, खेचरः.</p>
      </Card>

      <Card title="तुलना · Comparing noun relations across languages" tone="ln-key">
        <p>The thesis compares Sanskrit's case analysis with systems in about twenty languages. It argues that the kāraka categories can be used to analyze noun relations in the languages it studies. Languages may mark a relation with an ending, a separate word, or word order; the categories and how they are grammaticalized do not always line up one-to-one.</p>
        <div className="ln-table-wrap"><table className="ln-table ln-world"><thead><tr><th>Language</th><th>How it marks the 8 relations</th><th>Markers</th></tr></thead>
          <tbody>{WORLD.map(([l, h, m]) => <tr key={l}><th>{l}</th><td>{h}</td><td>{m}</td></tr>)}</tbody></table></div>
        <div className="ln-claim">
          <b>The claim, stated precisely.</b> In this analysis, a noun-stem use is treated as one of three things:
          <ol>
            <li>one of its <b>24 forms</b>, carrying one of the 8 relations with its Pāṇinian finer meanings;</li>
            <li>an <b>avyaya</b> made from it (ततः, तत्र, बहुशः, राजवत्…), whose meaning Pāṇini states through those same vibhakti meanings; or</li>
            <li>a <b>new stem</b> (समास, तद्धित, नामधातु) with its own 24.</li>
          </ol>
          This is the framework the thesis uses to compare noun relations across languages.
        </div>
        <p>The table below shows it live. Choose a word and some languages: each row is one relation, and each language fills it in its own way.</p>
        <div className="ln-demo-bar">
          <label>शब्दः <select value={wid} onChange={e => setWid(e.target.value)}>{nouns.map(x => <option key={x.id} value={x.id}>{headForm(x)} · {wordMeaning(x, "en").split(";")[0]}</option>)}</select></label>
          <div className="ks-chips">{VACANA.map((v, i) => <button key={v} className={num === i ? "on" : ""} onClick={() => setNum(i)}>{v}</button>)}</div>
        </div>
        <LangChips langs={langs} toggle={toggle} />
        <div className="ln-table-wrap"><table className="ln-table ln-demo">
          <thead><tr><th>विभक्तिः</th><th>संस्कृतम्</th>{langs.map(l => <th key={l}>{LANGS[l]}</th>)}</tr></thead>
          <tbody>{VIBHAKTI.map((v, i) => {
            const f = w.d[num]?.[i];
            return <tr key={v}><th>{v}<small>{KARAKA[i][1]}</small></th>
              <td className="ln-deva ln-big">{f ? <button className="ln-say" onClick={() => speak((i === 7 ? "हे " : "") + f)}>{i === 7 ? "हे " : ""}{f}</button> : "—"}</td>
              {langs.map(l => <td key={l}>{f ? nounGloss(w, i, num, l) : "—"}</td>)}</tr>;
          })}</tbody></table></div>
      </Card>

      <Card title="विमर्शः · Testing the claim against hard cases" tone="ln-check rv-only">
        <p>A strong claim should be tested against the languages that look most different. These are the patterns that seem to break it, and what they show:</p>
        <ul className="ln-points">
          <li><b>Hungarian and Finnish (15–27 cases).</b> Most of these cases were once separate words, postpositions meaning “inside”, “surface”, “near”, that fused onto the noun. Their nine local cases are exactly <b>three Sanskrit vibhaktis × three positions</b>:
            <div className="ln-table-wrap"><table className="ln-table ln-hu"><thead><tr><th></th><th>at · सप्तमी</th><th>to · द्वितीया (motion)</th><th>from · पञ्चमी</th></tr></thead>
              <tbody>
                <tr><th>inside · अन्तः</th><td><i>házban</i> in the house</td><td><i>házba</i> into the house</td><td><i>házból</i> out of the house</td></tr>
                <tr><th>surface · उपरि</th><td><i>házon</i> on the house</td><td><i>házra</i> onto the house</td><td><i>házról</i> off the house</td></tr>
                <tr><th>near · समीपे</th><td><i>háznál</i> at the house</td><td><i>házhoz</i> to the house</td><td><i>háztól</i> from the house</td></tr>
              </tbody></table></div>
            The rest are the 8 relations (<i>-t</i> द्वितीया, <i>-nak</i> चतुर्थी / षष्ठी, <i>-val</i> तृतीया + सह, <i>-ért</i> चतुर्थी / -अर्थम्, <i>-kor</i> सप्तमी) or avyaya meanings (<i>-ig</i> “until” = आ + पञ्चमी, <i>-vá</i> “becoming” = च्वि / -सात्, <i>-ként</i> “as” = इव / -वत्). The same holds for Finnish comitative “with” and abessive “without” (सह + तृतीया, विना). Sanskrit says with a vibhakti + an avyaya what these languages fuse into one ending. It is the same thing Pāṇini's तसिल् and त्रल् do for a few words (ग्रामतः, तत्र); Hungarian does it for every noun.</li>
          <li><b>Possessive endings (Turkish, Finnish, Arabic).</b> Turkish <i>evim</i>, Arabic <i>baytī</i> = “my house”, one word. Sanskrit uses two words (मम गृहम्), but the relation is the same षष्ठी. The language has <b>packed two words into one</b>; it has not added a relation.</li>
          <li><b>Articles and definiteness (English, Arabic, Bengali, Scandinavian).</b> “the / a”, <i>al-</i>, -টা / -টি, <i>huset</i>. This tells you <i>which</i> thing, not its role. Sanskrit marks it with सः, एषः, कश्चित् when needed. It is a layer on top of the 24, not a 25th place.</li>
          <li><b>Honorific and polite forms (Telugu మీరు, Hindi आप, Japanese, Korean).</b> Respect is a separate scale. Sanskrit uses भवान् (with a 3rd-person verb) for it, and every one of those forms still sits in the same 24 places.</li>
          <li><b>Noun classes and counters (Bantu languages, Chinese 个 / 位, Japanese 人 / つ).</b> These classify the noun (person, flat thing, animal). In Sanskrit that is the work of लिङ्गम् and of number words. Telugu ఇద్దరు / రెండు is the same idea, and the game uses it.</li>
          <li><b>Trial or paucal number (some Pacific languages).</b> A special “three” or “a few” falls inside बहुवचनम्, which means “three or more”.</li>
        </ul>
        <p className="ln-verdict">Result: none of these needs a relation outside the inventory. Some languages fuse a vibhakti and an avyaya into one ending; others add information that is not a relation at all (owner, definiteness, respect, class), which Sanskrit gives with a separate word. Two things must be stated explicitly for the argument to hold: (1) the grid counts <b>relations with their finer meanings</b>, not endings; (2) avyayas and new stems (समास, तद्धित, नामधातु) are part of the system, as in the three-part statement above.</p>
      </Card>
    </div>
  );
};

// ═══════════ 2. धातुरूपाणि ═══════════
const TIN = [["तिप्", "तस्", "झि"], ["सिप्", "थस्", "थ"], ["मिप्", "वस्", "मस्"]];
const TIN_A = [["त", "आताम्", "झ"], ["थास्", "आथाम्", "ध्वम्"], ["इट्", "वहि", "महिङ्"]];
const LAK_INFO: Record<string, [string, string]> = {
  lat: ["वर्तमाने लट् (3.2.123)", "now; also habit and general truth"],
  lan: ["अनद्यतने लङ् (3.2.111)", "past, not today"],
  lit: ["परोक्षे लिट् (3.2.115)", "remote past, not witnessed by the speaker"],
  lun: ["लुङ् (3.2.110)", "past in general (including today)"],
  lut: ["अनद्यतने लुट् (3.3.15)", "future, not today"],
  lrt: ["लृट् शेषे च (3.3.13)", "future in general"],
  lot: ["लोट् च (3.3.162)", "command, request, permission"],
  vidhilin: ["विधिनिमन्त्रण… लिङ् (3.3.161)", "should, may, invitation"],
  asirlin: ["आशिषि लिङ्लोटौ (3.3.173)", "blessing: may it be so"],
  lrn: ["लिङ्निमित्ते लृङ् क्रियातिपत्तौ (3.3.139)", "would have …, if … had (unfulfilled)"],
};
const Dhatu: React.FC = () => {
  const { langs, toggle } = useCompareLangs();
  const [vid, setVid] = useState(VERBS[1].id);
  const [lk, setLk] = useState("lat");
  const v = VERBS.find(x => x.id === vid)!;
  const grid = v.P!;
  return (
    <div className="ln-body">
      <Card title="धातुः + तिङ् · A verb is a root plus one of 18 endings">
        <p>Every verb form is a <b>root</b> (धातुः) plus an <b>ending</b> (तिङ्). Pāṇini lists 18 endings: 9 for परस्मैपदम् and 9 for आत्मनेपदम् (<Sutra t="तिप्तस्झिसिप्थस्थमिब्वस्मस्तातांझथासाथांध्वमिड्वहिमहिङ्" n="3.4.78" />). The endings combine the subject’s grammatical person (<b>puruṣa</b>) with its number (<b>vacana</b>):</p>
        <div className="ln-two">
          <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>परस्मैपदम्</th>{VACANA.map(x => <th key={x}>{x}</th>)}</tr></thead>
            <tbody>{TIN.map((r, i) => <tr key={i}><th>{PURUSHA[i]}</th>{r.map(x => <td key={x} className="ln-deva">{x}</td>)}</tr>)}</tbody></table></div>
          <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>आत्मनेपदम्</th>{VACANA.map(x => <th key={x}>{x}</th>)}</tr></thead>
            <tbody>{TIN_A.map((r, i) => <tr key={i}><th>{PURUSHA[i]}</th>{r.map(x => <td key={x} className="ln-deva">{x}</td>)}</tr>)}</tbody></table></div>
        </div>
        <p>Here, <b>puruṣa</b> names the grammatical relation between a nominal subject (a person, thing, or other entity) and the finite verb. Sanskrit classifies the subject as <b>prathama</b> (the one spoken about), <b>madhyama</b> (the addressee), or <b>uttama</b> (the speaker); <b>vacana</b> marks singular, dual, or plural. Languages express these distinctions in different ways—through verb endings, pronouns, or context—and need not mark all nine combinations. The thesis compares how the languages it studies express person and number; it does not claim that every language has the same 3 × 3 verb paradigm (thesis 4.8.8–9). See the open point below for a further distinction.</p>
      </Card>

      <Card title="दश लकाराः · Ten tenses and moods">
        <p>The same nine endings are set in ten <b>lakāras</b> (Classical Sanskrit; the Veda also has an eleventh, लेट्): six describe <b>time</b> and four describe the speaker's <b>attitude</b> (command, wish, blessing, condition). Modern linguistics calls these tense, aspect and mood (thesis 4.8.6.6–8). Pāṇini fixed each by its meaning:</p>
        <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>लकारः</th><th>Pāṇini</th><th>meaning</th><th>{v.w} · हिन्दी</th><th>{v.w} · తెలుగు</th></tr></thead>
          <tbody>{LAKARA_ORDER.map(l => grid[l] && <tr key={l}><th>{LAKARA[l][0]}</th><td className="ln-deva">{LAK_INFO[l][0]}</td><td>{LAK_INFO[l][1]}</td>
            <td>{verbGloss(v, "P", l, 0, 0, "hi", "")}</td><td>{verbGloss(v, "P", l, 0, 0, "te", "")}</td></tr>)}</tbody></table></div>
        <p>In the Sanskrit paradigm, 3 persons × 3 numbers across 10 lakāras gives <b>90 slots</b> for each pada. The two padas and three voices (प्रयोगाः: कर्तरि active, कर्मणि passive, भावे impersonal) organize further finite forms; individual roots need not use every slot. Hindi उसने पढ़ा has a construction comparable to Sanskrit कर्मणि (मया पठितम्), though the languages’ systems are not identical. Georgian and Basque also show verb agreement with the object in some constructions.</p>
      </Card>

      <Card title="तुलना · Comparing one root across languages" tone="ln-key">
        <div className="ln-demo-bar">
          <label>धातुः <select value={vid} onChange={e => setVid(e.target.value)}>{VERBS.map(x => <option key={x.id} value={x.id}>{x.w} · {verbMeaning(x, "en")}</option>)}</select></label>
          <div className="ks-chips ks-chips-sm">{LAKARA_ORDER.filter(l => grid[l]).map(l => <button key={l} className={lk === l ? "on" : ""} onClick={() => setLk(l)}>{LAKARA[l][0]} <small>{LAKARA[l][1]}</small></button>)}</div>
        </div>
        <LangChips langs={langs} toggle={toggle} />
        <div className="ln-table-wrap"><table className="ln-table ln-demo">
          <thead><tr><th>पुरुषः · वचनम्</th><th>संस्कृतम्</th>{langs.map(l => <th key={l}>{LANGS[l]}</th>)}</tr></thead>
          <tbody>{[0, 1, 2].flatMap(p => [0, 1, 2].map(n => {
            const c = grid[lk]?.[p]?.[n]; if (!c) return null;
            return <tr key={`${p}${n}`}><th>{PURUSHA[p]}<small>{VACANA[n]}</small></th>
              <td className="ln-deva ln-big"><button className="ln-say" onClick={() => speak(c[0])}>{c[0]}</button></td>
              {langs.map(l => <td key={l}>{verbGloss(v, "P", lk, p, n, l, c[2])}</td>)}</tr>;
          }))}</tbody></table></div>
      </Card>

      <Card title="विमर्शः · Testing the claim against hard cases" tone="ln-check rv-only">
        <ul className="ln-points">
          <li><b>Progressive aspect (English “is going”, Telugu వెళ్తున్నాడు).</b> Sanskrit लट् covers both “goes” and “is going”. Where the ongoing sense must be stressed, it uses the participle with अस् (गच्छन् अस्ति). This is a combination of forms, not a missing one.</li>
          <li><b>Evidentiality (Turkish -miş, Quechua, Tibetan): “I didn't see it myself.”</b> Pāṇini defines लिट् by <i>परोक्षे</i> (out of the speaker's sight), an interesting parallel. In classical usage, though, लिट् is mainly a narrative remote past, not a grammatical evidential. Sanskrit expresses hearsay with किल, इति श्रूयते.</li>
          <li><b>Gender and object in the verb (Arabic, Hebrew, Hindi; Georgian, Basque, Swahili).</b> Arabic verbs have 13 forms, not 9, because the 2nd and 3rd persons also mark gender (Hindi जाता / जाती does the same). Georgian and Basque verbs agree with the object too. The 3 × 3 grid holds for <b>meaning</b>; these languages add more information to the <b>form</b>.</li>
          <li><b>Polite and honorific verb forms (Japanese keigo, Korean -시-, Telugu -ండి).</b> These are a separate respect scale. Sanskrit expresses respect with भवान् plus the 3rd person (भवान् गच्छतु). Same grid, different setting.</li>
          <li><b>Languages with no dual (most of them).</b> They use a number word: “you two”, మీరిద్దరు, हम दोनों. The dual place still exists in meaning.</li>
          <li><b>Causative, desiderative, intensive (कारयति, पिपठिषति, …).</b> The suffixes णिच्, सन् and यङ् make a <b>new root</b>, which again has its own 9 × 10 grid. The same is true of nāmadhātus, which are excluded here.</li>
          <li className="ln-open"><b>Open point: clusivity.</b> Telugu మనం “we, including you” and మేము “we, without you” (Tamil நாம் / நாங்கள், also many languages of the Pacific and the Americas) are a real distinction of meaning in the person grid. Sanskrit अस्मद् and the 3 × 3 grid have no separate place for it; Sanskrit can only paraphrase (अहं च त्वं च). This affects pronouns and verbs, not the 24 noun forms.</li>
          <li><b>Non-finite forms (participles, infinitives, gerunds).</b> These are कृदन्त words. They leave the verb grid and become nouns (24 forms) or avyayas (one form). See the धातुकोशः for every root's kṛdantas.</li>
        </ul>
      </Card>
    </div>
  );
};

// ═══════════ 3. अव्ययानि ═══════════
const Avyaya: React.FC = () => {
  const lang = useLang();
  const cats = Object.keys(AVYAYA_CATS);
  return (
    <div className="ln-body">
      <Card title="यन्न व्येति तदव्ययम् · The word that does not change">
        <p className="ln-center ln-verse">सदृशं त्रिषु लिङ्गेषु सर्वासु च विभक्तिषु ।<br />वचनेषु च सर्वेषु यन्न व्येति तदव्ययम् ॥</p>
        <p>“The same in all three genders, all cases and all numbers: what does not change is an avyaya.” Technically an avyaya is also a stem that receives the case endings, but they are dropped (<Sutra t="अव्ययादाप्सुपः" n="2.4.82" />). So an avyaya <b>fills all 24 places with one single form</b>. The grid is still there; it is just invisible.</p>
        <div className="ln-eq"><span className="ln-stem">यदा</span> + <span className="ln-suf">सु / अम् / टा …</span> = <span className="ln-word">यदा</span><small>the ending is added, then removed (लुक्)</small></div>
      </Card>

      <Card title="अव्ययानां प्रकाराः · Where avyayas come from">
        <ul className="ln-points">
          <li><b>स्वरादयः, चादयः (निपाताः):</b> स्वर्, पुनर्, च, वा, अपि, एव, न, इति, यदि … (स्वरादिनिपातमव्ययम् 1.1.37)</li>
          <li><b>प्रादयः (उपसर्गाः):</b> प्र, परा, अप, सम्, अनु … They change a verb's meaning: गच्छति → आगच्छति (“comes”)</li>
          <li><b>कृदन्तानि:</b> गन्तुम् (कृन्मेजन्तः 1.1.39); गत्वा, आगत्य (क्त्वातोसुन्कसुनः 1.1.40), made from verbs</li>
          <li><b>तद्धितान्तानि:</b> ततः, तत्र, तदा, तर्हि, सर्वदा, सर्वथा … made from pronouns and nouns (तद्धितश्चासर्वविभक्तिः 1.1.38)</li>
        </ul>
        <p>In the thesis tree of stems (4.7.2.2.4), the प्रातिपदिकम् has six kinds: कृदन्तम्, तद्धितान्तम्, अव्युत्पन्नम्, अनुकरणम्, संज्ञा and अव्ययम्.</p>
        <div className="ln-tree"><span className="ln-tree-root">प्रातिपदिकम्</span><div className="ln-tree-kids">{["कृदन्तम्", "तद्धितान्तम्", "अव्युत्पन्नम्", "अनुकरणम्", "संज्ञा", "अव्ययम्"].map(k => <span key={k}>{k}</span>)}</div></div>
      </Card>

      <Card title="अव्ययानि · Avyayas across languages" tone="ln-key">
        <p>Meanings expressed by Sanskrit avyayas may be expressed in other languages with prepositions, conjunctions, adverbs, particles, or different constructions: “and, or, not, where, when, again, only”. Such words can link, ask, deny, or locate. Here are the 85 school avyayas by kind, with the meaning in <b>{LANGS[lang]}</b>:</p>
        <div className="ln-avy">
          {cats.map(c => (
            <div key={c} className="ln-avy-cat"><h4>{AVYAYA_CATS[c][0]} <small>{AVYAYA_CATS[c][1]}</small></h4>
              <div>{AVYAYA.filter(a => a.cat === c).map(a => <button key={a.sa} className="ln-avy-w" onClick={() => speak(a.sa)} title={a.en}><b>{a.sa}</b><small>{avyayaMeaning(a, lang)}</small></button>)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
