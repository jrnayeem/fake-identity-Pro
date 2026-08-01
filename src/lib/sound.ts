let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

export function playClick(): void {
  if (!isSoundEnabled()) return;
  try {
    const ac = ctx();
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.start(now);
    osc.stop(now + 0.08);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch {
  }
}

const KEY = "fakenames-sound";

export function isSoundEnabled(): boolean {
  try { return localStorage.getItem(KEY) !== "false"; } catch { return true; }
}

export function setSoundEnabled(on: boolean): void {
  try { localStorage.setItem(KEY, on ? "true" : "false"); } catch {}
}
