import React from 'react';
import { useSettingsStore } from '../../stores/settings.store';
import { retryPlayer } from './BackgroundMusic';

/**
 * Speaker icon — matches the gold/cream aesthetic of the UI.
 * Styled consistently with LanguageSwitcher: gold glow when active, dim when off.
 */
const SpeakerOn = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const SpeakerOff = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

/**
 * MusicToggle — a small icon button to enable/disable background music.
 * Matches the LanguageSwitcher aesthetic: gold border/glow when active,
 * dim/transparent when off. Sits naturally alongside other header controls.
 */
export const MusicToggle: React.FC = () => {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);

  // Toggle, then — when enabling — kick off playback synchronously inside
  // this very click (a user gesture), since effect-driven play() is blocked
  // by browser autoplay policies (iOS Safari especially).
  const handleClick = () => {
    const next = !soundEnabled;
    toggleSound();
    if (next) retryPlayer();
  };

  return (
    <button
      onClick={handleClick}
      title={soundEnabled ? 'Mute music' : 'Enable music'}
      className={`px-2.5 py-1.5 rounded-md transition-all duration-200 ${
        soundEnabled
          ? 'bg-gold/25 text-gold-light border border-gold/60'
          : 'text-cream-dim/40 hover:text-cream-dim/80 border border-transparent hover:border-gold/25 hover:scale-110'
      }`}
      style={
        soundEnabled
          ? { boxShadow: '0 0 8px rgba(212,168,67,0.25)' }
          : undefined
      }
    >
      {soundEnabled ? <SpeakerOn /> : <SpeakerOff />}
    </button>
  );
};
