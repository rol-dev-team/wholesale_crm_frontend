// // src/api/priceProposalApi.js
// import api from './axiosInstance';

// export const PriceProposalAPI = {
//   /**
//    * Create a new price proposal
//    * @param {Object} payload
//    * payload shape:
//    * {
//    *   client_id: number,
//    *   items: [
//    *     {
//    *       product_id: number,
//    *       price: number,
//    *       volume: number,
//    *       unit: string,
//    *       total_amount: number  // Can be calculated on backend
//    *     }
//    *   ]
//    * }
//    */
//   create(payload) {
//     return api.post('/price-proposals', payload);
//   },

//   /**
//    * Get list of proposals with optional filters
//    * @param {Object} params - Query parameters (page, status, client_id, etc.)
//    */
//   getAll(params = {}) {
//     return api.get('/price-proposals', { params });
//   },

//   /**
//    * Get single proposal by ID
//    * @param {number} id - Proposal ID
//    */
//   getById(id) {
//     return api.get(`/price-proposals/${id}`);
//   },

//   /**
//    * Update proposal (for revisions)
//    * @param {number} id - Proposal ID
//    * @param {Object} payload
//    * payload shape: same as create, but items can include 'id' for existing items
//    */
//   update(id, payload) {
//     return api.put(`/price-proposals/${id}`, payload);
//   },

//   /**
//    * Delete a proposal
//    * @param {number} id - Proposal ID
//    */
//   delete(id) {
//     return api.delete(`/price-proposals/${id}`);
//   },

//   /**
//    * Approve a proposal
//    * @param {number} id - Proposal ID
//    */
//   approve(id) {
//     return api.post(`/price-proposals/${id}/approve`);
//   },

//   /**
//    * Reject a proposal
//    * @param {number} id - Proposal ID
//    * @param {Object} payload - { rejected_note: string }
//    */
//   reject(id, payload) {
//     return api.post(`/price-proposals/${id}/reject`, payload);
//   },
// };


// src/api/priceProposalApi.js
// src/api/priceProposalApi.js
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
  approveItem(proposalId, itemId) {
    return api.post(`/price-proposals/${proposalId}/items/${itemId}/approve`);
  },

  /**
   * Reject individual item
   * @param {number} proposalId - Proposal ID
   * @param {number} itemId - Item ID
   * @param {Object} payload - { rejected_note, suggested_price?, suggested_volume? }
   */
  rejectItem(proposalId, itemId, payload) {
    return api.post(`/price-proposals/${proposalId}/items/${itemId}/reject`, payload);
  },
};