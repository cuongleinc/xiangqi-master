import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../stores/settings.store';

// ─── Track registry ───
const TRACKS: Record<string, string> = {
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
let hasUserGesture = false;

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

  // Start playback if paused (browser may block until user gesture)
  if (audio.paused) {
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
    }
  }, FADE_MS / steps);
}

function stopAndReset(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 0;
}

/**
 * BackgroundMusic — plays looping background music based on the current screen.
 *
 * - Crossfades between tracks when the screen changes.
 * - Respects `soundEnabled` from settings (fades to 0 when off).
 * - Handles browser autoplay restrictions: retries on first user click/keypress.
 */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ screen }) => {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  // Keep a ref to soundEnabled so the one-time interaction listener sees the
  // latest value without needing to re-register.
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const src = TRACKS[screen];
  const targetVol = soundEnabled ? VOLUME : 0;

  // ─── Crossfade when screen or soundEnabled changes ───
  useEffect(() => {
    if (activeSrc !== src) {
      // Fade out (and eventually stop) the PREVIOUS track so it doesn't
      // keep playing in the background forever.
      const prevAudio = activeSrc ? audioCache[activeSrc] : null;
      if (prevAudio && activeSrc !== src) {
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
      const audio = getOrCreateAudio(src);
      if (audio.paused) {
        audio.play().catch(() => {});
      }
      fadeTo(src, targetVol);
    }
  }, [src, targetVol]);

  // ─── One-time user-gesture listener (browser autoplay policy) ───
  useEffect(() => {
    if (hasUserGesture) return;

    const onGesture = () => {
      hasUserGesture = true;
      // Retry playback for the currently-active track using latest soundEnabled
      const currentAudio = activeSrc ? audioCache[activeSrc] : null;
      if (currentAudio && currentAudio.paused) {
        const vol = soundEnabledRef.current ? VOLUME : 0;
        currentAudio.volume = 0;
        currentAudio.play().then(() => {
          fadeTo(activeSrc!, vol);
        }).catch(() => {});
      }
      document.removeEventListener('click', onGesture);
      document.removeEventListener('keydown', onGesture);
    };

    document.addEventListener('click', onGesture);
    document.addEventListener('keydown', onGesture);
    return () => {
      document.removeEventListener('click', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
  }, []); // <-- intentionally empty: register once, use ref for latest state

  // ─── Cleanup: only when the entire app unmounts (e.g. hot reload) ───
  useEffect(() => {
    return () => {
      // Don't stop tracks on normal unmount — the module-level singletons
      // persist across screen transitions. Only the browser tab close /
      // hard page navigation truly cleans up.
    };
  }, []);

  return null;
};
