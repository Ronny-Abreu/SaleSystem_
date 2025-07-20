// Configuración centralizada de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/salesystem/backend/api"

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}/${endpoint.replace(/^\//, '')}`
}