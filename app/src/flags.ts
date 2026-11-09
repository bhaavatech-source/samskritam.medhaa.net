// ═══════════════════════════════════════════════════════════════
//  flags.ts — "⚑ report a mistake": every flag the reviewer makes.
//  Saved in this browser (localStorage). When the page is opened as a
//  Claude artifact, flags are also saved online so Claude can read them.
//  Export as CSV / JSON from the दोषसूचनाः screen.
// ═══════════════════════════════════════════════════════════════
import { useSyncExternalStore } from "react";

export type FlagKind = "word" | "verb" | "krt" | "sentence" | "avyaya" | "grammar";
export type Flag = {
  kind: FlagKind; id: string; field: string; value: string; where: string;
  issue: string; fix: string; note: string; ts: number; _doc?: string;
};
export type FlagTarget = Pick<Flag, "kind" | "id" | "field" | "value" | "where">;

export const ISSUES: [string, string][] = [
  ["wrong-form", "रूपं दोषयुक्तम् · Wrong form"],
  ["wrong-meaning", "अर्थः दोषयुक्तः · Wrong meaning"],
  ["spelling", "वर्णदोषः · Spelling / typo"],
  ["missing", "न्यूनता · Something missing"],
  ["unsuitable", "बालानाम् अनुचितम् · Not suitable for children"],
  ["other", "अन्यत् · Other"],
];
/** a reviewer's "✓ this is correct" is stored as a flag with issue "ok" */
export const OK = "ok";

const KEY = "samskrita-medhaa-flags-v1";
type Db = {
  collection: (p: string) => {
    add: (d: Record<string, unknown>) => Promise<unknown>;
    doc: (id: string) => { delete: () => Promise<void> };
    onSnapshot: (n: (s: { docs: { id: string; data: () => Record<string, unknown> | undefined }[]; metadata: { fromCache: boolean } }) => void, e?: (err: { code: string }) => void) => () => void;
  };
};

let local: Flag[] = load();
let remote: Flag[] = [];
let db: Db | null = null;
let state = { flags: local, online: false, note: "" };
const subs = new Set<() => void>();

function load(): Flag[] {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch { /* blocked */ }
  return [];
}
function saveLocal() { try { localStorage.setItem(KEY, JSON.stringify(local)); } catch { /* ignore */ } }
function emit() {
  const all = [...remote, ...local].sort((a, b) => b.ts - a.ts);
  state = { ...state, flags: all };
  subs.forEach(f => f());
}

// connect to the online store when running as a Claude artifact
(async () => {
  try {
    const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
    if (!c?.use) return;
    const d = (await c.use("db")) as Db | null;
    if (!d) return;
    db = d; state = { ...state, online: true };
    let done = false;
    const t = window.setTimeout(() => { if (!done) { state = { ...state, note: "Online flags not reachable yet — showing this browser's copy." }; emit(); } }, 10000);
    d.collection("flags").onSnapshot(s => {
      if (!s.metadata.fromCache) { done = true; clearTimeout(t); state = { ...state, note: "" }; }
      remote = s.docs.map(x => ({ ...(x.data() as unknown as Flag), _doc: x.id }));
      emit();
    }, err => {
      done = true; clearTimeout(t); db = null; remote = [];
      state = { ...state, online: false, note: `Online flags unavailable (${err.code}) — kept in this browser.` }; emit();
    });
  } catch { /* stay local */ }
})();

export function useFlags() {
  return useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, () => state);
}
export const flagKey = (t: Pick<Flag, "kind" | "id" | "field">) => `${t.kind}|${t.id}|${t.field}`;

export async function addFlag(f: Omit<Flag, "ts" | "_doc">): Promise<"online" | "local"> {
  const full: Flag = { ...f, ts: Date.now() };
  if (db) {
    try { await db.collection("flags").add(full as unknown as Record<string, unknown>); return "online"; }
    catch { /* fall back */ }
  }
  local = [full, ...local]; saveLocal(); emit(); return "local";
}
export async function removeFlag(f: Flag) {
  if (f._doc && db) { try { await db.collection("flags").doc(f._doc).delete(); } catch { /* ignore */ } return; }
  local = local.filter(x => !(x.ts === f.ts && flagKey(x) === flagKey(f))); saveLocal(); emit();
}
/** merge flags from a JSON export (e.g. from another computer) */
export function importFlags(json: string): number {
  const arr = JSON.parse(json) as Flag[];
  const have = new Set(state.flags.map(f => flagKey(f) + "|" + f.ts));
  const fresh = arr.filter(f => f && f.kind && !have.has(flagKey(f) + "|" + f.ts)).map(f => ({ ...f, _doc: undefined }));
  local = [...fresh, ...local]; saveLocal(); emit(); return fresh.length;
}

export function flagsCSV(flags: Flag[]) {
  const cols: (keyof Flag)[] = ["kind", "id", "where", "field", "value", "issue", "fix", "note", "ts"];
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + cols.join(",") + "\n" + flags.map(f => cols.map(c => q(c === "ts" ? new Date(f.ts).toISOString() : f[c])).join(",")).join("\n");
}

/** save a file: Claude artifact download if available, otherwise a normal browser download */
export async function saveFile(filename: string, data: string, mime: string) {
  try {
    const c = (window as unknown as { claude?: { use?: (n: string) => Promise<unknown> } }).claude;
    const dl = c?.use ? (await c.use("downloads")) as { save: (o: { filename: string; data: string }) => Promise<unknown> } | null : null;
    if (dl) { await dl.save({ filename, data }); return; }
  } catch { return; }
  const url = URL.createObjectURL(new Blob([data], { type: mime }));
  const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── the dialog is opened from anywhere through this tiny event bus ──
type Opener = (t: FlagTarget) => void;
let opener: Opener | null = null;
export const registerFlagDialog = (o: Opener | null) => { opener = o; };
export const openFlag = (t: FlagTarget) => opener?.(t);
