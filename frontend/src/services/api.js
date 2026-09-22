import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Do NOT use window.location.href here — it causes a full browser reload
    // which destroys React state and breaks the login/register flow.
    // Session expiry is handled by AuthContext on app init (useEffect).
    // Each caller handles its own 401 errors via try/catch.
    return Promise.reject(err)
  }
)

export default api
