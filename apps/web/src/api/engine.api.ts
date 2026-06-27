import apiClient from './client';

export const engineApi = {
  getStatus: () =>
    apiClient.get('/engine/status').then((r) => r.data),
};
