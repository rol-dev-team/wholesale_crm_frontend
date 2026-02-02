import api from './axiosInstance';

export const LabelApi = {
  
  getLabels: (params = {}) => api.get('/labels', { params }),

  
  getLabel: (id) => api.get(`/labels/${id}`),

  
  createLabel: (data) => api.post('/labels', data),

 
  updateLabel: (id, data) => api.put(`/labels/${id}`, data),


  deleteLabel: (id) => api.delete(`/labels/${id}`),


  getSystemUsers: (params = {}) => api.get(`/system-users`, { params }),

  
};


