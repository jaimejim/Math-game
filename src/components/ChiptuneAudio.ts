/**
 * 8-bit chiptune music engine using Web Audio API.
 * Generates retro Mario-style background music, plus SFX
 * for correct answers, wrong answers, and winning.
 * No audio files needed — everything is synthesized.
 */

type OscType = OscillatorType;

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bgmTimeout: ReturnType<typeof setTimeout> | null = null;
let bgmPlaying = false;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function getGain(): GainNode {
  getCtx();
  return masterGain!;
}

/** Play a single tone for a given duration */
function playTone(
  freq: number,
  duration: number,
  type: OscType = "square",
  volume = 0.3,
  delay = 0,
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay + duration - 0.02);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(getGain());

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// ── Note frequencies (octave 4-5) ──
const NOTE: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
  G5: 784.00, A5: 880.00, B5: 987.77, C6: 1046.50,
  // Sharps
  Cs4: 277.18, Ds4: 311.13, Fs4: 369.99, Gs4: 415.30, As4: 466.16,
  Cs5: 554.37, Ds5: 622.25, Fs5: 739.99, Gs5: 830.61, As5: 932.33,
};

// ── Background music: a catchy looping melody ──
// Inspired by classic platformer style — upbeat and bouncy

interface MelodyNote {
  note: string;
  dur: number; // in beats
}

const BPM = 160;
const BEAT = 60 / BPM; // seconds per beat

const melody: MelodyNote[] = [
  // Phrase 1 (ascending bounce)
  { note: "E5", dur: 0.5 }, { note: "E5", dur: 0.5 }, { note: "E5", dur: 1 },
  { note: "C5", dur: 0.5 }, { note: "E5", dur: 0.5 }, { note: "G5", dur: 1 },
  { note: "G4", dur: 1 },
  // Phrase 2
  { note: "C5", dur: 1 }, { note: "G4", dur: 0.5 }, { note: "E4", dur: 1 },
  { note: "A4", dur: 0.5 }, { note: "B4", dur: 0.5 }, { note: "As4", dur: 0.5 },
  { note: "A4", dur: 0.5 },
  // Phrase 3 (quick run)
  { note: "G4", dur: 0.5 }, { note: "E5", dur: 0.5 }, { note: "G5", dur: 0.5 },
  { note: "A5", dur: 0.5 }, { note: "F5", dur: 0.5 }, { note: "G5", dur: 0.5 },
  { note: "E5", dur: 0.5 }, { note: "C5", dur: 0.5 }, { note: "D5", dur: 0.5 },
  { note: "B4", dur: 0.5 },
];

const bass: MelodyNote[] = [
  { note: "C4", dur: 1 }, { note: "G4", dur: 1 }, { note: "C4", dur: 1 },
  { note: "G4", dur: 0.5 }, { note: "E4", dur: 0.5 },
  { note: "C4", dur: 1 }, { note: "F4", dur: 1 }, { note: "G4", dur: 1 },
  { note: "C4", dur: 0.5 }, { note: "E4", dur: 0.5 },
  { note: "A4", dur: 1 }, { note: "G4", dur: 1 },
  { note: "F4", dur: 0.5 }, { note: "E4", dur: 0.5 }, { note: "D4", dur: 0.5 },
  { note: "C4", dur: 0.5 }, { note: "G4", dur: 1 },
  { note: "C4", dur: 1 }, { note: "G4", dur: 0.5 }, { note: "C4", dur: 0.5 },
];

function playMelodyLoop() {
  if (!bgmPlaying) return;

  let time = 0;
  // Lead melody
  for (const n of melody) {
    const freq = NOTE[n.note];
    if (freq) playTone(freq, n.dur * BEAT * 0.85, "square", 0.25, time);
    time += n.dur * BEAT;
  }

  // Bass line (triangle wave, lower volume)
  let bassTime = 0;
  for (const n of bass) {
    const freq = NOTE[n.note];
    if (freq) playTone(freq * 0.5, n.dur * BEAT * 0.9, "triangle", 0.18, bassTime);
    bassTime += n.dur * BEAT;
  }

  // Loop
  const loopLen = time;
  bgmTimeout = setTimeout(() => playMelodyLoop(), loopLen * 1000);
}

/** Start background music (call on user interaction to satisfy autoplay policy) */
export function startBGM() {
  if (bgmPlaying) return;
  getCtx();
  bgmPlaying = true;
  playMelodyLoop();
}

/** Stop background music */
export function stopBGM() {
  bgmPlaying = false;
  if (bgmTimeout) {
    clearTimeout(bgmTimeout);
    bgmTimeout = null;
  }
}

/** SFX: correct answer — short happy ascending arpeggio */
export function playCorrectSFX() {
  playTone(NOTE.E5, 0.08, "square", 0.35, 0);
  playTone(NOTE.G5, 0.08, "square", 0.35, 0.08);
  playTone(NOTE.C6, 0.12, "square", 0.35, 0.16);
}

/** SFX: wrong answer — descending buzz */
export function playWrongSFX() {
  playTone(NOTE.E4, 0.12, "sawtooth", 0.3, 0);
  playTone(NOTE.C4, 0.18, "sawtooth", 0.3, 0.1);
}

/** SFX: winner fanfare */
export function playWinSFX() {
  const fanfare = [
    { note: "C5", t: 0 }, { note: "E5", t: 0.12 }, { note: "G5", t: 0.24 },
    { note: "C6", t: 0.36 }, { note: "E5", t: 0.52 }, { note: "G5", t: 0.64 },
    { note: "C6", t: 0.76 },
  ];
  for (const n of fanfare) {
    playTone(NOTE[n.note], 0.15, "square", 0.35, n.t);
  }
}

/** Set master volume (0-1) */
export function setVolume(v: number) {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, v));
  }
}
