// speech.ts — read Sanskrit aloud with the browser's Hindi voice (Devanāgarī is read well by hi-IN voices)
export const speak = (text: string) => {
  try {
    const t = text.replace(/___/g, "").replace(/[।॥]/g, " ");
    const rv = (window as unknown as { responsiveVoice?: { cancel: () => void; speak: (t: string, v: string, o: object) => void } }).responsiveVoice;
    if (rv) { rv.cancel(); rv.speak(t, "Hindi Female", { rate: 0.85 }); return; }
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "hi-IN"; u.rate = 0.8;
    window.speechSynthesis.speak(u);
  } catch { /* no voice available */ }
};
