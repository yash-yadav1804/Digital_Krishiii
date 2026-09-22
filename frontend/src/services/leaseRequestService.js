import api from './api'

export const leaseRequestService = {
  create: (data) => api.post('/lease-requests', data),
  getMine: () => api.get('/lease-requests/mine'),
  getForListing: (listingId) => api.get(`/lease-requests/listing/${listingId}`),
  update: (requestId, status) => api.patch(`/lease-requests/${requestId}`, { status }),
}
