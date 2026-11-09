// FlagUI.tsx — the ⚑ button, the report dialog and the meaning-language picker
import React, { useEffect, useRef, useState } from "react";
import { addFlag, flagKey, ISSUES, OK, openFlag, registerFlagDialog, removeFlag, useFlags, type FlagTarget } from "./flags";
import { LANGS, MEANING_LANGS } from "./data";
import { setLang, useLang } from "./settings";
import { SCRIPTS, setScript, useScriptSetting, type Script } from "./i18n/script";

export const FlagButton: React.FC<{ t: FlagTarget; label?: string }> = ({ t, label }) => {
  const { flags } = useFlags();
  const on = flags.some(f => f.issue !== OK && flagKey(f) === flagKey(t));
  return (
    <button type="button" className={`fl-btn ${on ? "fl-on" : ""} ${label ? "fl-wide" : ""}`}
      title={on ? "Already flagged — flag again" : "Report a mistake here"} aria-label={`Report a mistake: ${t.where}`}
      onClick={e => { e.stopPropagation(); openFlag(t); }}>
      ⚑{label && <span> {label}</span>}
    </button>
  );
};

/** ✓ — the reviewer confirms this form / meaning is correct (tap again to undo) */
export const OkButton: React.FC<{ t: FlagTarget }> = ({ t }) => {
  const { flags } = useFlags();
  const mine = flags.find(f => f.issue === OK && flagKey(f) === flagKey(t));
  return (
    <button type="button" className={`ok-btn ${mine ? "ok-on" : ""}`} title={mine ? "Marked correct — tap to undo" : "Mark as correct"}
      aria-label={`Mark correct: ${t.where}`} aria-pressed={!!mine}
      onClick={e => { e.stopPropagation(); if (mine) removeFlag(mine); else addFlag({ ...t, issue: OK, fix: "", note: "" }); }}>✓</button>
  );
};
/** ✓ and ⚑ side by side */
export const Review: React.FC<{ t: FlagTarget }> = ({ t }) => <span className="rv-pair"><OkButton t={t} /><FlagButton t={t} /></span>;

export const FlagDialog: React.FC = () => {
  const [t, setT] = useState<FlagTarget | null>(null);
  const [issue, setIssue] = useState("wrong-form");
  const [fix, setFix] = useState("");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const first = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    registerFlagDialog(target => {
      setT(target); setFix(""); setNote("");
      setIssue(/meaning|^en$|gloss/.test(target.field) ? "wrong-meaning" : target.kind === "sentence" ? "spelling" : "wrong-form");
      setTimeout(() => first.current?.focus(), 30);
    });
    return () => registerFlagDialog(null);
  }, []);
  useEffect(() => {
    if (!t) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setT(null); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [t]);

  const save = async () => {
    if (!t) return;
    const where = await addFlag({ ...t, issue, fix: fix.trim(), note: note.trim() });
    setT(null);
    setToast(where === "online" ? "⚑ Saved — Claude can see it" : "⚑ Saved in this browser");
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <>
      {t && (
        <div className="fl-bg" onClick={() => setT(null)}>
          <div className="fl-box" role="dialog" aria-modal="true" aria-labelledby="fl-title" onClick={e => e.stopPropagation()}>
            <h3 id="fl-title">⚑ दोषसूचना · Report a mistake</h3>
            <p className="fl-where">{t.where}</p>
            {t.value && <p className="fl-value">{t.value}</p>}
            <label>What is wrong?
              <select ref={first} value={issue} onChange={e => setIssue(e.target.value)}>
                {ISSUES.filter(([k]) => k !== OK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Correct form or meaning <small>(optional)</small>
              <input value={fix} onChange={e => setFix(e.target.value)} placeholder="e.g. रामेण" />
            </label>
            <label>Note <small>(optional)</small>
              <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} />
            </label>
            <div className="fl-btns">
              <button onClick={() => setT(null)}>Cancel</button>
              <button className="gs-primary" onClick={save}>Save ⚑</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fl-toast" role="status">{toast}</div>}
    </>
  );
};

export const LangPicker: React.FC = () => {
  const lang = useLang();
  const script = useScriptSetting();
  return (
    <div className="lang-picks">
      <label className="lang-pick" title="Language for meanings">
        <span>अर्थभाषा · Meanings in</span>
        <select value={lang} onChange={e => setLang(e.target.value)}>
          {MEANING_LANGS.map(k => <option key={k} value={k}>{LANGS[k]}</option>)}
        </select>
      </label>
      <label className="lang-pick" title="Script for Sanskrit words">
        <span>लिपिः · Sanskrit in</span>
        <select value={script} onChange={e => setScript(e.target.value as Script)}>
          {SCRIPTS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
    </div>
  );
};
