// ═══════════════════════════════════════════════════════════════
//  learn/Learn.tsx — बोधः: WHY Sanskrit words have the forms they have
//  शब्दरूपाणि (24 forms), धातुरूपाणि (9 × 10 forms), अव्ययानि (one form),
//  and why the same grid holds every language (from the author's PhD thesis,
//  ch. 4.7 सुबन्तदिशा, 4.8.6 तिङन्तदिशा, tables 4.7.2.2.1 & 4.8.11).
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from "react";
import {
  WORDS, VERBS, AVYAYA, AVYAYA_CATS, COMPOSITION, CURRICULUM, LANGS, MEANING_LANGS, VIBHAKTI, VACANA, PURUSHA, LAKARA, LAKARA_ORDER, LAKARA_INFO,
  headForm, wordMeaning, verbMeaning, avyayaMeaning, type Word,
} from "../data";
import { nounGloss, verbGloss } from "../i18n/forms";
import { useLang } from "../settings";
import { speak } from "../speech";
import { PrakritiPratyaya, Prakriya } from "./Prakriya";
import { AgreementCard, PrathamaCard, AdhyaharaCard } from "./Samanvaya";
import { ShabdaScene, KarakaScene, PotScene, WorldScene, PersonScene, LakaraScene, AvyayaScene } from "./anim";
import { useSa } from "../i18n/script";
import "./learn.css";

type Ch = "shabda" | "dhatu" | "avyaya" | "prakriti" | "prakriya" | "pathya" | "rachana";
const CHAPTERS: [Ch, string, string][] = [
  ["shabda", "शब्दरूपाणि", "Why every noun has 24 forms"],
  ["dhatu", "धातुरूपाणि", "Why every verb has 9 forms in each tense"],
  ["avyaya", "अव्ययानि", "Words that never change"],
  ["prakriti", "प्रकृतिः प्रत्ययश्च", "Root, stem and suffix"],
  ["prakriya", "प्रक्रिया", "How a sentence is taken apart and built"],
  ["pathya", "पाठ्यक्रमः", "School, college and university learning tracks"],
  ["rachana", "रचनम्", "Paragraph, picture and letter composition"],
];

const Learn: React.FC = () => {
  const [ch, setCh] = useState<Ch>("shabda");
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {                                   // cards rise into view as you scroll
    const cards = box.current?.querySelectorAll(".ln-card") ?? [];
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("ln-in"); io.unobserve(e.target); } }), { threshold: 0.08 });
    cards.forEach(c => { c.classList.add("ln-wait"); io.observe(c); });
    return () => io.disconnect();
  }, [ch]);
  return (
    <div className="ln" ref={box}>
      <div className="jy-top">
        <div>
          <h2 className="jy-title">बोधः <span>· How Sanskrit words work</span></h2>
          <p className="jy-sub">Why the forms are arranged the way they are, and why the same arrangement fits every language.</p>
        </div>
      </div>
      <div className="ln-chapters">
        {CHAPTERS.map(([k, sa, en]) => (
          <button key={k} className={ch === k ? "on" : ""} onClick={() => setCh(k)}><b>{sa}</b><small>{en}</small></button>
        ))}
      </div>
      <div key={ch} className="ln-chapter-in">{ch === "shabda" ? <Shabda /> : ch === "dhatu" ? <Dhatu /> : ch === "avyaya" ? <Avyaya /> : ch === "prakriti" ? <PrakritiPratyaya /> : ch === "pathya" ? <Curriculum /> : ch === "rachana" ? <Composition /> : <Prakriya />}</div>
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

type TrackKey = "school" | "college" | "university";
const CURRICULUM_TRACKS: [TrackKey, string, string][] = [
  ["school", "बालपाठ्यक्रमः", "Classes 6–12 · School"],
  ["college", "माध्यमिक-स्नातकस्तरः", "College / Undergraduate"],
  ["university", "विद्वत्पाठ्यक्रमः", "University / Research"],
];

const Curriculum: React.FC = () => {
  const S = useSa();
  const lang = useLang();
  const [track, setTrack] = useState<TrackKey>("school");
  const [moduleId, setModuleId] = useState(CURRICULUM.school.modules[0].id);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const data = CURRICULUM[track];
  const module = data.modules.find(m => m.id === moduleId) ?? data.modules[0];
  const challenge = module.challenges[challengeIndex] ?? null;
  const answeredSet = new Set(answered);
  const explanation = lang === "hi" ? challenge?.explanation_hi
    : lang === "te" ? challenge?.explanation_te
    : challenge?.explanation_en;

  const chooseTrack = (next: TrackKey) => {
    setTrack(next);
    setModuleId(CURRICULUM[next].modules[0].id);
    setChallengeIndex(0);
    setAnswer(null);
  };
  const chooseModule = (id: string) => {
    setModuleId(id);
    setChallengeIndex(0);
    setAnswer(null);
  };
  const chooseAnswer = (option: string) => {
    if (!challenge || answer !== null) return;
    setAnswer(option);
    if (!answeredSet.has(challenge.id)) {
      setAnswered(cur => [...cur, challenge.id]);
      if (option === challenge.answer) setScore(cur => cur + challenge.points);
    }
  };
  const nextChallenge = () => {
    setChallengeIndex(i => (i + 1) % module.challenges.length);
    setAnswer(null);
  };

  return (
    <div className="ln-body ln-curriculum">
      <Card title="पाठ्यक्रमाः · Learner tracks" tone="ln-key">
        <p><span className="ln-l-en">Choose your learning level. Each track has theory, examples and multiple-choice practice.</span></p>
        <div className="ln-pathya-tracks" role="group" aria-label="Curriculum level">
          {CURRICULUM_TRACKS.map(([key, sa, en]) => (
            <button key={key} className={track === key ? "on" : ""} onClick={() => chooseTrack(key)}>
              <b>{S(sa)}</b><span>{en}</span>
            </button>
          ))}
        </div>
        <div className="ln-pathya-summary">
          <div><strong>{data.modules.length}</strong><span>घटकाः · Modules</span></div>
          <div><strong>{data.modules.reduce((n, m) => n + m.challenges.length, 0)}</strong><span>प्रश्नाः · Questions</span></div>
          <div><strong>{answeredSet.size}</strong><span>Attempted</span></div>
          <div><strong>{score}</strong><span>Points</span></div>
        </div>
      </Card>

      <Card title={`${S(data.title)} · Course overview`}>
        <p className="ln-pathya-audience"><b>{S(data.audience)}</b></p>
        <p>{data.description}</p>
      </Card>

      <Card title="घटकाः · Course modules">
        <div className="ln-pathya-modules">
          {data.modules.map((m, i) => (
            <button key={m.id} className={module.id === m.id ? "on" : ""} onClick={() => chooseModule(m.id)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div><b>{S(m.name_sa)}</b><small>{m.name_en}</small></div>
            </button>
          ))}
        </div>
      </Card>

      <Card title={`${module.name_sa} · ${module.name_en}`}>
        <p>{module.description}</p>
        {module.theory.length > 0 && (
          <details className="ln-demo-details ln-forms-details">
            <summary><span>सिद्धान्तः · Theory and examples</span><small>{module.theory.length} points</small></summary>
            <div className="ln-demo-content">
              <ul className="ln-pathya-theory">
                {module.theory.map((item, i) => <li key={i}>{S(item)}</li>)}
              </ul>
            </div>
          </details>
        )}
      </Card>

      {challenge && (
        <Card title="अभ्यासः · Practice challenge" tone="ln-key">
          <div className="ln-pathya-quiz">
            <div className="ln-pathya-qmeta"><span>{challenge.topic}</span><small>{challengeIndex + 1} / {module.challenges.length} · {challenge.points} points</small></div>
            <h4 className="ln-sa">{S(challenge.prompt_sa)}</h4>
            {challenge.prompt_en && <p className="ln-pathya-prompt-en">{challenge.prompt_en}</p>}
            <div className="ln-pathya-options">
              {challenge.options.map(option => {
                const chosen = answer === option;
                const correct = answer !== null && option === challenge.answer;
                const wrong = chosen && option !== challenge.answer;
                return (
                  <button key={option} className={correct ? "correct" : wrong ? "wrong" : ""} disabled={answer !== null} onClick={() => chooseAnswer(option)}>
                    {S(option)}
                  </button>
                );
              })}
            </div>
            {answer !== null && (
              <div className={`ln-pathya-result ${answer === challenge.answer ? "ok" : "no"}`} aria-live="polite">
                <b>{answer === challenge.answer ? "साधु! · Correct" : "पुनः विचारयतु · Try again"}</b>
                {challenge.explanation_sa && <p className="ln-sa">{S(challenge.explanation_sa)}</p>}
                {explanation && <p>{explanation}</p>}
                <button className="ln-pathya-next" onClick={nextChallenge}>अग्रिमप्रश्नम् · Next</button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

type CompositionKind = "paragraph" | "picture" | "letter";
const COMPOSITION_KINDS: [CompositionKind, string, string][] = [
  ["paragraph", "अनुच्छेद-निबन्धः", "Paragraph / essay"],
  ["picture", "चित्रवर्णनम्", "Picture composition"],
  ["letter", "पत्रलेखनम्", "Letter writing"],
];

const Composition: React.FC = () => {
  const S = useSa();
  const lang = useLang();
  const [kind, setKind] = useState<CompositionKind>("paragraph");
  const [questId, setQuestId] = useState(COMPOSITION.paragraph.quests[0].id);
  const [answer, setAnswer] = useState<string | null>(null);
  const data = COMPOSITION[kind];
  const quest = data.quests.find(q => q.id === questId) ?? data.quests[0];
  const challenge = quest.challenge;
  const explanation = lang === "hi" ? challenge.explanation_hi
    : lang === "te" ? challenge.explanation_te
    : challenge.explanation_en;

  const chooseKind = (next: CompositionKind) => {
    setKind(next);
    setQuestId(COMPOSITION[next].quests[0].id);
    setAnswer(null);
  };

  const modelText = typeof quest.model === "string"
    ? quest.model
    : Array.isArray(quest.model)
      ? quest.model.map(String).join("\n")
      : "";

  return (
    <div className="ln-body ln-composition">
      <Card title="रचनम् · Sanskrit composition" tone="ln-key">
        <p>{data.description}</p>
        <div className="ln-composition-kinds" role="group" aria-label="Composition type">
          {COMPOSITION_KINDS.map(([key, sa, en]) => (
            <button key={key} className={kind === key ? "on" : ""} onClick={() => chooseKind(key)}>
              <b>{S(sa)}</b><span>{en}</span>
            </button>
          ))}
        </div>
        <p className="ln-composition-count"><strong>{data.total}</strong> रचनप्रश्नाः · quests</p>
      </Card>

      <Card title="प्रश्नाः · Choose a quest">
        <div className="ln-composition-list">
          {data.quests.map((item, i) => (
            <button key={item.id} className={quest.id === item.id ? "on" : ""} onClick={() => { setQuestId(item.id); setAnswer(null); }}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div><b>{S(item.title_sa)}</b><small>{item.title_en}</small><em>{S(item.level)}</em></div>
            </button>
          ))}
        </div>
      </Card>

      <Card title={`${S(quest.title_sa)} · ${quest.title_en}`}>
        {quest.level && <p className="ln-composition-level">{S(quest.level)}</p>}
        {quest.context && <p>{quest.context}</p>}

        {Object.keys(quest.framework).length > 0 && (
          <details className="ln-demo-details">
            <summary><span>रचनाविन्यासः · Structure</span><small>{Object.keys(quest.framework).length} steps</small></summary>
            <div className="ln-demo-content">
              <ol className="ln-composition-framework">
                {Object.values(quest.framework).map((step, i) => <li key={i}>{S(step)}</li>)}
              </ol>
            </div>
          </details>
        )}

        {quest.subhashita?.verse && (
          <details className="ln-demo-details">
            <summary><span>सूक्ति-सङ्ग्रहः · Subhāṣita</span><small>{lang === "hi" ? "हिन्दी अर्थ" : lang === "te" ? "తెలుగు अर्थ" : "English meaning"}</small></summary>
            <div className="ln-demo-content">
              <p className="ln-composition-verse ln-sa">{S(quest.subhashita.verse)}</p>
              <p>{quest.subhashita[`meaning_${lang}`] || quest.subhashita.meaning_en}</p>
            </div>
          </details>
        )}

        {quest.templates.length > 0 && (
          <details className="ln-demo-details">
            <summary><span>पूरण-वाक्यानि · Fill-in scaffolds</span><small>{quest.templates.length} templates</small></summary>
            <div className="ln-demo-content">
              <ol className="ln-composition-framework">
                {quest.templates.map((template, i) => <li key={i}>{S(String(template))}</li>)}
              </ol>
            </div>
          </details>
        )}

        {quest.manjusha.length > 0 && (
          <details className="ln-demo-details">
            <summary><span>मञ्जूषा · Helpful words</span><small>{quest.manjusha.length} words</small></summary>
            <div className="ln-composition-manjusha">
              {quest.manjusha.map((item, i) => {
                if (typeof item === "string") return <span key={i}>{S(item)}</span>;
                const word = item as { word_sa?: string; gloss_en?: string };
                return <span key={i}><b>{S(word.word_sa || "")}</b><small>{word.gloss_en || ""}</small></span>;
              })}
            </div>
          </details>
        )}

        {quest.cloze.length > 0 && (
          <details className="ln-demo-details">
            <summary><span>रिक्तपूर्तिः · Cloze letter</span><small>{quest.cloze.length} lines</small></summary>
            <div className="ln-demo-content ln-composition-cloze">
              {quest.cloze.map((line, i) => <p key={i}>{S(line)}</p>)}
            </div>
          </details>
        )}

        {modelText && (
          <details className="ln-demo-details">
            <summary><span>आदर्शरचनम् · Model answer</span><small>Read after attempting</small></summary>
            <div className="ln-demo-content ln-composition-model">{modelText.split("\n").map((line, i) => <p key={i}>{S(line)}</p>)}</div>
          </details>
        )}
      </Card>

      <Card title="व्याकरणाभ्यासः · Grammar challenge" tone="ln-key">
        <div className="ln-composition-quiz">
          <h4 className="ln-sa">{S(challenge.question_sa)}</h4>
          {challenge.question_en && <p>{challenge.question_en}</p>}
          <div className="ln-pathya-options">
            {challenge.options.map(option => {
              const chosen = answer === option;
              const correct = answer !== null && option === challenge.answer;
              const wrong = chosen && option !== challenge.answer;
              return <button key={option} className={correct ? "correct" : wrong ? "wrong" : ""} disabled={answer !== null} onClick={() => setAnswer(option)}>{S(option)}</button>;
            })}
          </div>
          {answer !== null && (
            <div className={`ln-pathya-result ${answer === challenge.answer ? "ok" : "no"}`}>
              <b>{answer === challenge.answer ? "साधु! · Correct" : "पुनः विचारयतु · Try again"}</b>
              <p>{explanation}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ═══════════ 1. शब्दरूपाणि ═══════════
const KARAKA: [string, string, string, string, string][] = [
  ["प्रथमा", "कर्ता", "स्वतन्त्रः कर्ता", "1.4.54", "who does it? (प्रथमा when the verb names the doer: अभिहिते कर्तरि प्रथमा)"],
  ["द्वितीया", "कर्म", "कर्तुरीप्सिततमं कर्म", "1.4.49", "what / whom is it done to? (द्वितीया when the verb does not name it: अनभिहिते कर्मणि द्वितीया)"],
  ["तृतीया", "करणम्", "साधकतमं करणम्", "1.4.42", "with what / by whom?"],
  ["चतुर्थी", "सम्प्रदानम्", "कर्मणा यमभिप्रैति स सम्प्रदानम्", "1.4.32", "for whom / to whom?"],
  ["पञ्चमी", "अपादानम्", "ध्रुवमपायेऽपादानम्", "1.4.24", "from where / from whom?"],
  ["षष्ठी", "सम्बन्धः", "षष्ठी शेषे", "2.3.50", "whose? (a relation between two nouns)"],
  ["सप्तमी", "अधिकरणम्", "आधारोऽधिकरणम्", "1.4.45", "where / in what?"],
  ["सम्बोधनम्", "सम्बोधनम्", "सम्बोधने च", "2.3.47", "calling someone: O …!"],
];
const CASE_RULE: Record<string, string> = {
  "प्रथमा": "अभिहितकर्तादिः",
  "द्वितीया": "अनभिहितं कर्म",
  "तृतीया": "अभिहितः कर्ता अथवा करणम्",
};
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
  ["चतुर्थी", "the one pleased", "हरये रोचते भक्तिः", "रुच्यर्थानां प्रीयमाणः 1.4.33 → चतुर्थी सम्प्रदाने 2.3.13"],
  ["चतुर्थी", "purpose", "मुक्तये हरिं भजति", "तादर्थ्ये चतुर्थी (वार्त्तिकम्)"],
  ["चतुर्थी", "with नमः, स्वस्ति, स्वाहा, अलम् …", "गणेशाय नमः", "नमःस्वस्तिस्वाहा… 2.3.16"],
  ["पञ्चमी", "source, separation (अपादान)", "वृक्षात् पत्रं पतति", "अपादाने पञ्चमी 2.3.28"],
  ["पञ्चमी", "what one fears or is protected from", "चोरात् बिभेति", "भीत्रार्थानां भयहेतुः 1.4.25 → अपादाने पञ्चमी 2.3.28"],
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
  ["सप्तमी", "topic: about, in the matter of", "मोक्षे इच्छा अस्ति", "सप्तम्यधिकरणे च 2.3.36 (वैषयिक आधार, 1.4.45)"],
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
  ["English, French, Spanish", "word order + prepositions", "to, by / with, for, from, of, in"],
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
        <ShabdaScene />
        <div className="ln-eq"><span className="ln-stem">राम</span> + <span className="ln-suf">टा</span> = <span className="ln-word">रामेण</span><small>stem + 3rd-case singular ending = “by Rāma”</small></div>
        <details className="ln-demo-details ln-forms-details">
          <summary><span>शब्दरूपसारणी · 24 noun forms</span><small>विभक्तिः × वचनम् · One, two and many</small></summary>
          <div className="ln-demo-content">
            <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>विभक्तिः</th>{VACANA.map(v => <th key={v}>{v}</th>)}</tr></thead>
              <tbody>{SUP.map((r, i) => <tr key={i}><th>{VIBHAKTI[i]}</th>{r.map((x, j) => <td key={j} className="ln-deva">{x}</td>)}</tr>)}
                <tr><th>सम्बोधनम्</th><td colSpan={3} className="ln-note-cell">uses the प्रथमा endings (<Sutra t="सम्बोधने च" n="2.3.47" />), so 7 × 3 + 3 = <b>24 forms</b></td></tr></tbody></table></div>
          </div>
        </details>
        <p>Three numbers (वचनानि: one, two, many) × eight relations (विभक्तयः) = <b>24</b>. Every declinable word has these 24 places, whatever its gender or stem. Some words fill only part of them: दाराः, आपः, प्राणाः occur only in the plural, द्वि only in the dual, and pronouns have no सम्बोधनम्. Traditional teaching memorises शब्दरूपाणि early because the whole grid comes with every new word.</p>
      </Card>

      <Card title="कारकाणि · The eight relations a noun can have">
        <p>The eight cases are not arbitrary endings. Each one names a <b>role in an action</b> (कारकम्, “that which makes the action happen”), plus one relation between nouns and one form for calling:</p>
        <p className="ln-center ln-verse">कर्ता कर्म च करणं सम्प्रदानं तथैव च ।<br />अपादानाधिकरणमित्याहुः कारकाणि षट् ॥</p>
        <KarakaScene />
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
        <p>The sūtras on the cards define the roles (कारकसंज्ञा, 1.4.23–55). The case endings are given in 2.3, and only to a role the verb does not already name (<Sutra t="अनभिहिते" n="2.3.1" />): <Sutra t="कर्मणि द्वितीया" n="2.3.2" />, <Sutra t="कर्तृकरणयोस्तृतीया" n="2.3.18" />, <Sutra t="चतुर्थी सम्प्रदाने" n="2.3.13" />, <Sutra t="अपादाने पञ्चमी" n="2.3.28" />, <Sutra t="सप्तम्यधिकरणे च" n="2.3.36" />. The role the verb ending names is in प्रथमा (<Sutra t="प्रातिपदिकार्थलिङ्गपरिमाणवचनमात्रे प्रथमा" n="2.3.46" />): in रामः ग्रन्थं पठति the doer, in रामेण ग्रन्थः पठ्यते the object. This is the rule of thumb अभिहिते कर्तरि (कर्मणि) प्रथमा.</p>
        <p><b>विवक्षातः कारकाणि भवन्ति</b>: which role a thing plays depends on what the speaker wants to say. The same pot can be the place (स्थाल्यां पचति, “cooks in the pot”), the instrument (स्थाल्या पचति, “cooks with the pot”) or even the doer (स्थाली पचति, “the pot cooks”). Whatever the intention, the relation always lands in one of these eight.</p>
        <PotScene />
      </Card>

      <PrathamaCard />
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

      <Card title="सर्वासु भाषासु · The same 24 places in every language" tone="ln-key">
        <p>Languages differ in <b>how</b> they mark a relation—through an ending, a separate word, or word order. They do not fundamentally differ in <b>which</b> relations they express.</p>
        <div className="ln-table-wrap"><table className="ln-table ln-world"><thead><tr><th>Language</th><th>How it marks the 8 relations</th><th>Markers</th></tr></thead>
          <tbody>{WORLD.map(([l, h, m]) => <tr key={l}><th>{l}</th><td>{h}</td><td>{m}</td></tr>)}</tbody></table></div>
        <WorldScene />
        <details className="ln-demo-details">
          <summary><span>रूपसारणी · रूपाणि द्रष्टुम्</span><small>शब्दं वचनं भाषां च चिनुत · Choose word, number and language</small></summary>
          <div className="ln-demo-content">
            <div className="ln-demo-bar">
              <label>शब्दः <select value={wid} onChange={e => setWid(e.target.value)}>{nouns.map(x => <option key={x.id} value={x.id}>{headForm(x)} · {wordMeaning(x, "en").split(";")[0]}</option>)}</select></label>
              <div className="ks-chips">{VACANA.map((v, i) => <button key={v} className={num === i ? "on" : ""} onClick={() => setNum(i)}>{v}</button>)}</div>
            </div>
            <LangChips langs={langs} toggle={toggle} />
            <div className="ln-role-key" aria-label="Key Pāṇinian case rules">
              {VIBHAKTI.slice(0, 3).map(v => CASE_RULE[v] && (
                <div key={v}><b>{v}</b><span>{CASE_RULE[v]}</span></div>
              ))}
            </div>
            <div className="ln-table-wrap"><table className="ln-table ln-demo">
              <thead><tr><th>विभक्तिः</th><th>संस्कृतम्</th>{langs.map(l => <th key={l}>{LANGS[l]}</th>)}</tr></thead>
              <tbody>{VIBHAKTI.map((v, i) => {
                const f = w.d[num]?.[i];
                return <tr key={v}><th>{v}<small>{KARAKA[i][1]}</small>{CASE_RULE[v] && <small className="ln-role-rule">{CASE_RULE[v]}</small>}</th>
                  <td className="ln-deva ln-big">{f ? <button className="ln-say" onClick={() => speak((i === 7 ? "हे " : "") + f)}>{i === 7 ? "हे " : ""}{f}</button> : "—"}</td>
                  {langs.map(l => <td key={l}>{f ? nounGloss(w, i, num, l) : "—"}</td>)}</tr>;
              })}</tbody></table></div>
          </div>
        </details>
      </Card>

    </div>
  );
};

// ═══════════ 2. धातुरूपाणि ═══════════
const TIN = [["तिप्", "तस्", "झि"], ["सिप्", "थस्", "थ"], ["मिप्", "वस्", "मस्"]];
const TIN_A = [["त", "आताम्", "झ"], ["थास्", "आथाम्", "ध्वम्"], ["इट्", "वहि", "महिङ्"]];
const LAK_INFO: Record<string, [string, string]> = Object.fromEntries(Object.entries(LAKARA_INFO).map(([k, x]) => [k, [x.sutra, `${x.en} — ${x.term}`]]));
const Dhatu: React.FC = () => {
  const { langs, toggle } = useCompareLangs();
  const [vid, setVid] = useState(VERBS[1].id);
  const [lk, setLk] = useState("lat");
  const v = VERBS.find(x => x.id === vid)!;
  const grid = v.P!;
  return (
    <div className="ln-body">
      <Card title="धातुः + तिङ् · A verb is a root plus one of 18 endings">
        <p>Every verb form is a <b>root</b> (धातुः) plus an <b>ending</b> (तिङ्). Pāṇini lists 18 endings: 9 for परस्मैपदम् and 9 for आत्मनेपदम् (<Sutra t="तिप्तस्झिसिप्थस्थमिब्वस्मस्तातांझथासाथांध्वमिड्वहिमहिङ्" n="3.4.78" />). The nine are the meeting of <b>who acts</b> (पुरुषः) and <b>how many</b> (वचनम्):</p>
        <PersonScene />
        <div className="ln-two">
          <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>परस्मैपदम्</th>{VACANA.map(x => <th key={x}>{x}</th>)}</tr></thead>
            <tbody>{TIN.map((r, i) => <tr key={i}><th>{PURUSHA[i]}</th>{r.map(x => <td key={x} className="ln-deva">{x}</td>)}</tr>)}</tbody></table></div>
          <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>आत्मनेपदम्</th>{VACANA.map(x => <th key={x}>{x}</th>)}</tr></thead>
            <tbody>{TIN_A.map((r, i) => <tr key={i}><th>{PURUSHA[i]}</th>{r.map(x => <td key={x} className="ln-deva">{x}</td>)}</tr>)}</tbody></table></div>
        </div>
        <p>Every language distinguishes the speaker, the listener and others. Most languages also mark number. The 3 × 3 pattern of person and number is therefore found everywhere, even where the verb itself does not change.</p>
      </Card>

      <AgreementCard />
      <Card title="दश लकाराः · Ten tenses and moods">
        <p>The same nine endings appear in ten <b>lakāras</b>: six describe <b>time</b>, while four express a speaker's attitude—command, wish, blessing or condition.</p>
        <LakaraScene />
        <div className="ln-table-wrap"><table className="ln-table"><thead><tr><th>लकारः</th><th>Pāṇini</th><th>meaning</th><th>{v.w} · हिन्दी</th><th>{v.w} · తెలుగు</th></tr></thead>
          <tbody>{LAKARA_ORDER.map(l => grid[l] && <tr key={l}><th>{LAKARA[l][0]}</th><td className="ln-deva">{LAK_INFO[l][0]}</td><td>{LAK_INFO[l][1]}</td>
            <td>{verbGloss(v, "P", l, 0, 0, "hi", "")}</td><td>{verbGloss(v, "P", l, 0, 0, "te", "")}</td></tr>)}</tbody></table></div>
        <p>3 persons × 3 numbers × 10 lakāras = <b>90 forms</b> for each pada. Add the two padas and the three voices (प्रयोगाः: कर्तरि active, कर्मणि passive, भावे impersonal), and you have <b>every finite use of the root</b>. Hindi उसने पढ़ा continues the Sanskrit कर्मणि pattern (मया पठितम्) historically. Georgian and Basque are unrelated languages that show the same pattern independently: the doer takes a special case and the verb agrees with the object.</p>
      </Card>

      <AdhyaharaCard />
      <Card title="सर्वासु भाषासु · One root, every language" tone="ln-key">
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
        <AvyayaScene />
      </Card>

      <Card title="अव्ययानां प्रकाराः · Where avyayas come from">
        <ul className="ln-points">
          <li><b>स्वरादयः, चादयः (निपाताः):</b> स्वर्, पुनर्, च, वा, अपि, एव, न, इति, यदि … (स्वरादिनिपातमव्ययम् 1.1.37)</li>
          <li><b>प्रादयः (उपसर्गाः):</b> प्र, परा, अप, सम्, अनु … They change a verb's meaning: गच्छति → आगच्छति (“comes”)</li>
          <li><b>कृदन्तानि:</b> गन्तुम् (कृन्मेजन्तः 1.1.39); गत्वा, आगत्य (क्त्वातोसुन्कसुनः 1.1.40), made from verbs</li>
          <li><b>तद्धितान्तानि:</b> ततः, तत्र, तदा, तर्हि, सर्वदा, सर्वथा … made from pronouns and nouns (तद्धितश्चासर्वविभक्तिः 1.1.38)</li>
        </ul>
        <p>In Sanskrit, a stem is understood in six useful kinds: कृदन्तम्, तद्धितान्तम्, अव्युत्पन्नम्, अनुकरणम्, संज्ञा and अव्ययम्.</p>
        <div className="ln-tree"><span className="ln-tree-root">प्रातिपदिकम्</span><div className="ln-tree-kids">{["कृदन्तम्", "तद्धितान्तम्", "अव्युत्पन्नम्", "अनुकरणम्", "संज्ञा", "अव्ययम्"].map(k => <span key={k}>{k}</span>)}</div></div>
      </Card>

      <Card title="सर्वासु भाषासु · Every language has them" tone="ln-key">
        <p>What Sanskrit says with an avyaya, other languages say with prepositions, conjunctions, adverbs and particles: “and, or, not, where, when, again, only”. Every language needs words that link, ask, deny and place. Here are the 85 school avyayas by kind, with the meaning in <b>{LANGS[lang]}</b>:</p>
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
