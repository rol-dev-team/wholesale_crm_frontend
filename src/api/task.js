import api from "./axiosInstance";

export const TaskAPI = {
  /* -------------------- GET TASK LIST -------------------- */
  // supports pagination, filters, search
  getTasks: (params = {}) => api.get("/tasks", { params }),

  /* -------------------- GET SINGLE TASK -------------------- */
  getTask: (id) => api.get(`/tasks/${id}`),

  /* -------------------- CREATE TASK -------------------- */
  createTask: (payload) => api.post("/tasks", payload),

  /* -------------------- UPDATE TASK -------------------- */
  updateTask: (id, payload) => api.put(`/tasks/${id}`, payload),

  /* -------------------- DELETE TASK -------------------- */
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};
