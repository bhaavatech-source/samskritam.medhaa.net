"""Declension of common stem types (Devanāgarī in, 21 forms out: 7 cases × 3 numbers + vocative)."""
import sys
sys.path.insert(0, '/home/claude/unadi/out/tools'); from translit import slp
from deva import deva
T = {
 ('a','m'): "aH O AH am O An ena AByAm EH Aya AByAm eByaH At AByAm eByaH asya ayoH AnAm e ayoH ezu a O AH",
 ('a','n'): "am e Ani am e Ani ena AByAm EH Aya AByAm eByaH At AByAm eByaH asya ayoH AnAm e ayoH ezu a e Ani",
 ('A','f'): "A e AH Am e AH ayA AByAm ABiH AyE AByAm AByaH AyAH AByAm AByaH AyAH ayoH AnAm AyAm ayoH Asu e e AH",
 ('i','m'): "iH I ayaH im I In inA iByAm iBiH aye iByAm iByaH eH iByAm iByaH eH yoH InAm O yoH izu e I ayaH",
 ('i','f'): "iH I ayaH im I IH yA iByAm iBiH aye iByAm iByaH eH iByAm iByaH eH yoH InAm O yoH izu e I ayaH",
 ('I','f'): "I yO yaH Im yO IH yA IByAm IBiH yE IByAm IByaH yAH IByAm IByaH yAH yoH InAm yAm yoH Izu i yO yaH",
 ('u','m'): "uH U avaH um U Un unA uByAm uBiH ave uByAm uByaH oH uByAm uByaH oH voH UnAm O voH uzu o U avaH",
 ('u','f'): "uH U avaH um U UH vA uByAm uBiH ave uByAm uByaH oH uByAm uByaH oH voH UnAm O voH uzu o U avaH",
 ('f','m'): "A arO araH aram arO Fn rA fByAm fBiH re fByAm fByaH uH fByAm fByaH uH roH FRAm ari roH fzu aH arO araH",
 ('f','f'): "A arO araH aram arO FH rA fByAm fBiH re fByAm fByaH uH fByAm fByaH uH roH FRAm ari roH fzu aH arO araH",
 ('Af','m'): "A ArO AraH Aram ArO Fn rA fByAm fBiH re fByAm fByaH uH fByAm fByaH uH roH FRAm Ari roH fzu aH ArO AraH",
}
def decline(stem, g):
    s = slp(stem)
    if g == 'm' and s.endswith('f') and stem in AGENT: key, base = ('Af','m'), s[:-1]
    elif s[-1] in 'aAiIuf': key, base = (s[-1], g), s[:-1]
    else: return []
    if key not in T: return []
    out = []
    for suf in T[key].split():
        f = base + suf
        out.append(deva(f))
    return [natva(f) for f in out]

OK = set("aAiIuUfFxXeEoOhyvrkKgGNpPbBmM")
def natva(f):
    x = list(slp(f))
    for i, c in enumerate(x):
        if c == 'n' and i + 1 < len(x) and x[i + 1] in 'aAiIuUfFeEoOmvyn':
            j = i - 1
            while j >= 0 and x[j] in OK and x[j] not in 'rfFz': j -= 1
            if j >= 0 and x[j] in 'rfFz' and all(ch in OK for ch in x[j + 1:i]): x[i] = 'R'
    return deva(''.join(x))
AGENT = set()   # ṛ-stem agent nouns (दातृ, कर्तृ) decline with ā: दातारौ
if __name__ == '__main__':
    print(decline('राम','m')[:9]); print(decline('पुस्तक','n')[6:9]); print(decline('नदी','f')[:3]); print(decline('पितृ','m')[:3]); print(decline('मति','f')[6:9])
