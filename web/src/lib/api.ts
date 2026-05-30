import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  },
)

export async function getCsrfCookie() {
  await axios.get('/api/sanctum/csrf-cookie', {
    withCredentials: true,
    baseURL: import.meta.env.VITE_API_URL || undefined,
  })
}

export default api
