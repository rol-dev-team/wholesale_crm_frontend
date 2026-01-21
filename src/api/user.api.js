import api from './axiosInstance';

export const UserAPI = {
  // GET users with pagination & search
  getUsers: (params = {}) => api.get('/users', { params }),

  // GET single user
  getUser: (id) => api.get(`/users/${id}`),

  // CREATE user
  createUser: (payload) => api.post('/users', payload),

  // UPDATE user
  updateUser: (id, payload) => api.put(`/users/${id}`, payload),

  // DELETE user
  deleteUser: (id) => api.delete(`/users/${id}`),
};
