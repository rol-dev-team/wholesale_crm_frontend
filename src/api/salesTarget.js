import api from './axiosInstance';

export const SalesTargetAPI = {
  getAll: (params) => api.get('/sales-targets', { params }),
  getById: (id) => api.get(`/sales-targets/${id}`),
  create: (payload) => api.post('/sales-targets', payload),
  update: (id, payload) => api.put(`/sales-targets/${id}`, payload),
  delete: (id) => api.delete(`/sales-targets/${id}`),
};
