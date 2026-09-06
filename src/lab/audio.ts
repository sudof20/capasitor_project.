let ctx: AudioContext | null = null;
let humOsc: OscillatorNode | null = null;
let humGain: GainNode | null = null;
let unlocked = false;

function getCtx() {
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

export async function unlockAudio() {
  const c = getCtx();
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      /* gesture required again */
    }
  }
  unlocked = true;
  ensureHum();
}

function ensureHum() {
  if (!ctx || humOsc) return;
  humOsc = ctx.createOscillator();
  humOsc.type = "sine";
  humOsc.frequency.value = 92;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 240;
  humGain = ctx.createGain();
  humGain.gain.value = 0;
  humOsc.connect(filter);
  filter.connect(humGain);
  humGain.connect(ctx.destination);
  humOsc.start();
}

export function setHum(amount: number) {
  if (!unlocked || !humGain || !ctx || !humOsc) return;
  const a = Math.max(0, Math.min(1, amount));
  humGain.gain.setTargetAtTime(a * 0.045, ctx.currentTime, 0.08);
  humOsc.frequency.setTargetAtTime(78 + a * 70, ctx.currentTime, 0.12);
}

export function playChargeTick() {
  if (!unlocked || !ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.value = 420;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.03, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.05);
}

export function playShock(energyJ: number) {
  if (!unlocked || !ctx) return;
  const t = ctx.currentTime;
  const dur = 0.28 + Math.min(0.22, energyJ * 0.04);
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = Math.exp(-i / (ctx.sampleRate * 0.07));
    const crackle = Math.random() * 2 - 1;
    data[i] = crackle * env;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 700;
  const g = ctx.createGain();
  const vol = Math.min(0.85, 0.22 + energyJ * 0.1);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(hp).connect(g).connect(ctx.destination);
  src.start(t);

  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(28, t + 0.2);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(Math.min(0.55, 0.18 + energyJ * 0.06), t);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  osc.connect(g2).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.24);
}

export function playTingle() {
  if (!unlocked || !ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = 1800;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.09);
}
