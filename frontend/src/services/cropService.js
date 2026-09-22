import api from './api'

export const cropService = {
  getAll: (params) => api.get('/api/v1/crops', { params }),
  getOne: (id) => api.get(`/api/v1/crops/${id}`),
  create: (data) => api.post('/api/v1/crops', data),
  update: (id, data) => api.patch(`/api/v1/crops/${id}`, data),
  delete: (id) => api.delete(`/api/v1/crops/${id}`),
}
