import api from './api'

export const equipmentRequestService = {
  create: (data) => api.post('/equipment-requests', data),
  getMine: () => api.get('/equipment-requests/mine'),
  getForEquipment: (equipmentId) =>
    api.get(`/equipment-requests/equipment/${equipmentId}`),
  update: (requestId, status) =>
    api.patch(`/equipment-requests/${requestId}`, { status }),
}
