import api from './api'

export const adminService = {
  getUsers: () => api.get('/api/v1/admin/users'),
  updateUserStatus: (userId, isActive) =>
    api.patch(`/api/v1/admin/users/${userId}/status`, { is_active: isActive }),
  assignRole: (userId, role) =>
    api.post(`/api/v1/admin/users/${userId}/roles/${role}`),
  removeRole: (userId, role) =>
    api.delete(`/api/v1/admin/users/${userId}/roles/${role}`),
}
