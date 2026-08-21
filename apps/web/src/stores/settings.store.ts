import { create } from 'zustand';
import type { MatchType } from '@repo/shared';

interface SettingsStoreState {
  difficulty: string;
  matchType: MatchType;
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  flipBoard: boolean;

  setDifficulty: (d: string) => void;
  setMatchType: (m: MatchType) => void;
  toggleSound: () => void;
  toggleLegalMoves: () => void;
  toggleCoordinates: () => void;
  toggleFlip: () => void;
}

const STORAGE_KEY = 'xiangqi-settings';

function loadSettings(): Partial<SettingsStoreState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveSettings(state: Partial<SettingsStoreState>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      difficulty: state.difficulty,
      matchType: state.matchType,
      soundEnabled: state.soundEnabled,
      showLegalMoves: state.showLegalMoves,
      showCoordinates: state.showCoordinates,
      flipBoard: state.flipBoard,
    }));
  } catch { /* ignore */ }
}

const saved = loadSettings();

// Stale localStorage from the removed online-PvP mode can hold 'pvp' — fall back to 'pvc'
const rawMatchType = saved.matchType as string | undefined;
const savedMatchType: MatchType =
  rawMatchType === 'pvc' || rawMatchType === 'cvc' || rawMatchType === 'analysis'
    ? rawMatchType
    : 'pvc';

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  difficulty: saved.difficulty || 'medium',
  matchType: savedMatchType,
  soundEnabled: saved.soundEnabled ?? false,
  showLegalMoves: saved.showLegalMoves ?? true,
  showCoordinates: saved.showCoordinates ?? true,
  flipBoard: saved.flipBoard ?? false,

  setDifficulty: (d) => { set({ difficulty: d }); saveSettings(get()); },
  setMatchType: (m) => { set({ matchType: m }); saveSettings(get()); },
  toggleSound: () => { set({ soundEnabled: !get().soundEnabled }); saveSettings(get()); },
  toggleLegalMoves: () => { set({ showLegalMoves: !get().showLegalMoves }); saveSettings(get()); },
  toggleCoordinates: () => { set({ showCoordinates: !get().showCoordinates }); saveSettings(get()); },
  toggleFlip: () => { set({ flipBoard: !get().flipBoard }); saveSettings(get()); },
}));
