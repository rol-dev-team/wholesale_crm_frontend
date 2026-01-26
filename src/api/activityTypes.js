import api from './axiosInstance';

export const ActivityTypeAPI = {
  // GET activity types (list)
  getActivityTypes: (params = {}) =>
    api.get('/activity-types', { params }),

  // GET single activity type
  getActivityType: (id) =>
    api.get(`/activity-types/${id}`),

  // CREATE activity type
  createActivityType: (payload) =>
    api.post('/activity-types', payload),

  // UPDATE activity type
  updateActivityType: (id, payload) =>
    api.put(`/activity-types/${id}`, payload),

  // DELETE activity type
  deleteActivityType: (id) =>
    api.delete(`/activity-types/${id}`),
};
