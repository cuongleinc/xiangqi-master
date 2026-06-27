import apiClient from './client';

export const analysisApi = {
  evaluate: (fen: string) =>
    apiClient.post('/analysis/evaluate', { fen }).then((r) => r.data),

  bestMove: (fen: string, movetime?: number) =>
    apiClient.post('/analysis/best-move', { fen, movetime }).then((r) => r.data),

  getReview: (gameId: string) =>
    apiClient.get(`/analysis/review/${gameId}`).then((r) => r.data),
};
