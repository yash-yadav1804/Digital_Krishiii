import api from './api'

export const supportService = {
  create: (data) => api.post('/support', data),
  getMine: () => api.get('/support/mine'),
  getAll: () => api.get('/support/all'),
  adminUpdate: (ticketId, data) => api.patch(`/support/${ticketId}`, data),
}
