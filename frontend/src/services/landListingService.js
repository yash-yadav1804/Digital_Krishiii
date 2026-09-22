import api from './api'

export const landListingService = {
  getOpen: () => api.get('/land-listings/open'),
  getMine: () => api.get('/land-listings/mine'),
  create: (data) => api.post('/land-listings', data),
  update: (listingId, data) => api.patch(`/land-listings/${listingId}`, data),
  delete: (listingId) => api.delete(`/land-listings/${listingId}`),
}

