// src/api/authAPI.js
import api from './axiosInstance';

export const AuthAPI = {
  /**
   * Login user
   * @param {Object} payload - { username, password }
   * @returns {Promise} - response from backend
   */
  login: (payload) => api.post('/login', payload),

  /**
   * Logout user
   * @returns {Promise} - response from backend
   */
  logout: () => api.post('/logout'),

  /**
   * Get current logged-in user
   * @returns {Promise} - response from backend
   */
  getCurrentUser: () => api.get('/user'),
};

export default AuthAPI;
