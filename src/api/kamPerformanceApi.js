import api from './axiosInstance';

export const KamPerformanceApi = {
  getKamUsers: (params = {}) => api.get('/kam-performance', { params }),
};
