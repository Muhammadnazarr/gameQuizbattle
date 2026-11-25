const KEY = "quizbattle_audio";

let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let noiseBuf = null;
let timer = null;
let current = null;
let ducked = false;

const vol = { music: 0.5, sfx: 0.8 };

try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved) {
    if (typeof saved.music === "number") vol.music = Math.min(1, Math.max(0, saved.music));
    if (typeof saved.sfx === "number") vol.sfx = Math.min(1, Math.max(0, saved.sfx));
  }
} catch (e) {}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(vol)); } catch (e) {}
}

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 24;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.2;
  comp.connect(ctx.destination);

  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(comp);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = vol.sfx;
  sfxBus.connect(master);

  musicBus = ctx.createGain();
  musicBus.gain.value = vol.music * 0.55;
  musicBus.connect(master);

  const len = ctx.sampleRate;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function tone(dest, { f, to, dur = 0.2, type = "sine", v = 0.3, at = 0, a = 0.005, lp = 0, detune = 0 }) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur);
  if (detune) o.detune.value = detune;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (lp) {
    const fl = ctx.createBiquadFilter();
    fl.type = "lowpass";
    fl.frequency.value = lp;
    o.connect(fl);
    node = fl;
  }
  node.connect(g);
  g.connect(dest);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dest, { dur = 0.2, v = 0.2, at = 0, type = "lowpass", freq = 2000, to = 0, q = 0.7 }) {
  const t = ctx.currentTime + at;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const fl = ctx.createBiquadFilter();
  fl.type = type;
  fl.Q.value = q;
  fl.frequency.setValueAtTime(freq, t);
  if (to) fl.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl);
  fl.connect(g);
  g.connect(dest);
  s.start(t);
  s.stop(t + dur + 0.05);
}

const PROG = [
  { root: 45, tones: [0, 3, 7, 12] },
  { root: 41, tones: [0, 4, 7, 12] },
  { root: 48, tones: [0, 4, 7, 12] },
  { root: 43, tones: [0, 4, 7, 12] },
];

const ARP_MENU = [0, -1, 2, -1, 1, -1, 3, -1, 2, -1, 1, -1, 0, -1, 2, -1];
const ARP_BATTLE = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 3, 2];
const MELODY_MENU = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 12, -1, -1, -1],
  [-1, -1, -1, -1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, 16, -1, -1, -1, -1, -1, 12, -1],
  [-1, -1, 14, -1, -1, -1, -1, -1, -1, -1, -1, -1, 11, -1, -1, -1],
];

const TRACKS = {
  menu: { bpm: 80, drums: false, arp: ARP_MENU, level: 0.8 },
  battle: { bpm: 122, drums: true, arp: ARP_BATTLE, level: 1 },
};

function playStep(tr, bus, step, t0) {
  const pos = step % 16;
  const bar = Math.floor(step / 16) % 4;
  const ch = PROG[bar];
  const sec = 60 / tr.bpm / 4;
  const delay = Math.max(0, t0 - ctx.currentTime);
  const out = bus;

  if (pos === 0) {
    const dur = sec * 16;
    ch.tones.slice(0, 3).forEach((iv, k) => {
      const f = hz(ch.root + 12 + iv);
      tone(out, { f, dur, type: "sawtooth", v: 0.035, at: delay, a: dur * 0.35, lp: 700, detune: k * 4 - 4 });
      tone(out, { f: f * 1.002, dur, type: "triangle", v: 0.05, at: delay, a: dur * 0.3, lp: 900 });
    });
  }

  if (pos % 4 === 0 || (tr.drums && pos % 8 === 6)) {
    const accent = pos === 0 ? 1.25 : 1;
    tone(out, { f: hz(ch.root), dur: sec * (tr.drums ? 3 : 4.5), type: "triangle", v: 0.22 * accent, at: delay, a: 0.01, lp: 400 });
    tone(out, { f: hz(ch.root) * 2, dur: sec * 2, type: "sine", v: 0.06, at: delay, lp: 900 });
  }

  const ai = tr.arp[pos];
  if (ai >= 0) {
    const note = ch.root + 12 + ch.tones[ai] + (tr.drums ? 12 : 12);
    tone(out, { f: hz(note), dur: sec * 3.2, type: "triangle", v: tr.drums ? 0.07 : 0.06, at: delay, a: 0.004, lp: tr.drums ? 3200 : 2400 });
    tone(out, { f: hz(note + 12), dur: sec * 1.6, type: "sine", v: 0.018, at: delay + sec * 0.02, a: 0.003 });
  }

  if (!tr.drums) {
    const m = MELODY_MENU[bar][pos];
    if (m >= 0) {
      const note = ch.root + 24 + m;
      tone(out, { f: hz(note), dur: sec * 6, type: "sine", v: 0.07, at: delay, a: 0.01 });
      tone(out, { f: hz(note + 12), dur: sec * 4, type: "sine", v: 0.02, at: delay, a: 0.01 });
    }
  }

  if (tr.drums) {
    if (pos % 4 === 0) {
      tone(out, { f: 130, to: 42, dur: 0.22, type: "sine", v: 0.5, at: delay, a: 0.002 });
      noise(out, { dur: 0.03, v: 0.08, at: delay, freq: 3000 });
    }
    if (pos % 8 === 4) {
      noise(out, { dur: 0.16, v: 0.16, at: delay, type: "bandpass", freq: 1800, q: 0.9 });
      tone(out, { f: 210, to: 140, dur: 0.1, type: "triangle", v: 0.12, at: delay });
    }
    if (pos % 2 === 0) {
      const open = pos % 4 === 2;
      noise(out, { dur: open ? 0.09 : 0.035, v: open ? 0.07 : 0.045, at: delay, type: "highpass", freq: 7000 });
    }
  }
}

function pump() {
  if (!ctx || !current || ctx.state !== "running") return;
  const tr = TRACKS[current.name];
  const sec = 60 / tr.bpm / 4;
  while (current.next < ctx.currentTime + 0.18) {
    playStep(tr, current.bus, current.step, current.next);
    current.step++;
    current.next += sec;
  }
}

function targetMusic() {
  return vol.music * 0.55 * (ducked ? 0.35 : 1);
}

export const Sound = {
  unlock() {
    if (!ensure()) return;
    if (ctx.state === "suspended" || ctx.state === "interrupted") ctx.resume();
  },

  isRunning() { return !!ctx && ctx.state === "running"; },

  setMusicVolume(v) {
    vol.music = Math.min(1, Math.max(0, v));
    save();
    if (musicBus) musicBus.gain.setTargetAtTime(targetMusic(), ctx.currentTime, 0.03);
  },

  setSfxVolume(v) {
    vol.sfx = Math.min(1, Math.max(0, v));
    save();
    if (sfxBus) sfxBus.gain.setTargetAtTime(vol.sfx, ctx.currentTime, 0.03);
  },

  getMusicVolume() { return vol.music; },
  getSfxVolume() { return vol.sfx; },

  playMusic(name) {
    if (!ensure()) return;
    if (!TRACKS[name]) return;
    if (current && current.name === name) return;
    const t = ctx.currentTime;
    if (current) {
      const old = current;
      old.bus.gain.cancelScheduledValues(t);
      old.bus.gain.setValueAtTime(old.bus.gain.value, t);
      old.bus.gain.linearRampToValueAtTime(0.0001, t + 0.8);
      setTimeout(() => { try { old.bus.disconnect(); } catch (e) {} }, 1400);
    }
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, t);
    bus.gain.linearRampToValueAtTime(TRACKS[name].level, t + 1.2);
    bus.connect(musicBus);
    current = { name, bus, step: 0, next: t + 0.08 };
    if (!timer) timer = setInterval(pump, 30);
  },

  stopMusic() {
    if (current) {
      const old = current;
      old.bus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      setTimeout(() => { try { old.bus.disconnect(); } catch (e) {} }, 900);
      current = null;
    }
  },

  duck(on) {
    ducked = on;
    if (musicBus) musicBus.gain.setTargetAtTime(targetMusic(), ctx.currentTime, 0.08);
  },

  suspend() { if (ctx && ctx.state === "running") ctx.suspend(); },
  resume() { if (ctx && ctx.state === "suspended") ctx.resume(); },

  click() {
    if (!ensure() || vol.sfx <= 0) return;
    tone(sfxBus, { f: 1200, to: 700, dur: 0.05, type: "sine", v: 0.12 });
  },

  hover() {
    if (!ctx || ctx.state !== "running" || vol.sfx <= 0) return;
    tone(sfxBus, { f: 1500, to: 2100, dur: 0.05, type: "sine", v: 0.055, a: 0.003 });
    tone(sfxBus, { f: 3000, to: 3600, dur: 0.03, type: "sine", v: 0.015, a: 0.002 });
  },

  denied() {
    if (!ensure() || vol.sfx <= 0) return;
    tone(sfxBus, { f: 220, to: 150, dur: 0.14, type: "square", v: 0.09, lp: 900 });
    tone(sfxBus, { f: 220, to: 150, dur: 0.14, type: "square", v: 0.09, lp: 900, at: 0.11 });
  },

  tick() {
    if (!ensure()) return;
    tone(sfxBus, { f: 880, dur: 0.12, type: "sine", v: 0.28, a: 0.003 });
    tone(sfxBus, { f: 1760, dur: 0.06, type: "sine", v: 0.08, a: 0.003 });
  },

  go() {
    if (!ensure()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(sfxBus, { f, dur: 0.45, type: "triangle", v: 0.2, at: i * 0.06, lp: 4000 });
      tone(sfxBus, { f: f * 2, dur: 0.3, type: "sine", v: 0.05, at: i * 0.06 });
    });
    noise(sfxBus, { dur: 0.5, v: 0.1, type: "bandpass", freq: 600, to: 5000, q: 1.2 });
  },

  correct() {
    if (!ensure()) return;
    [659.25, 830.61, 987.77, 1318.5].forEach((f, i) => {
      tone(sfxBus, { f, dur: 0.35, type: "sine", v: 0.22, at: i * 0.065, a: 0.003 });
      tone(sfxBus, { f: f * 2.01, dur: 0.18, type: "sine", v: 0.05, at: i * 0.065 });
    });
  },

  wrong() {
    if (!ensure()) return;
    tone(sfxBus, { f: 190, to: 95, dur: 0.38, type: "sawtooth", v: 0.2, lp: 700 });
    tone(sfxBus, { f: 140, to: 70, dur: 0.38, type: "square", v: 0.08, lp: 500, at: 0.02 });
  },

  shoot() {
    if (!ensure()) return;
    tone(sfxBus, { f: 1600, to: 180, dur: 0.28, type: "sawtooth", v: 0.14, lp: 3500 });
    tone(sfxBus, { f: 800, to: 90, dur: 0.28, type: "sine", v: 0.2 });
    noise(sfxBus, { dur: 0.3, v: 0.12, type: "bandpass", freq: 4000, to: 500, q: 1 });
  },

  hit() {
    if (!ensure()) return;
    tone(sfxBus, { f: 170, to: 38, dur: 0.38, type: "sine", v: 0.6, a: 0.002 });
    noise(sfxBus, { dur: 0.28, v: 0.4, freq: 2600, to: 300 });
    tone(sfxBus, { f: 520, to: 120, dur: 0.14, type: "square", v: 0.07, lp: 1800 });
  },

  timeout() {
    if (!ensure()) return;
    [440, 329.63, 246.94].forEach((f, i) => {
      tone(sfxBus, { f, dur: 0.3, type: "triangle", v: 0.2, at: i * 0.14, lp: 2200 });
    });
  },

  win() {
    if (!ensure()) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      tone(sfxBus, { f, dur: 0.5, type: "triangle", v: 0.2, at: i * 0.11, lp: 5000 });
      tone(sfxBus, { f: f / 2, dur: 0.5, type: "sine", v: 0.1, at: i * 0.11 });
    });
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
      tone(sfxBus, { f, dur: 1.5, type: "sawtooth", v: 0.05, at: 0.6, a: 0.02, lp: 2200 });
      tone(sfxBus, { f, dur: 1.5, type: "sine", v: 0.1, at: 0.6, a: 0.02 });
    });
    noise(sfxBus, { dur: 0.9, v: 0.06, at: 0.55, type: "highpass", freq: 6000 });
  },
};

document.addEventListener("visibilitychange", () => {
  if (document.hidden) Sound.suspend();
  else Sound.resume();
});