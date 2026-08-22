import { create } from 'zustand';
import { analysisApi } from '../api/analysis.api';
import type { MoveClassification } from '@repo/shared';

interface AnalysisStoreState {
  evaluation: number | null;
  bestMove: string | null;
  depth: number | null;
  pv: string[];
  lastClassification: MoveClassification | null;
  isEvaluating: boolean;
  _requestId: number;

  evaluatePosition: (fen: string) => Promise<void>;
  setEvaluationManually: (score: number, depth: number, pv: string[]) => void;
  setClassification: (c: MoveClassification | null) => void;
  clear: () => void;
}

export const useAnalysisStore = create<AnalysisStoreState>((set, get) => ({
  evaluation: null,
  bestMove: null,
  depth: null,
  pv: [],
  lastClassification: null,
  isEvaluating: false,
  _requestId: 0,

  evaluatePosition: async (fen: string) => {
    const id = get()._requestId + 1;
    set({ isEvaluating: true, _requestId: id });
    try {
      const data = await analysisApi.evaluate(fen);
      // Only apply if no newer request was made (fixes stale-response race)
      if (get()._requestId === id) {
        set({
          evaluation: data.score,
          bestMove: data.pv?.[0] || null,
          depth: data.depth,
          pv: data.pv || [],
          isEvaluating: false,
        });
      }
    } catch {
      if (get()._requestId === id) {
        set({ isEvaluating: false });
      }
    }
  },

  setEvaluationManually: (score, depth, pv) => set({
    evaluation: score,
    depth,
    pv,
  }),

  setClassification: (c) => set({ lastClassification: c }),

  clear: () => set({
    evaluation: null,
    bestMove: null,
    depth: null,
    pv: [],
    lastClassification: null,
    isEvaluating: false,
  }),
}));
