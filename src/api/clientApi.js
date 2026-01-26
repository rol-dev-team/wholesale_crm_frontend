import api from './axiosInstance';

export const ClientAPI = {
  getClients: () => api.get('/clients'),
};
