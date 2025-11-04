// Configuración centralizada de la API
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost/salesystem/backend/api"

export const BACKEND_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://salesystem-production-0d90.up.railway.app"
    : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost/salesystem/backend"

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
}

export const buildApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`
}

// Función helper para construir URLs del backend
export const buildBackendUrl = (endpoint: string) => {
  if (process.env.NODE_ENV === "production" && endpoint.startsWith("api/")) {
    return `/api/${endpoint.replace(/^api\//, "")}`
  }
  return `${BACKEND_BASE_URL}/${endpoint.replace(/^\//, "")}`
}
