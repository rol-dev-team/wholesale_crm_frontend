import api from './axiosInstance';

export const LabelApi = {
  
  getLabels: (params = {}) => api.get('/levels', { params }),

  
  getLabel: (id) => api.get(`/levels/${id}`),

  
  createLabel: (data) => api.post('/levels', data),

 
  updateLabel: (id, data) => api.put(`/levels/${id}`, data),


  deleteLabel: (id) => api.delete(`/levels/${id}`),


  getSystemUsers: (params = {}) => api.get(`/system-users`, { params }),

  
};


