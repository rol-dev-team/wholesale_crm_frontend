// src/api/prisomAPI.js
import api from './axiosInstance'; // same axios instance

export const PrismAPI = {
  // 1️⃣ Branch List
  getBranchList: () => api.get('/prism/branch-list'),

  // 2️⃣ Branch Wise Supervisor List
  getBranchWiseSupervisorList: (branchId) =>
    api.get(`/prism/branch-wise-supervisor-list/${branchId}`),
  getSupervisorWiseKAMList: (supervisorId) =>
    api.get(`/prism/supervisor-wise-kam-list/${supervisorId}`),

  // 3️⃣ Supervisor Wise KAM List
  getSupervisorWiseKAMList: (supervisorId) =>
    api.get(`/prism/supervisor-wise-kam-list/${supervisorId}`),

  getKams: () => api.get('/prism/kam-list'),
  getKamWiseClients: (kamId) => api.get(`/prism/kam-wise-client-list/${kamId}`),
  // 6️⃣ Supervisor List (new)
  getSupervisors: () => api.get('/prism/supervisor-list'),
};
