// game/progress.ts — stars per station, saved in this browser
import { STATIONS } from "./stations";

const KEY = "samskrita-medhaa-yatra-v1";
export type Progress = { stars: Record<string, number>; best: Record<string, number>; openAll: boolean };

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { stars: {}, best: {}, openAll: false, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return { stars: {}, best: {}, openAll: false };
}

export function saveProgress(p: Progress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export function isUnlocked(p: Progress, index: number) {
  if (p.openAll || index === 0) return true;
  return (p.stars[STATIONS[index - 1].id] ?? 0) > 0;
}

export function currentIndex(p: Progress) {
  const i = STATIONS.findIndex(s => !(p.stars[s.id] > 0));
  return i === -1 ? STATIONS.length - 1 : i;
}
