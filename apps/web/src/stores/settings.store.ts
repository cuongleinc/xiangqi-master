import { create } from 'zustand';

interface SettingsStoreState {
  difficulty: string;
  soundEnabled: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  flipBoard: boolean;

  setDifficulty: (d: string) => void;
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
      soundEnabled: state.soundEnabled,
      showLegalMoves: state.showLegalMoves,
      showCoordinates: state.showCoordinates,
      flipBoard: state.flipBoard,
    }));
  } catch { /* ignore */ }
}

const saved = loadSettings();

export const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  difficulty: saved.difficulty || 'medium',
  soundEnabled: saved.soundEnabled ?? false,
  showLegalMoves: saved.showLegalMoves ?? true,
  showCoordinates: saved.showCoordinates ?? true,
  flipBoard: saved.flipBoard ?? false,

  setDifficulty: (d) => { set({ difficulty: d }); saveSettings(get()); },
  toggleSound: () => { set({ soundEnabled: !get().soundEnabled }); saveSettings(get()); },
  toggleLegalMoves: () => { set({ showLegalMoves: !get().showLegalMoves }); saveSettings(get()); },
  toggleCoordinates: () => { set({ showCoordinates: !get().showCoordinates }); saveSettings(get()); },
  toggleFlip: () => { set({ flipBoard: !get().flipBoard }); saveSettings(get()); },
}));
