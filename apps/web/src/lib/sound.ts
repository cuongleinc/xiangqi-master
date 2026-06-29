// ─── Sound Engine — synthesized wooden percussion using Web Audio API ───

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function woodClick(duration: number, freq: number, gain: number, filterFreq: number) {
  const c = ctx();
  const now = c.currentTime;

  // Noise burst → short percussive wooden click
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const t = i / c.sampleRate;
    const env = Math.exp(-t / (duration * 0.15));
    data[i] = (Math.random() * 2 - 1) * env * gain;
  }

  const source = c.createBufferSource();
  source.buffer = buffer;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.7;

  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(gain * 0.5, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(c.destination);
  source.start(now);
  source.stop(now + duration);
}

// ─── Exported sound functions ───

/** Piece placed on board — short wooden click, ~40ms */
export function playPiecePlace() {
  woodClick(0.04, 800, 0.6, 1200);
}

/** Piece lifted — subtle friction slide, ~30ms */
export function playPieceLift() {
  woodClick(0.03, 2000, 0.2, 3000);
}

/** King in check — deeper resonant knock, ~80ms */
export function playCheck() {
  const c = ctx();
  const now = c.currentTime;
  // Two quick knocks
  woodClick(0.08, 400, 0.7, 600);
  setTimeout(() => woodClick(0.06, 350, 0.5, 500), 100);
}

/** Piece captured — sharper impact clack, ~60ms */
export function playCapture() {
  woodClick(0.06, 600, 0.8, 1800);
  // Higher-pitched secondary tap
  setTimeout(() => woodClick(0.03, 1200, 0.3, 2500), 30);
}

/** Game over — ceremonial double-tap ~200ms apart */
export function playGameOver() {
  woodClick(0.1, 300, 0.9, 500);
  setTimeout(() => woodClick(0.08, 250, 0.7, 400), 200);
}
