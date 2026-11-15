// ═══════════════════════════════════════════════════════════════
//  kosha/Upasarga.tsx — उपसर्गाः: the 22 prefixes and the 155 verbs
//  made with them. Used by the उपसर्गाः tab (Grammar.tsx) and by each
//  root in the धातुकोशः (Kosha.tsx).
//  Data: GRAMMAR.upasarga (tools/build_grammar.py, from
//  data-source/21-upasarga, corrected 2026-11-15).
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useState } from "react";
import { GRAMMAR, LAKARA, LAKARA_ORDER, PURUSHA, VACANA, loadUpasargaForms, type UpasargaCombo, type UpasargaForms } from "../data";
import { FlagButton } from "../FlagUI";
import { useLang } from "../settings";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import "./kosha.css";

const U = GRAMMAR.upasarga;
const Speak: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;

export const CAT: Record<UpasargaCombo["cat"], [string, string]> = {
  b: ["बाधते", "shifts the sense"],
  v: ["विशिनष्टि", "narrows the sense"],
  a: ["अनुवर्तते", "follows the sense"],
};

const meaningOf = (c: UpasargaCombo, lang: string) => (c.m as Record<string, string>)[lang] || c.m.en;

/** a table of upasarga + root verbs */
export const ComboTable: React.FC<{ items: UpasargaCombo[]; showRoot?: boolean }> = ({ items, showRoot = true }) => {
  const S = useSa();
  const lang = useLang();
  if (!items.length) return null;
  return (
    <div className="ks-table-wrap"><table className="ks-karaka up-combos"><tbody>{items.map(c => (
      <tr key={c.id}>
        <td className="ks-l-sa up-w"><b>{S(c.w)}</b>{c.fin && <Speak t={c.w} />}
          {showRoot && <span className="up-parts">{S([...c.u, c.d].join(" + "))}</span>}
          {c.att === "nominal only (khal)" && <span className="ks-pill up-pill">used as a noun / adjective</span>}
          {c.att === "rare / to verify" && <span className="ks-pill up-pill rv-only">rare · to verify</span>}
        </td>
        <td>
          <span dir="auto">{meaningOf(c, lang)}</span>
          {lang !== "sa" && <span className="ks-l-sa up-sa">{S(c.m.sa)}</span>}
          <span className="up-ex ks-l-sa">{S(c.ex)}{c.src && <small className="up-src"> — {c.src}</small>}</span>
          {c.note && <span className="up-note">{S(c.note)}</span>}
        </td>
        <td><span className={`up-cat up-cat-${c.cat}`} title={CAT[c.cat][1]}>{S(CAT[c.cat][0])}</span></td>
        <td><FlagButton t={{ kind: "grammar", id: c.id, field: "upasarga-verb", value: `${c.w}: ${c.m.en}`, where: `${c.w} (${[...c.u, c.d].join(" + ")})` }} /></td>
      </tr>))}</tbody></table></div>
  );
};

/** root + class, e.g. "भू|भ्वादि" — the verb book writes the class as "भ्वादिः (1st Class)" */
export const rootKey = (lemma: string, gana: string) => `${lemma}|${gana.split("ः")[0].split("गणः")[0]}`;

/** prefixed forms and meanings of each root, so that the root search finds भू from अनुभवति */
export const PREFIX_BY_ROOT = new Map<string, string>();
for (const c of U.combos) {
  const k = rootKey(c.d, c.g);
  PREFIX_BY_ROOT.set(k, `${PREFIX_BY_ROOT.get(k) ?? ""} ${c.w} ${c.m.en}`);
}

export const comboSearch = (c: UpasargaCombo) => [c.w, ...c.u, ...c.rows, c.d, c.up, ...Object.values(c.m), c.ex, c.id].join(" ");

export const comboLabel = (c: UpasargaCombo, lang: string, S: (t: string) => string) =>
  <><span className="ks-l-sa">{S(c.w)}</span><span className="ks-l-en">{meaningOf(c, lang)}</span></>;

/** one prefixed verb on its own (the “With prefixes” tab of the धातुकोशः) */
export const ComboCard: React.FC<{ c: UpasargaCombo; openRoot?: () => void; rootLabel?: string }> = ({ c, openRoot, rootLabel }) => {
  const S = useSa();
  const lang = useLang();
  return (
    <div className="ks-card">
      <div className="ks-head">
        <h3>{S(c.w)}</h3>{c.fin && <Speak t={c.w} />}
        <span className="ks-sub">{S([...c.u, c.d].join(" + "))} · {S(c.up)} · {S(c.g)}</span>
      </div>
      <p className="ks-main-meaning" dir="auto">{meaningOf(c, lang)} <FlagButton t={{ kind: "grammar", id: c.id, field: "meaning:" + lang, value: meaningOf(c, lang), where: `${c.w} — meaning` }} /></p>
      <p className="ks-l-sa up-sa">{S(c.m.sa)}</p>
      <p><span className={`up-cat up-cat-${c.cat}`}>{S(CAT[c.cat][0])}</span> <span className="ks-l-en">{CAT[c.cat][1]}{c.cg ? ` — ${c.cg}` : ""}</span></p>
      {c.att === "nominal only (khal)" && <p className="ks-note">Used as a noun or adjective; no finite verb is in use.</p>}
      {c.att === "rare / to verify" && <p className="ks-note rv-only">Rare form — attestation to be checked.</p>}
      <h4>उदाहरणम् · Example</h4>
      <p className="ks-l-sa up-ex">{S(c.ex)} {c.fin && <Speak t={c.ex.split(" (")[0]} />}</p>
      {c.src && <p className="ks-l-en">{c.src}</p>}
      {c.note && <p className="up-note">{S(c.note)}</p>}
      {c.fin && c.id !== "UDC-000133" && <ComboForms c={c} />}
      {openRoot
        ? <button className="ks-roman-btn up-open" onClick={openRoot}>{S(rootLabel ?? c.d)} — open the root's forms →</button>
        : <p className="ks-note">The root {S(c.d)} is not yet in the verb book.</p>}
      <p className="ks-id">{c.id}</p>
    </div>
  );
};

const MODE: Record<string, string> = { kartari_P: "कर्तरि · परस्मैपदम्", kartari_A: "कर्तरि · आत्मनेपदम्", karmani: "कर्मणि · Passive" };

/** all ten lakāras of a prefixed verb (loaded on demand) */
const ComboForms: React.FC<{ c: UpasargaCombo }> = ({ c }) => {
  const S = useSa();
  const [all, setAll] = useState<UpasargaForms | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [lk, setLk] = useState("lat");
  useEffect(() => { let on = true; loadUpasargaForms().then(f => on && setAll(f)).catch(e => on && setErr(String(e?.message ?? e))); return () => { on = false; }; }, []);
  if (err) return <p className="ks-note" role="alert">{err}</p>;
  if (!all) return <p className="ks-note" role="status">Loading the verb tables…</p>;
  const modes = all[c.id];
  if (!modes) return null;
  const keys = Object.keys(modes);
  const md = mode && modes[mode] ? mode : keys[0];
  const forms = modes[md];
  const lakaras = LAKARA_ORDER.filter(x => forms[x]);
  const lakara = forms[lk] ? lk : lakaras[0];
  const cells = forms[lakara] ?? [];
  return <>
    <h4>रूपाणि · Forms</h4>
    <div className="ks-chips">{keys.map(k => <button key={k} className={k === md ? "on" : ""} onClick={() => setMode(k)}>{MODE[k] ?? k}</button>)}</div>
    <div className="ks-chips ks-chips-sm">{lakaras.map(x =>
      <button key={x} className={x === lakara ? "on" : ""} onClick={() => setLk(x)}>{LAKARA[x][0]} <small>{LAKARA[x][1]}</small></button>)}</div>
    <div className="ks-table-wrap"><table className="ks-table">
      <thead><tr><th>{S("पुरुषः")}</th>{VACANA.map(n => <th key={n}>{S(n)}</th>)}</tr></thead>
      <tbody>{PURUSHA.map((p, pi) => <tr key={p}><th>{S(p)}</th>{[0, 1, 2].map(ni => {
        const f = cells[pi * 3 + ni];
        return f ? <td key={ni} className="ks-form">{S(f.split(" / ")[0])}{f.includes(" / ") && <span className="ks-alt"> / {f.split(" / ").slice(1).map(x => S(x)).join(" / ")}</span>}
          <FlagButton t={{ kind: "grammar", id: c.id, field: `${md}:${lakara}:${pi},${ni}`, value: f, where: `${c.w} — ${MODE[md] ?? md} ${LAKARA[lakara][0]} ${p} ${VACANA[ni]}` }} /></td>
          : <td key={ni} className="ks-empty">—</td>;
      })}</tr>)}</tbody>
    </table></div>
    {keys.length > 1 && keys[0].startsWith("kartari") && keys[1].startsWith("kartari") && <p className="ks-note">Both padas are in use; the one used in the meaning above is shown first.</p>}
  </>;
};

/** the verbs a root makes with upasargas (shown in the धातुकोशः) */
export const UpasargaForRoot: React.FC<{ lemma: string; gana: string }> = ({ lemma, gana }) => {
  const k = rootKey(lemma, gana);
  const items = U.combos.filter(c => rootKey(c.d, c.g) === k);
  if (!items.length) return null;
  return <>
    <h4>उपसर्गयोगः · With prefixes ({items.length})</h4>
    <ComboTable items={items} />
  </>;
};

/** the उपसर्गाः tab of the व्याकरणकोशः */
export const UpasargaTab: React.FC = () => {
  const S = useSa();
  const lang = useLang();
  const [open, setOpen] = useState<string | null>(null);
  const [cat, setCat] = useState<"all" | UpasargaCombo["cat"]>("all");
  const count = (k: UpasargaCombo["cat"]) => U.combos.filter(c => c.cat === k).length;
  return (
    <div className="ks-card">
      <p className="gr-sloka">{S(U.sloka)}</p>
      <p>{U.sloka_en}</p>
      <div className="ks-table-wrap"><table className="ks-karaka"><tbody>{U.three.map(([sa, en, ex]) =>
        <tr key={sa}><td className="ks-l-sa"><b>{S(sa)}</b></td><td>{en}</td><td className="ks-l-sa">{S(ex)}</td></tr>)}</tbody></table></div>

      <h4>{S("हृ")} + 7 {S("उपसर्गाः")} · one root, seven meanings</h4>
      <p className="gr-sloka up-verse2">{S(U.verse2)}</p>
      <p>{U.verse2_en}</p>
      <div className="ks-chips">{U.hr.map(([u, w, en]) => <span key={w} className="ks-tag">{S(u)} → <b>{S(w)}</b> · {en}</span>)}</div>

      <p className="ks-note-plain">{S(U.cls)} {S(U.pada)}</p>
      <p className="ks-note-plain">{S(U.nature)}</p>

      <h4>२२ {S("उपसर्गाः")} · {U.combos.length} verbs</h4>
      <p className="ks-note-plain">{U.count_note} Tap a prefix to see the verbs made with it.</p>
      <div className="ks-chips up-filter">
        <button className={cat === "all" ? "on" : ""} onClick={() => setCat("all")}>All ({U.combos.length})</button>
        {(["b", "v", "a"] as const).map(k =>
          <button key={k} className={cat === k ? "on" : ""} onClick={() => setCat(k)}>{S(CAT[k][0])} <small>{CAT[k][1]} ({count(k)})</small></button>)}
      </div>
      <div className="up-list">{U.list.map(u => {
        const items = U.combos.filter(c => c.rows.includes(u.u) && (cat === "all" || c.cat === cat));
        const isOpen = open === u.u;
        const local = lang === "hi" ? u.hi : lang === "te" ? u.te : "";
        return (
          <section key={u.u} className={`up-row ${isOpen ? "on" : ""}`}>
            <button className="up-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : u.u)}>
              <b className="ks-l-sa">{S(u.u)}</b>
              <span className="up-en">{u.en}</span>
              <span className="up-exs">{u.ex.map(([w, m]) => <span key={w} className="gr-upex"><span className="ks-l-sa">{S(w)}</span> <span className="ks-l-en">{m}</span></span>)}</span>
              <span className="up-n">{items.length} {items.length === 1 ? "verb" : "verbs"} {isOpen ? "▴" : "▾"}</span>
            </button>
            {isOpen && <div className="up-body">
              <div className="ks-chips">{u.sa.map(m => <span key={m} className="ks-tag ks-l-sa">{S(m)}</span>)}</div>
              {local && <p dir="auto">{local}</p>}
              {u.phon && <p className="up-note"><b>ध्वनिः · Sound changes:</b> {S(u.phon)}</p>}
              {u.use && <p className="up-note"><b>प्रयोगः · Usage:</b> {S(u.use)}</p>}
              <ComboTable items={items} />
              <FlagButton t={{ kind: "grammar", id: `upasarga:${u.u}`, field: "entry", value: `${u.u}: ${u.en}`, where: `${u.u} — upasarga` }} label="Report" />
            </div>}
          </section>);
      })}</div>
    </div>
  );
};
