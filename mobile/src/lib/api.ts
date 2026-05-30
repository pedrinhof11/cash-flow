import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

let csrfCookie: string | null = null
let xsrfToken: string | null = null

export async function getCsrfCookie(): Promise<void> {
  try {
    const response = await api.get('/sanctum/csrf-cookie')
    const setCookie = response.headers['set-cookie']
    if (setCookie) {
      const xsrfMatch = setCookie.find((c: string) => c.includes('XSRF-TOKEN'))
      if (xsrfMatch) {
        const tokenMatch = xsrfMatch.match(/XSRF-TOKEN=([^;]+)/)
        if (tokenMatch) {
          xsrfToken = decodeURIComponent(tokenMatch[1])
          await AsyncStorage.setItem('xsrf_token', xsrfToken)
        }
      }
    }
  } catch (error) {
    console.error('Failed to get CSRF cookie:', error)
  }
}

export async function loadStoredTokens(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('xsrf_token')
    if (token) {
      xsrfToken = token
    }
  } catch (error) {
    console.error('Failed to load stored tokens:', error)
  }
}

api.interceptors.request.use(async (config) => {
  if (!xsrfToken) {
    await loadStoredTokens()
  }
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = xsrfToken
  }
  return config
})

export default api
