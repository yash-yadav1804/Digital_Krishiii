import api from './api'

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  getForUser: (userId) => api.get(`/reviews/${userId}`),
}
