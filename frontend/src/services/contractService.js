import api from './api'

export const contractService = {
  getOpen: () => api.get('/contracts/open'),
  getMine: () => api.get('/contracts/mine'),
  getAssigned: () => api.get('/contracts/assigned'),
  getOne: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  update: (id, data) => api.patch(`/contracts/${id}`, data),
  delete: (id) => api.delete(`/contracts/${id}`),
}
