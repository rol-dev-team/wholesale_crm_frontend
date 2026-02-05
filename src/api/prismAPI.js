// src/api/prisomAPI.js
import api from './axiosInstance'; // same axios instance

export const PrismAPI = {
  // 1️⃣ Branch List
  getBranchList: () => api.get('/prism/branch-list'),

  // 2️⃣ Branch Wise Supervisor List
  getBranchWiseSupervisorList: (branchId) =>
    api.get(`/prism/branch-wise-supervisor-list/${branchId}`),

  getKamWiseSupervisorList: (kamId) => api.get(`/prism/kam-wise-supervisor-list/${kamId}`),

  getSupervisorWiseKAMList: (supervisorId) =>
    api.get(`/prism/supervisor-wise-kam-list/${supervisorId}`),

  // 3️⃣ Supervisor Wise KAM List
  getSupervisorWiseKAMList: (supervisorId) =>
    api.get(`/prism/supervisor-wise-kam-list/${supervisorId}`),

  getKams: () => api.get('/prism/kam-list'),
  getKamWiseClients: (kamId) => api.get(`/prism/kam-wise-client-list/${kamId}`),
  // 6️⃣ Supervisor List (new)
  getSupervisors: () => api.get('/prism/supervisor-list'),
  getMultiSupervisorWiseKAMList: (supervisorIds) =>
    api.post('/prism/multi-supervisor-wise-kam-list', { supervisor_ids: supervisorIds }),
  getProductList: () => api.post('/prism/product-list'),
  getClientList: () => api.get('/prism/client-list'),
  getLocalClientsByKAM: (kamIds) => api.post('/prism/local-clients', { kam_ids: kamIds }),
  getAllLocalClients: () => api.get('/prism/all-local-clients'),
};
