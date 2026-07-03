import apiClient from './client';

export const gameApi = {
  createGame: (difficulty: string = 'medium', matchType: string = 'pvc') =>
    apiClient.post('/games', { difficulty, matchType }).then((r) => r.data),

  getGame: (id: string) =>
    apiClient.get(`/games/${id}`).then((r) => r.data),

  makeMove: (gameId: string, uci: string) =>
    apiClient.post(`/games/${gameId}/move`, { uci }).then((r) => r.data),

  getHint: (gameId: string) =>
    apiClient.post(`/games/${gameId}/hint`).then((r) => r.data),

  getMoves: (gameId: string) =>
    apiClient.get(`/games/${gameId}/moves`).then((r) => r.data),
};
