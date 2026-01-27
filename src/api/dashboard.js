import api from './axiosInstance';

export const DashboardAPI = {
  getAdminSummary: (params = {}) => api.get('/dashboard/admin/summary', { params }),
  getAdminKpiSummary: (params = {}) => api.get('/dashboard/admin/kpi/summary', { params }),
};
