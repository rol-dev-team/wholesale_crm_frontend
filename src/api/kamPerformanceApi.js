import api from './axiosInstance';

export const KamPerformanceApi = {
  getKamUsersRevenue: (params = {}) => api.get('/kam-performance', { params }),
  getKams: () => api.get('/kam-performance/kam-list'),
  getSupervisorWiseKAMList: (supervisorId) => api.get(`/kam-performance/supervisor-wise-kam-list/${supervisorId}`),
};
