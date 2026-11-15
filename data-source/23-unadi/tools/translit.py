"""Devanāgarī ↔ SLP1 and Devanāgarī → IAST (enough for stems and words)."""
V = {"अ":"a","आ":"A","इ":"i","ई":"I","उ":"u","ऊ":"U","ऋ":"f","ॠ":"F","ऌ":"x","ए":"e","ऐ":"E","ओ":"o","औ":"O"}
M = {"ा":"A","ि":"i","ी":"I","ु":"u","ू":"U","ृ":"f","ॄ":"F","ॢ":"x","े":"e","ै":"E","ो":"o","ौ":"O"}
C = dict(zip("कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह", "kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh"))
O = {"ं":"M","ः":"H","ँ":"~","ऽ":"'"}
IA = dict(zip("aAiIuUfFxeEoOkKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshMH'~",
  "a ā i ī u ū ṛ ṝ ḷ e ai o au k kh g gh ṅ c ch j jh ñ ṭ ṭh ḍ ḍh ṇ t th d dh n p ph b bh m y r l v ś ṣ s h ṃ ḥ ' ̃".split(" ")))
def slp(s):
    out, i = [], 0
    while i < len(s):
        ch = s[i]
        if ch in C:
            out.append(C[ch]); nx = s[i+1] if i+1 < len(s) else ""
            if nx == "्": i += 2; continue
            if nx in M: out.append(M[nx]); i += 2; continue
            out.append("a"); i += 1; continue
        if ch in V: out.append(V[ch])
        elif ch in O: out.append(O[ch])
        elif ch in M: out.append(M[ch])
        else: out.append(ch)
        i += 1
    return "".join(out)
def iast(s): return "".join(IA.get(c, c) for c in slp(s))
