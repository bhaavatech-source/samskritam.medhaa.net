import React, { useEffect, useState } from "react";
import Learn from "./learn/Learn";
import { WordBook, VerbBook, SentenceBook } from "./kosha/Kosha";
import { GrammarBook } from "./kosha/Grammar";
import { Sambhashanam } from "./speak/Sambhashanam";
import { Play } from "./play/Play";
import { SearchAnything } from "./SearchAnything";
import { FlagDialog } from "./FlagUI";
import { openFlag } from "./flags";

// ── the game's name, in one place ──
export const APP_NAME = { sa: "संस्कृतम्", en: "Saṃskṛtam", tagline: "Learn Saṃskṛtam by playing — words, forms and sentences" };

type View = "learn" | "play" | "speak" | "words" | "verbs" | "sentences" | "grammar" | "search";
type NavItem =
  | { type: "view"; v: View; icon: string; sa: string; en: string }
  | { type: "link"; href: string; icon: string; sa: string; en: string };

const NAV: NavItem[] = [
  { type: "view", v: "learn",     icon: "💡", sa: "बोधः",      en: "Understand" },
  { type: "view", v: "play",      icon: "🎮", sa: "क्रीडाङ्गणम्", en: "Play" },
  { type: "view", v: "speak",     icon: "🗣️", sa: "सम्भाषणम्", en: "Speak" },
  { type: "view", v: "words",     icon: "📖", sa: "शब्दकोशः",  en: "Noun Book" },
  { type: "view", v: "verbs",     icon: "🌱", sa: "धातुकोशः",  en: "Verb book" },
  { type: "view", v: "sentences", icon: "💬", sa: "वाक्यकोशः", en: "Sentences" },
  { type: "view", v: "grammar",   icon: "🔗", sa: "व्याकरणम्",  en: "Grammar" },
  { type: "link", href: "https://medhaa.net/games-static/devanagari-game/index.html", icon: "🪷", sa: "अक्षराभ्यासः", en: "Akṣarābhyāsaḥ" },
  { type: "view", v: "search", icon: "🔎", sa: "अन्वेषणम्", en: "Search Anything" },
];

// faint floating letters behind everything (decorative)
const BG_LETTERS = [
  "जयतु संस्कृतम्, जयतु भारतम्", "भारतस्य प्रतिष्ठे द्वे संस्कृतं संस्कृतिस्तथा",
  "ओमित्येकाक्षरं ब्रह्म व्याहरन्मामनुस्मरन्", "सत्यमेव जयते", "वसुधैव कुटुम्बकम्", "आ नो भद्राः क्रतवो यन्तु विश्वतः",
  "सा विद्या या विमुक्तये", "संगच्छध्वं संवदध्वम्", "न हि ज्ञानेन सदृशं पवित्रम्",
  "विद्यया अमृतमश्नुते", "सर्वे भवन्तु सुखिनः", "मातृदेवो भव", "पितृदेवो भव", "कृण्वन्तो विश्वमार्यम्",
];
const BG_COLORS = ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#eab308"];
const Backdrop: React.FC = () => (
  <>
    <div className="bg-blobs" aria-hidden><i /><i /><i /><i /></div>
    <div className="bg-letters" aria-hidden>
      {BG_LETTERS.map((l, i) => (
        <span key={i} style={{
          left: `${(i * 37 + 7) % 88}%`, top: `${(i * 53 + 11) % 88}%`,
          fontSize: `${Math.max(1, Math.min(2.6, 32 / l.length))}rem`,
          whiteSpace: "nowrap",
          "--c": BG_COLORS[i % BG_COLORS.length], "--d": `${9 + (i % 5) * 2}s`, "--delay": `${-i * 1.3}s`,
        } as React.CSSProperties}>{l}</span>
      ))}
    </div>
  </>
);

const readHash = (): View => {
  const h = location.hash.slice(1).split("/")[0];   // "#speak/2-03" → speak
  // "#game" was the old यात्रा, now part of क्रीडाङ्गणम्
  return (["learn", "play", "speak", "words", "verbs", "sentences", "grammar", "search"] as View[]).includes(h as View) ? (h as View) : "play";
};

const App: React.FC = () => {
  const [view, setViewState] = useState<View>(readHash);
  const [navOpen, setNavOpen] = useState(false);
  const setView = (v: View) => { setViewState(v); setNavOpen(false); try { history.replaceState(null, "", "#" + v); } catch { /* sandboxed */ } window.scrollTo(0, 0); };
  const openFeedback = () => openFlag({ kind: "grammar", id: "general-feedback", field: "feedback", value: "", where: `General feedback — ${view}` });

  // follow links that change the hash (e.g. व्याकरणम् → धातुकोशः · उणादयः)
  useEffect(() => {
    const on = () => { setViewState(readHash()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  useEffect(() => {
    try { (window as unknown as { BhavaSession?: { start: (s: string) => void } }).BhavaSession?.start("samskrita-medhaa"); } catch { /* not embedded */ }
  }, []);

  return (
    <div className="app-root is-learner">
      <Backdrop />
      <header className="app-header">
        <div className="app-header-bar">
          <h1>{APP_NAME.sa}<small>{APP_NAME.en}</small></h1>
          <button
            className="app-menu-toggle"
            type="button"
            aria-expanded={navOpen}
            aria-controls="app-navigation"
            onClick={() => setNavOpen(open => !open)}
          >
            <span aria-hidden="true">{navOpen ? "×" : "☰"}</span>
            {navOpen ? "Close" : "Menu"}
          </button>
        </div>
        <div className="app-header-panel" id="app-navigation" hidden={!navOpen}>
            <p>{APP_NAME.tagline}</p>
            <nav className="view-switch" aria-label="Main navigation">
              {NAV.map(n => (
                n.type === "link"
                  ? <a key={n.href} className="view-btn" href={n.href}><span>{n.icon} {n.sa}</span><small>{n.en}</small></a>
                  : <button key={n.v} className={`view-btn ${view === n.v ? "view-btn-active" : ""}`} onClick={() => setView(n.v)}>
                      <span>{n.icon} {n.sa}</span><small>{n.en}</small>
                    </button>
              ))}
            </nav>
        </div>
      </header>

      {view === "learn" ? <Learn />
        : view === "play" ? <Play key={location.hash} />
        : view === "speak" ? <Sambhashanam />
        : view === "words" ? <WordBook />
        : view === "verbs" ? <VerbBook />
        : view === "sentences" ? <SentenceBook />
        : view === "grammar" ? <GrammarBook />
        : view === "search" ? <SearchAnything onNavigate={setView} />
        : <Play />}

      <footer className="app-footer">
        <button type="button" onClick={openFeedback}>Feedback</button>
      </footer>
      <div className="app-site-footer">
        <div className="app-site-footer-inner">
          <span className="app-credit">A product by Bhāva Tech</span>
          <nav className="app-footer-links" aria-label="Bhāva Tech websites">
            <a href="https://medhaa.net/" target="_blank" rel="noopener noreferrer">Medhaa.net</a>
            <a href="https://naada.medhaa.net/" target="_blank" rel="noopener noreferrer">naada.medhaa.net</a>
          </nav>
        </div>
      </div>
      <FlagDialog />
    </div>
  );
};

export default App;
