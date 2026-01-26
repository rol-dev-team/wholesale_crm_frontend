import api from './axiosInstance';

export const KamPerformanceApi = {
  getKamUsersRevenue: (params = {}) => api.get('/kam-performance', { params }),
};
