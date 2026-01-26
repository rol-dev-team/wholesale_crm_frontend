import api from './axiosInstance';

export const KamPerformanceApi = {
  getKamUsersRevenue: (params = {}) => api.get('/kam-performance', { params }),
  getKams: () => api.get('/prism/kam-list'),
};
