// ═══════════════════════════════════════════════════════════════
//  kosha/RupaNirmana.tsx — रूपनिर्माणम्: a verb-book root with no upasarga,
//  any one of the 22, or the recorded two- and three-upasarga verbs →
//  all tiṅanta and kṛdanta forms. The forms are prepared in advance
//  (tools/build_rupa_tables.py → app/public/rupa/); nothing is computed here.
// ═══════════════════════════════════════════════════════════════
import React, { useEffect, useMemo, useState } from "react";
import { GRAMMAR, LAKARA, LAKARA_ORDER, PURUSHA, VACANA } from "../data";
import { useLang } from "../settings";
import { useSa } from "../i18n/script";
import { speak } from "../speech";
import "./kosha.css";

// ── SLP1 → Devanāgarī (the tables are stored in SLP1, which is about a third of the size) ──
const V: Record<string, string> = { a: "अ", A: "आ", i: "इ", I: "ई", u: "उ", U: "ऊ", f: "ऋ", F: "ॠ", x: "ऌ", X: "ॡ", e: "ए", E: "ऐ", o: "ओ", O: "औ" };
const M: Record<string, string> = { a: "", A: "ा", i: "ि", I: "ी", u: "ु", U: "ू", f: "ृ", F: "ॄ", x: "ॢ", X: "ॣ", e: "े", E: "ै", o: "ो", O: "ौ" };
const C: Record<string, string> = Object.fromEntries([..."kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL"].map((c, i) => [c, "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळ"[i]]));
const O: Record<string, string> = { M: "ं", H: "ः", "~": "ँ", "'": "ऽ" };
export function deva(s: string): string {
  let out = "", prev = false;
  for (const ch of s) {
    if (C[ch]) { if (prev) out += "्"; out += C[ch]; prev = true; }
    else if (ch in V) { out += prev ? M[ch] : V[ch]; prev = false; }
    else { if (prev) out += "्"; out += O[ch] ?? ch; prev = false; }
  }
  return prev ? out + "्" : out;
}

// ── prepared tables (tools/build_rupa_tables.py): app/public/rupa/<code>.json and index.json ──
export type RupaEntry = { t: Record<string, Record<string, string[]>>; k: Record<string, string> };
export type RupaTable = Record<string, RupaEntry>;         // "" | "pra" | "sam,AN" … → forms
type Root = [string, string, string, string, string, string[]];   // code, upadeśa, root, artha, English, multi-upasarga keys
const url = (f: string) => new URL(`rupa/${f}`, document.baseURI).href;
let index: Promise<Root[]> | null = null;
const loadIndex = () => (index ??= fetch(url("index.json")).then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<Root[]>; }));
const tables = new Map<string, Promise<RupaTable>>();
export const loadRupaTable = (code: string) => {
  if (!tables.has(code)) tables.set(code, fetch(url(`${code}.json`)).then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<RupaTable>; }));
  return tables.get(code)!;
};

// ── the 22 upasargas (SLP1 for the engine, Devanāgarī for the reader) ──
const UPASARGAS: [string, string][] = [["pra", "प्र"], ["parA", "परा"], ["apa", "अप"], ["sam", "सम्"], ["anu", "अनु"], ["ava", "अव"],
  ["nis", "निस्"], ["nir", "निर्"], ["dus", "दुस्"], ["dur", "दुर्"], ["vi", "वि"], ["AN", "आङ्"], ["ni", "नि"], ["aDi", "अधि"], ["api", "अपि"],
  ["ati", "अति"], ["su", "सु"], ["ud", "उद्"], ["aBi", "अभि"], ["prati", "प्रति"], ["pari", "परि"], ["upa", "उप"]];
const UP_DEVA = Object.fromEntries(UPASARGAS);
const MODE: Record<string, string> = { kartari_P: "कर्तरि · परस्मैपदम्", kartari_A: "कर्तरि · आत्मनेपदम्", karmani: "कर्मणि · Passive", bhave: "भावे · Impersonal" };
export const KRT_SUFFIXES: [string, string, string][] = [
  ["ktvA", "क्त्वा / ल्यप्", "having done"], ["tumun", "तुमुन्", "to do"], ["Ramul", "णमुल्", "doing repeatedly"],
  ["kta", "क्त", "done (past participle)"], ["ktavatu", "क्तवतु", "one who has done"], ["Satf", "शतृ", "doing (present participle)"],
  ["SAnac", "शानच्", "doing (present participle, ātmanepada)"], ["tavyat", "तव्यत्", "to be done"], ["anIyar", "अनीयर्", "to be done, worth doing"],
  ["yat", "यत्", "to be done"], ["Ryat", "ण्यत्", "to be done"], ["kyap", "क्यप्", "to be done"], ["tfc", "तृच्", "doer"],
  ["Rvul", "ण्वुल्", "doer"], ["lyuw", "ल्युट्", "the act of"], ["ktin", "क्तिन्", "the act / state of"], ["GaY", "घञ्", "the act of"],
  ["ac", "अच्", "doer / act"], ["ap", "अप्", "the act of"]];

/** split "a|b" into Devanāgarī forms, the usual written form first (तु before तात्, त् before the pausal द्) */
export const slpForms = (x: string) => x.split("|").filter(Boolean).map(deva).sort((a, b) => rank(a) - rank(b));
const rank = (f: string) => (f.endsWith("द्") ? 2 : f.endsWith("तात्") ? 1 : 0);

const Say: React.FC<{ t: string }> = ({ t }) => <button className="ks-speak" onClick={() => speak(t)} aria-label={`Listen: ${t}`}>🔊</button>;

export const RupaNirmana: React.FC = () => {
  const S = useSa(); const lang = useLang();
  const [list, setList] = useState<Root[] | null>(null);
  const [q, setQ] = useState("");
  const [root, setRoot] = useState<Root | null>(null);
  const [table, setTable] = useState<RupaTable | null>(null);
  const [ups, setUps] = useState<string[]>(["", "", ""]);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [lk, setLk] = useState("lat");

  useEffect(() => { loadIndex().then(setList).catch(() => setErr("The root list could not be loaded.")); }, []);
  useEffect(() => {
    if (!root) return;
    let on = true; setTable(null);
    loadRupaTable(root[0]).then(t => on && setTable(t)).catch(() => on && setErr("The forms of this root could not be loaded."));
    return () => { on = false; };
  }, [root]);

  const matches = useMemo(() => {
    if (!list) return [];
    const t = q.trim().toLowerCase();
    return t ? list.filter(r => r.slice(0, 5).some(x => String(x).toLowerCase().includes(t))) : list;
  }, [list, q]);

  const prefixes = ups.filter(Boolean);
  const key = prefixes.join(",");
  const keys = table ? Object.keys(table) : [];
  // what each picker may offer: the next upasarga of a prepared combination
  const choices = (i: number) => {
    const before = ups.slice(0, i).filter(Boolean).join(",");
    const next = new Set(keys.filter(k => k && (i === 0 ? true : k.startsWith(before + ","))).map(k => k.split(",")[i]).filter(Boolean));
    return UPASARGAS.filter(([v]) => next.has(v));
  };
  const entry = table?.[key];
  const result = entry ? { tin: entry.t, krt: entry.k } : null;

  // a recorded meaning for this exact combination (the upasarga verbs), or the root's meaning
  const upDeva = prefixes.map(p => UP_DEVA[p]);
  const known = root ? GRAMMAR.upasarga.combos.find(c => c.d === root[2] && c.u.join(",") === upDeva.join(",")) : undefined;

  const setUp = (i: number, v: string) => setUps(cur => { const n = [...cur]; n[i] = v; for (let j = i + 1; j < 3; j++) n[j] = ""; return n; });
  const pick = (r: Root) => { setRoot(r); setQ(""); setUps(["", "", ""]); setErr(null); };
  const modes = result ? Object.keys(result.tin) : [];
  const md = mode && result?.tin[mode] ? mode : modes[0];
  const grid = md ? result!.tin[md] : undefined;
  const lakaras = grid ? LAKARA_ORDER.filter(x => grid[x]) : [];
  const lakara = grid?.[lk] ? lk : lakaras[0];
  const cells = grid && lakara ? grid[lakara] : [];
  const head = result ? slpForms(result.tin.kartari_P?.lat?.[0] || result.tin.kartari_A?.lat?.[0] || "")[0] ?? "" : "";

  return (
    <div className="ks-card rn">
      <p className="ks-note-plain">Choose a root of the verb book, then no upasarga, any one of the 22, or a recorded combination of two or three.</p>
      <div className="rn-pick">
        {[0, 1, 2].map(i => (
          <label key={i} className="rn-up">{S(["प्रथमः", "द्वितीयः", "तृतीयः"][i])} {S("उपसर्गः")}
            <select value={ups[i]} disabled={!table || (i > 0 && !ups[i - 1]) || choices(i).length === 0} onChange={e => setUp(i, e.target.value)}>
              <option value="">{i === 0 ? "— none" : "—"}</option>
              {choices(i).map(([v, d]) => <option key={v} value={v}>{S(d)}</option>)}
            </select>
          </label>))}
        <label className="rn-root">{S("धातुः")}
          <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search: गम्, भू, गतौ, to go…" aria-label="Search a root" />
        </label>
      </div>
      {list && <p className="ks-note-plain rn-count">{matches.length} of {list.length} roots</p>}
      {!root || q ? <div className="rn-roots" role="listbox">{matches.map(r => (
        <button key={r[0]} role="option" aria-selected={root?.[0] === r[0]} className={root?.[0] === r[0] ? "on" : ""} onClick={() => pick(r)}>
          <b className="ks-l-sa">{S(r[2])}</b> <span className="ks-l-sa">{S(r[1])} {S(r[3])}</span> <small>{r[4]}</small> <small className="rn-code">{r[0]}</small>
        </button>))}
        {list && !matches.length && <p className="ks-none">Nothing matches.</p>}</div> : null}

      {err && <p className="ks-note" role="alert">{err}</p>}
      {root && !err && !table && <p className="ks-note" role="status">Loading the forms…</p>}
      {root && table && !entry && <p className="ks-note">No forms for this combination.</p>}
      {root && result && <>
        <div className="ks-head rn-head">
          <h3>{head ? S(head) : S(root[2])}</h3>{head && <Say t={head} />}
          <span className="ks-sub">{S([...upDeva, root[2]].join(" + "))} · {S(root[1])} {S(root[3])} · {root[0]}</span>
        </div>
        {known ? <p className="ks-main-meaning" dir="auto">{(known.m as Record<string, string>)[lang] || known.m.en} <span className="ks-artha">({S(known.m.sa)})</span></p>
          : prefixes.length ? <p className="ks-note-plain">रूपाणि व्याकरणानुसारम् — the meaning of this combination is not recorded here.{root[4] && ` Root: ${root[4]}.`}</p>
          : root[4] ? <p className="ks-main-meaning">{root[4]}</p> : null}

        {modes.length > 0 ? <>
          <h4>तिङन्तरूपाणि · Verb forms</h4>
          <div className="ks-chips">{modes.map(k => <button key={k} className={k === md ? "on" : ""} onClick={() => setMode(k)}>{MODE[k] ?? k}</button>)}</div>
          <div className="ks-chips ks-chips-sm">{lakaras.map(x =>
            <button key={x} className={x === lakara ? "on" : ""} onClick={() => setLk(x)}>{LAKARA[x][0]} <small>{LAKARA[x][1]}</small></button>)}</div>
          <div className="ks-table-wrap"><table className="ks-table">
            <thead><tr><th>{S("पुरुषः")}</th>{VACANA.map(n => <th key={n}>{S(n)}</th>)}</tr></thead>
            <tbody>{PURUSHA.map((p, pi) => <tr key={p}><th>{S(p)}</th>{[0, 1, 2].map(ni => {
              const f = slpForms(cells[pi * 3 + ni] || "");
              return f.length ? <td key={ni} className="ks-form">{S(f[0])}{f.length > 1 && <span className="ks-alt"> / {f.slice(1).map(x => S(x)).join(" / ")}</span>}</td>
                : <td key={ni} className="ks-empty">—</td>;
            })}</tr>)}</tbody>
          </table></div>
        </> : <p className="ks-note">No verb forms for this combination.</p>}

        {Object.keys(result.krt).length > 0 && <>
          <h4>कृदन्तरूपाणि · Participles and verbal nouns</h4>
          <div className="ks-table-wrap"><table className="ks-table ks-krt"><tbody>{KRT_SUFFIXES.filter(([k]) => result.krt[k]).map(([k, name, en]) => {
            const f = slpForms(result.krt[k]);
            return <tr key={k}><th className="ks-l-sa">{S(name)}</th><td className="ks-form">{S(f[0])}{f.length > 1 && <span className="ks-alt"> / {f.slice(1).map(x => S(x)).join(" / ")}</span>}</td><td>{en}</td></tr>;
          })}</tbody></table></div>
        </>}
      </>}
    </div>
  );
};
