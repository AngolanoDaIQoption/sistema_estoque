import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000', // endereço da sua api-kamikase
})

// Envia o token automaticamente em todas as requisições se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kamikase_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})