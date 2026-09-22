import api from './api'

export const authService = {
  register: (email, password, role) =>
    api.post('/api/v1/auth/register', { email, password, role }),

  login: (email, password) =>
    api.post('/api/v1/auth/login', { email, password }),

  getMe: () =>
    api.get('/api/v1/users/me'),
}
