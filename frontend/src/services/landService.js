import api from './api'

export const landService = {
  getAll: () => api.get('/lands/'),
  getOne: (id) => api.get(`/lands/${id}`),
  create: (data) => api.post('/lands/', data),
  update: (id, data) => api.put(`/lands/${id}`, data),
  delete: (id) => api.delete(`/lands/${id}`),
}
