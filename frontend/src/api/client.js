import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Initialize CSRF token
export const initializeCSRF = async () => {
  try {
    const response = await client.get('/api/csrf-token/')
    if (response.data.csrfToken) {
      client.defaults.headers.common['X-CSRFToken'] = response.data.csrfToken
    }
  } catch (error) {
    console.error('Failed to get CSRF token:', error)
  }
}

// Add CSRF token to requests if needed
client.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  
  return config
})

export const api = {
  // Analysis endpoints
  analyzeFromImage: async (formData) => {
    return client.post('/api/analyze/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  analyzeFromSensorData: async (data) => {
    return client.post('/api/analyze/', data)
  },

  getResults: async (id) => {
    return client.get(`/api/results/${id}/`)
  },

  getHistory: async () => {
    return client.get('/api/history/')
  },

  getDashboard: async () => {
    return client.get('/api/dashboard/')
  },

  exportPDF: async (id) => {
    return client.get(`/api/export/pdf/${id}/`, {
      responseType: 'blob',
    })
  },

  // Contact
  submitContact: async (data) => {
    return client.post('/api/contact/submit/', data)
  },
}

export default client
