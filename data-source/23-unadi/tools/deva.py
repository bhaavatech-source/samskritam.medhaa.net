V = {"a": "अ", "A": "आ", "i": "इ", "I": "ई", "u": "उ", "U": "ऊ", "f": "ऋ", "F": "ॠ", "x": "ऌ", "X": "ॡ", "e": "ए", "E": "ऐ", "o": "ओ", "O": "औ"}
M = {"a": "", "A": "ा", "i": "ि", "I": "ी", "u": "ु", "U": "ू", "f": "ृ", "F": "ॄ", "x": "ॢ", "X": "ॣ", "e": "े", "E": "ै", "o": "ो", "O": "ौ"}
C = dict(zip("kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzshL", "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहळ"))
def deva(s):
    s = s.replace("\\", "").replace("^", "")
    o, prev = [], False
    for ch in s:
        if ch in C:
            if prev: o.append("्")
            o.append(C[ch]); prev = True
        elif ch in V: o.append(M[ch] if prev else V[ch]); prev = False
        else:
            if prev: o.append("्")
            o.append({"M": "ं", "H": "ः", "~": "ँ", "'": "ऽ"}.get(ch, ch)); prev = False
    if prev: o.append("्")
    return "".join(o)
