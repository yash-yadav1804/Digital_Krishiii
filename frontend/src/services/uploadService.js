import api from './api'

export const uploadService = {
  image: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/uploads/image', formData)
  },
}
