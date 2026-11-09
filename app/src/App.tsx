import React, { useEffect, useState } from "react";
import Journey from "./game/Journey";
import Learn from "./learn/Learn";
import { WordBook, VerbBook, SentenceBook, FlagsPage } from "./kosha/Kosha";
import { GrammarBook } from "./kosha/Grammar";
import { FlagDialog } from "./FlagUI";
import { OK, useFlags } from "./flags";
import { setReviewer, useReviewer } from "./settings";

// ── the game's name, in one place ──
export const APP_NAME = { sa: "संस्कृतम्", en: "Saṃskṛtam", tagline: "Learn Saṃskṛtam by playing — words, forms and sentences" };

type View = "game" | "learn" | "words" | "verbs" | "sentences" | "grammar" | "flags";

const NAV: { v: View; icon: string; sa: string; en: string }[] = [
  { v: "game",      icon: "🗺️", sa: "यात्रा",    en: "Journey" },
  { v: "learn",     icon: "💡", sa: "बोधः",      en: "Understand" },
  { v: "words",     icon: "📖", sa: "शब्दकोशः",  en: "Word book" },
  { v: "verbs",     icon: "🌱", sa: "धातुकोशः",  en: "Verb book" },
  { v: "sentences", icon: "💬", sa: "वाक्यकोशः", en: "Sentences" },
  { v: "grammar",   icon: "🔗", sa: "व्याकरणम्",  en: "Sandhi · Samāsa" },
];

// faint floating letters behind everything (decorative)
const BG_LETTERS = ["राम", "गम्", "वनम्", "पठ्", "जलम्", "अस्ति", "कुत्र", "बालः", "फलम्", "लता", "सः", "अहम्", "नदी", "गुरुः", "भू", "च"];
const BG_COLORS = ["#f97316", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#eab308"];
const Backdrop: React.FC = () => (
  <>
    <div className="bg-blobs" aria-hidden><i /><i /><i /><i /></div>
    <div className="bg-letters" aria-hidden>
      {BG_LETTERS.map((l, i) => (
        <span key={i} style={{
          left: `${(i * 37 + 7) % 88}%`, top: `${(i * 53 + 11) % 88}%`,
          fontSize: `${2.6 + ((i * 7) % 5) * 0.6}rem`,
          "--c": BG_COLORS[i % BG_COLORS.length], "--d": `${9 + (i % 5) * 2}s`, "--delay": `${-i * 1.3}s`,
        } as React.CSSProperties}>{l}</span>
      ))}
    </div>
  </>
);

const readHash = (): View => {
  const h = location.hash.slice(1);
  return (["game", "learn", "words", "verbs", "sentences", "grammar", "flags"] as View[]).includes(h as View) ? (h as View) : "game";
};

const App: React.FC = () => {
  const [view, setViewState] = useState<View>(readHash);
  const [navOpen, setNavOpen] = useState(false);
  const { flags } = useFlags();
  const reviewer = useReviewer();
  const setView = (v: View) => { setViewState(v); setNavOpen(false); try { history.replaceState(null, "", "#" + v); } catch { /* sandboxed */ } window.scrollTo(0, 0); };

  useEffect(() => {
    try { (window as unknown as { BhavaSession?: { start: (s: string) => void } }).BhavaSession?.start("samskrita-medhaa"); } catch { /* not embedded */ }
  }, []);

  return (
    <div className={`app-root ${reviewer ? "is-reviewer" : "is-learner"}`}>
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
                <button key={n.v} className={`view-btn ${view === n.v ? "view-btn-active" : ""}`} onClick={() => setView(n.v)}>
                  <span>{n.icon} {n.sa}</span><small>{n.en}</small>
                </button>
              ))}
            </nav>
        </div>
      </header>

      {view === "game" ? <Journey />
        : view === "learn" ? <Learn />
        : view === "words" ? <WordBook />
        : view === "verbs" ? <VerbBook />
        : view === "sentences" ? <SentenceBook />
        : view === "grammar" ? <GrammarBook />
        : reviewer ? <FlagsPage /> : <Journey />}

      <footer className="app-footer">
        <span>🧑‍🏫 शिक्षकेभ्यः · For teachers &amp; reviewers:</span>
        <label className="rv-toggle"><input type="checkbox" checked={reviewer} onChange={e => { setReviewer(e.target.checked); if (!e.target.checked && view === "flags") setView("game"); }} /> समीक्षकः · Reviewer mode</label>
        {reviewer && <button onClick={() => setView("flags")}>⚑ दोषसूचनाः · Review list ({flags.filter(f => f.issue !== OK).length} ⚑ · {flags.filter(f => f.issue === OK).length} ✓)</button>}
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
