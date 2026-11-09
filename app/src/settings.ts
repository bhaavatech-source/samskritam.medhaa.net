// settings.ts — the meaning language, shared by every screen and saved in this browser
import { useSyncExternalStore } from "react";
import { MEANING_LANGS } from "./data";

const KEY = "samskrita-medhaa-lang";
let lang = (() => {
  try { const v = localStorage.getItem(KEY); if (v && MEANING_LANGS.includes(v)) return v; } catch { /* storage blocked */ }
  return MEANING_LANGS.includes("te") ? "te" : "en";
})();
const subs = new Set<() => void>();

export function setLang(l: string) {
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  subs.forEach(f => f());
}
export function getLang() { return lang; }
export function useLang(): string {
  return useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, () => lang);
}

// reviewer mode: shows sources, ✓ / ⚑ buttons, IDs and notes. Off for learners.
const RKEY = "samskrita-medhaa-reviewer";
let reviewer = (() => { try { return localStorage.getItem(RKEY) === "1"; } catch { return false; } })();
const rsubs = new Set<() => void>();
export function setReviewer(on: boolean) {
  reviewer = on;
  try { localStorage.setItem(RKEY, on ? "1" : "0"); } catch { /* ignore */ }
  rsubs.forEach(f => f());
}
export function useReviewer(): boolean {
  return useSyncExternalStore(f => { rsubs.add(f); return () => { rsubs.delete(f); }; }, () => reviewer);
}

// readings (meanings in Latin letters): hidden until the learner asks for them — keeps small screens clean
const RDKEY = "samskrita-medhaa-readings";
let readings = (() => { try { return localStorage.getItem(RDKEY) === "1"; } catch { return false; } })();
const rdsubs = new Set<() => void>();
export function setReadings(on: boolean) {
  readings = on;
  try { localStorage.setItem(RDKEY, on ? "1" : "0"); } catch { /* ignore */ }
  rdsubs.forEach(f => f());
}
export function useReadings(): boolean {
  return useSyncExternalStore(f => { rdsubs.add(f); return () => { rdsubs.delete(f); }; }, () => readings);
}
