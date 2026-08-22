import React, { useEffect } from 'react';
import { useSettingsStore } from '../../stores/settings.store';

// ─── Track registry ───
const TRACKS: Record<'welcome' | 'main', string> = {
  welcome: '/welcome_screen_bg_song.mp3',
  main: '/main_screen_bg_song.mp3',
};

interface BackgroundMusicProps {
  screen: 'welcome' | 'main';
}

const FADE_MS = 1200;
const VOLUME = 0.45;

// ─── Module-level singletons (survive React hot reload & unmount/remount) ───
const audioCache: Record<string, HTMLAudioElement> = {};
let activeSrc: string | null = null;
let activeFade: ReturnType<typeof setInterval> | null = null;

function getOrCreateAudio(src: string): HTMLAudioElement {
  if (!audioCache[src]) {
    const a = new Audio(src);
    a.loop = true;
    a.preload = 'auto';
    a.volume = 0;
    audioCache[src] = a;
  }
  return audioCache[src];
}

function clearFade() {
  if (activeFade !== null) {
    clearInterval(activeFade);
    activeFade = null;
  }
}

function fadeTo(src: string, targetVol: number) {
  clearFade();
  const audio = getOrCreateAudio(src);
  activeSrc = src;

  const startVol = audio.volume;
  const steps = 24;
  let step = 0;

  // Start playback if paused. Browsers (especially iOS Safari) may reject
  // play() outside a user gesture — retryPlayer() covers that on real gestures.
  if (audio.paused && targetVol > 0) {
    audio.play().catch(() => {});
  }

  activeFade = setInterval(() => {
    step++;
    const t = step / steps;
    // ease-out quad
    audio.volume = startVol + (targetVol - startVol) * (1 - (1 - t) * (1 - t));
    if (step >= steps) {
      clearInterval(activeFade!);
      activeFade = null;
      audio.volume = targetVol;
      // Don't keep playing silently at volume 0 — pause and free the audio session
      if (targetVol === 0) audio.pause();
    }
  }, FADE_MS / steps);
}

function stopAndReset(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 0;
}

/**
 * Retry starting the active track. MUST run synchronously inside a user
 * gesture (click/keydown) — browsers only allow audio playback from a
 * gesture, and effect-driven play() calls are rejected (especially iOS).
 * Reads the store directly so it always sees the latest soundEnabled value.
 */
export function retryPlayer() {
  const audio = activeSrc ? audioCache[activeSrc] : null;
  if (!audio || !audio.paused) return;
  const want = useSettingsStore.getState().soundEnabled ? VOLUME : 0;
  if (want === 0) return;
  audio.volume = 0;
  audio.play()
    .then(() => {
      // Re-check: the user may have toggled off while play() was pending
      const wantNow = useSettingsStore.getState().soundEnabled ? VOLUME : 0;
      if (wantNow > 0) {
        fadeTo(activeSrc!, wantNow);
      } else {
        audio.volume = 0;
        audio.pause();
      }
    })
    .catch(() => {});
}

/**
 * BackgroundMusic — plays looping background music based on the current screen.
 *
 * - Crossfades between tracks when the screen changes.
 * - Respects `soundEnabled` from settings (fades to 0 and pauses when off).
 * - Handles browser autoplay restrictions: retries play() on every user
 *   gesture while the active track is paused but should be audible.
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ screen }) => {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const src = TRACKS[screen];
  const targetVol = soundEnabled ? VOLUME : 0;

  // ─── Crossfade when screen or soundEnabled changes ───
  useEffect(() => {
    if (activeSrc !== src) {
      // Fade out (and eventually stop) the PREVIOUS track so it doesn't
      // keep playing in the background forever.
      const prevAudio = activeSrc ? audioCache[activeSrc] : null;
      if (prevAudio) {
        const prevStart = prevAudio.volume;
        const prevSteps = 20;
        let prevStep = 0;
        const prevFade = setInterval(() => {
          prevStep++;
          prevAudio.volume = Math.max(0, prevStart * (1 - prevStep / prevSteps));
          if (prevStep >= prevSteps) {
            clearInterval(prevFade);
            stopAndReset(prevAudio);
          }
        }, FADE_MS / prevSteps);
      }
      fadeTo(src, targetVol);
    } else {
      // Same track — just adjust volume
      fadeTo(src, targetVol);
    }
  }, [src, targetVol]);

  // ─── Persistent user-gesture retry (browser autoplay policy) ───
  // The one-time listener pattern fails: after the first click it's gone, and
  // any later play() from an effect is rejected — so toggling music on after
  // starting a game would stay silent. Retry on EVERY gesture instead; the
  // checks inside retryPlayer make it a no-op once the track is playing.
  useEffect(() => {
    const onGesture = () => retryPlayer();
    document.addEventListener('click', onGesture);
    document.addEventListener('keydown', onGesture);
    return () => {
      document.removeEventListener('click', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
  }, []);

  return null;
};
