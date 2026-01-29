// // src/api/prisomAPI.js
// import api from './axiosInstance'; // same axios instance

// export const PrismAPI = {
//   // 1️⃣ Branch List
//   getBranchList: () => api.get('/prism/branch-list'),

//   // 2️⃣ Branch Wise Supervisor List
//   getBranchWiseSupervisorList: (branchId) =>
//     api.get(`/prism/branch-wise-supervisor-list/${branchId}`),
//   getSupervisorWiseKAMList: (supervisorId) =>
//     api.get(`/prism/supervisor-wise-kam-list/${supervisorId}`),

//   // 3️⃣ Supervisor Wise KAM List
//   getSupervisorWiseKAMList: (supervisorId) =>
//     api.get(`/prism/supervisor-wise-kam-list/${supervisorId}`),

//   getKams: () => api.get('/prism/kam-list'),
//   getKamWiseClients: (kamId) => api.get(`/prism/kam-wise-client-list/${kamId}`),
//   // 6️⃣ Supervisor List (new)
//   getSupervisors: () => api.get('/prism/supervisor-list'),
//   getMultiSupervisorWiseKAMList: (supervisorIds) =>
//     api.post('/prism/multi-supervisor-wise-kam-list', { supervisor_ids: supervisorIds }),
// };

// src/api/prisomAPI.js
import api from './axiosInstance'; // same axios instance

export const PrismAPI = {
  // 1️⃣ Branch List
  getBranchList: () => api.get('/prism/branch-list'),

  // 2️⃣ Branch Wise Supervisor List
  getBranchWiseSupervisorList: (branchId) =>
    api.get(`/prism/branch-wise-supervisor-list/${branchId}`),

  // 3️⃣ Supervisor Wise KAM List
  getSupervisorWiseKAMList: (supervisorId) =>
    api.get(`/prism/supervisor-wise-kam-list/${supervisorId}`),

  // 4️⃣ KAM List
  getKams: () => api.get('/prism/kam-list'),

  // 5️⃣ KAM Wise Clients
  getKamWiseClients: (kamId) =>
    api.get(`/prism/kam-wise-client-list/${kamId}`),

  // 6️⃣ Supervisor List
  getSupervisors: () => api.get('/prism/supervisor-list'),

  // 7️⃣ Multi Supervisor Wise KAM List
  getMultiSupervisorWiseKAMList: (supervisorIds) =>
    api.post('/prism/multi-supervisor-wise-kam-list', {
      supervisor_ids: supervisorIds,
    }),

  // ✅ 8️⃣ Client List (NEW API ADDED)
  getTotalClientList: () => api.get('/prism/client-list'),
};

