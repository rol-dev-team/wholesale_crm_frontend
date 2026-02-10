import api from './axiosInstance';

export const PriceProposalAPI = {
  /**
   * Create a new price proposal
   */
  create(payload) {
    return api.post('/price-proposals', payload);
  },

  /**
   * Get list of proposals with optional filters
   */
  getAll(params = {}) {
    return api.get('/price-proposals', { params });
  },

  /**
   * Get counts
   */
  getItemStatusCounts() {
    return api
      .get('/price-proposals/item-status-counts')
      .then((res) => {
        console.log('API RESPONSE for counts 👉', res);
        return res; // this is already res.data
      })
      .catch((err) => {
        console.error('API ERROR for counts 👉', err);
        throw err;
      });
  },

  /**
   * Get single proposal by ID
   */
  getById(id) {
    return api.get(`/price-proposals/${id}`);
  },

  /**
   * Update proposal (for revisions)
   */
  update(id, payload) {
    return api.put(`/price-proposals/${id}`, payload);
  },

  /**
   * Delete a proposal
   */
  delete(id) {
    return api.delete(`/price-proposals/${id}`);
  },

  /**
   * Approve entire proposal
   */
  approve(id) {
    return api.post(`/price-proposals/${id}/approve`);
  },

  /**
   * Reject entire proposal
   */
  reject(id, rejected_note) {
    return api.post(`/price-proposals/${id}/reject`, { rejected_note });
  },

  /**
   * Approve individual item
   * @param {number} proposalId - Proposal ID
   * @param {number} itemId - Item ID
   */
  approveItem(itemId, status) {
    return api.post(`/price-proposals/${itemId}/status-tracks-levels`, { status });
  },

  rejectItem(itemId, status) {
    return api.post(`/price-proposals/${itemId}/status-tracks-levels`, { status });
  },

  revise(payload) {
    return api.post('/price-proposals/revise', payload);
  },
  getAllPriceByFilter(params = {}) {
    return api.get('/price-proposals/items-filtered', { params });
  },
};
