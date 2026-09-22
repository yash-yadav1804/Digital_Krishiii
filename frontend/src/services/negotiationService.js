import api from './api'

export const negotiationService = {
  getAll: (contractId) => api.get(`/contracts/${contractId}/negotiations`),
  create: (contractId, data) => api.post(`/contracts/${contractId}/negotiations`, data),
  decide: (negotiationId, status) => api.patch(`/contracts/negotiations/${negotiationId}`, { status }),
}
