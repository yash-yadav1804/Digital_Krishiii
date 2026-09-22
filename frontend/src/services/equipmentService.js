import api from './api'

export const equipmentService = {
  getAvailable: () => api.get('/equipment/available'),
  getMine: () => api.get('/equipment/mine'),
  create: (data) => api.post('/equipment', data),
  update: (equipmentId, data) => api.patch(`/equipment/${equipmentId}`, data),
  delete: (equipmentId) => api.delete(`/equipment/${equipmentId}`),
}

