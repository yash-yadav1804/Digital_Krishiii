import api from './api'

export const profileService = {
  getFarmerProfile: () => api.get('/farmer-profiles/me'),
  createFarmerProfile: (data) => api.post('/farmer-profiles', data),
  updateFarmerProfile: (data) => api.put('/farmer-profiles/me', data),

  getBuyerProfile: () => api.get('/buyer-profiles/me'),
  createBuyerProfile: (data) => api.post('/buyer-profiles', data),
  updateBuyerProfile: (data) => api.put('/buyer-profiles/me', data),

  getAllFarmerProfiles: () => api.get('/farmer-profiles'),
  getAllBuyerProfiles: () => api.get('/buyer-profiles'),
}
