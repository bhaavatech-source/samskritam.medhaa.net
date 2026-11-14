"""
sanskrit_manifest.py - catalogue the AIR Sanskrit news recordings for speech work.

Run on the desktop (Python 3, nothing to install):
    python F:\\sanskrit_manifest.py

Reads  F:\\Sanskrit_Audio files\\<bulletin>\\transcriptions.txt  and the sent_N.wav files beside it.
Each line of transcriptions.txt looks like:
    94, <Sanskrit text>, 170240, 82, 198, 1707, 88, 1249, 192
    score, text, number-of-samples, ... (alignment details)
Line N belongs to sent_N.wav; the sample count is used to confirm that.

Writes (nothing else is changed):
    F:\\sanskrit_tts\\manifest.csv   one row per sentence: bulletin, file, seconds, score, matched, text
    F:\\sanskrit_tts\\summary.txt    hours by alignment score, mismatches, problem lines
"""
import csv, os, re, sys, wave
from collections import Counter, defaultdict

ROOT = r"F:\Sanskrit_Audio files"
OUT = r"F:\sanskrit_tts"
os.makedirs(OUT, exist_ok=True)

LATIN = re.compile(r"[A-Za-z]")
DIGIT = re.compile(r"[0-9\u0966-\u096F]")

rows, problems = [], Counter()
for bulletin in sorted(os.listdir(ROOT)):
    folder = os.path.join(ROOT, bulletin)
    tfile = os.path.join(folder, "transcriptions.txt")
    if not os.path.isdir(folder):
        continue
    if not os.path.exists(tfile):
        problems["bulletin without transcriptions.txt"] += 1
        continue
    with open(tfile, encoding="utf-8-sig") as fh:
        lines = [l.strip() for l in fh if l.strip()]
    for i, line in enumerate(lines, 1):
        try:
            score_part, rest = line.split(",", 1)
            parts = rest.rsplit(",", 7)          # text may itself contain commas
            text, nums = parts[0].strip(), [p.strip() for p in parts[1:]]
            score, nsamp = int(score_part), int(nums[0])
        except (ValueError, IndexError):
            problems["unreadable line"] += 1
            continue
        wav = os.path.join(folder, f"sent_{i}.wav")
        seconds, matched = 0.0, False
        if os.path.exists(wav):
            try:
                with wave.open(wav) as w:
                    frames, rate = w.getnframes(), w.getframerate()
                seconds = frames / rate
                matched = frames == nsamp
            except wave.Error:
                problems["unreadable wav"] += 1
        else:
            problems["line without sent_N.wav"] += 1
        if LATIN.search(text):
            problems["text with Latin letters"] += 1
        if DIGIT.search(text):
            problems["text with digits"] += 1
        rows.append({"bulletin": bulletin, "file": f"sent_{i}.wav", "seconds": round(seconds, 2),
                     "score": score, "matched": int(matched), "chars": len(text), "text": text})
    n_wav = len([f for f in os.listdir(folder) if f.lower().endswith(".wav")])
    if n_wav != len(lines):
        problems["bulletins where wav count != line count"] += 1

with open(os.path.join(OUT, "manifest.csv"), "w", encoding="utf-8-sig", newline="") as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)

def hours(rs):
    return sum(r["seconds"] for r in rs) / 3600

bands = [("90-100", 90, 101), ("80-89", 80, 90), ("70-79", 70, 80), ("50-69", 50, 70), ("0-49", 0, 50)]
slots = defaultdict(list)
for r in rows:
    m = re.search(r"Sanskrit-(\d{4}-\d{4})-", r["bulletin"])
    slots[m.group(1) if m else "?"].append(r)

with open(os.path.join(OUT, "summary.txt"), "w", encoding="utf-8") as fh:
    def out(s=""):
        print(s); fh.write(s + "\n")
    out(f"sentences: {len(rows)}   matched to their wav by sample count: {sum(r['matched'] for r in rows)}")
    out(f"total hours: {hours(rows):.1f}")
    out("\nhours by alignment score (matched sentences only):")
    for name, lo, hi in bands:
        sel = [r for r in rows if r["matched"] and lo <= r["score"] < hi]
        out(f"  {name:7} {len(sel):6} sentences  {hours(sel):6.1f} h")
    out("\nby bulletin time:")
    for k, rs in sorted(slots.items()):
        out(f"  {k}: {len(rs)} sentences, {hours(rs):.1f} h")
    lens = sorted(r["seconds"] for r in rows if r["matched"])
    if lens:
        out(f"\nsentence length (s): min {lens[0]:.1f}  median {lens[len(lens)//2]:.1f}  max {lens[-1]:.1f}")
    out("\nproblems:")
    for k, v in problems.most_common():
        out(f"  {k}: {v}")
    out("\nfive low-score examples:")
    for r in sorted(rows, key=lambda r: r["score"])[:5]:
        out(f"  {r['score']:3}  {r['bulletin']}\\{r['file']}  {r['text'][:80]}")
print(f"\nwritten to {OUT}")
