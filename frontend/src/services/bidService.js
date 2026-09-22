import api from './api'

export const bidService = {
  getMine: () => api.get('/contract-bids/mine'),
  getForContract: (contractId) => api.get(`/contract-bids/contract/${contractId}`),
  create: (data) => api.post('/contract-bids', data),
  updateStatus: (bidId, status) => api.patch(`/contract-bids/${bidId}`, { status, image_url: null }),
}
