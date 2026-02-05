import api from './axiosInstance';

export const ClientAPI = {
  getClients: (page = 1) => api.get('/clients', { params: { page } }),
  getLocalClients: (params = {}) =>
    api.get('/clients/local-clients', { params }),
  getLocalClient: (id) =>
    api.get(`/clients/local-clients/${id}`),  // Fixed
  createLocalClient: (data) =>
    api.post('/clients/local-clients', data),
  updateLocalClient: (id, data) =>
    api.put(`/clients/local-clients/${id}`, data),  // Fixed
  deleteLocalClient: (id) =>
    api.delete(`/clients/local-clients/${id}`),  // Fixed

  getUnitCost: (data) =>
    api.post('/clients/local-clients/unit-cost', data),
};