let ctx: AudioContext | null = null;
const getCtx = () => { if (!ctx) ctx = new AudioContext(); return ctx; };

const tone = (
  freq: number,
  type: OscillatorType,
  vol: number,
  start: number,
  dur: number
) => {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.connect(g);
  g.connect(c.destination);
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(vol, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.start(start);
  o.stop(start + dur + 0.01);
};

export const sfx = {
  correct: () => {
    const t = getCtx().currentTime;
    tone(523, "sine", 0.3, t,        0.12);
    tone(659, "sine", 0.3, t + 0.12, 0.12);
    tone(784, "sine", 0.3, t + 0.24, 0.22);
  },
  wrong: () => {
    const t = getCtx().currentTime;
    tone(220, "sawtooth", 0.2, t,       0.12);
    tone(180, "sawtooth", 0.2, t + 0.1, 0.18);
  },
  streak: () => {
    const t = getCtx().currentTime;
    [880, 1100, 1320].forEach((f, i) =>
      tone(f, "sine", 0.25, t + i * 0.08, 0.12)
    );
  },
  levelUp: () => {
    const t = getCtx().currentTime;
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone(f, "sine", 0.35, t + i * 0.14, 0.2)
    );
  },
};