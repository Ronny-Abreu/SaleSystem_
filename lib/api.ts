import { API_BASE_URL } from "@/lib/config"
import type { Cliente, Producto, Factura } from "@/lib/types"
import { cachedFetch, generateCacheKey, invalidateCache } from "@/lib/cache"

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Función para obtener el token del localStorage
function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("sale_system_access_token")
    } catch (error) {
      return null
    }
  }
  return null
}

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  cacheOptions?: { cache?: RequestCache; next?: { revalidate?: number }; ttl?: number },
  params?: Record<string, any>
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/${endpoint}`
  const method = options.method || "GET"
  const hasBody = options.body !== undefined

  const requestParams = params || (() => {
    // Parsear query params sin depender del dominio
    const [, queryString] = endpoint.split('?')
    const extracted: Record<string, any> = {}
    if (queryString) {
      const searchParams = new URLSearchParams(queryString)
      searchParams.forEach((value, key) => {
        extracted[key] = value
      })
    }
    return extracted
  })()

  // Obtener token para agregarlo a los headers (excepto para auth.php)
  const token = endpoint !== "auth.php" ? getAccessToken() : null

  if (method === "GET" && !hasBody) {
    return cachedFetch(
      async () => {
        const headers: HeadersInit = {}
        
        // Agregar token de autorización si existe
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }
        
        const defaultOptions: RequestInit = {
          credentials: "include",
          headers,
        }

        const fetchOptions: RequestInit = {
          ...defaultOptions,
          ...options,
          headers: {
            ...headers,
            ...(options.headers || {}),
          },
        }

        if (cacheOptions) {
          fetchOptions.cache = cacheOptions.cache || "default"
          fetchOptions.next = cacheOptions.next
        }

        const response = await fetch(url, fetchOptions)

        if (!response.ok) {
          const isVerificationRequest = endpoint.includes('?email=') || 
                                        endpoint.includes('?telefono=') || 
                                        endpoint.includes('?nombre=')
          
          if (response.status === 404 && isVerificationRequest) {
            return { success: false, message: "Cliente no encontrado", data: null }
          }
          
          let errorMessage = `HTTP error! status: ${response.status}`
          try {
            const errorData = await response.json()
            if (errorData && errorData.message) {
              errorMessage = errorData.message
            }
          } catch (e) {
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        return data
      },
      endpoint,
      method,
      requestParams,
      cacheOptions?.ttl
    )
  }

  if (hasBody && endpoint.includes("facturas.php")) {
    invalidateCache("facturas.php")
  }
  if (hasBody && endpoint.includes("productos.php")) {
    invalidateCache("productos.php")
  }
  if (hasBody && endpoint.includes("clientes.php")) {
    invalidateCache("clientes.php")
  }

  const headers: HeadersInit = {}
  if (hasBody || method !== "GET") {
    headers["Content-Type"] = "application/json"
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers,
  }

  const fetchOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    const isVerificationRequest = endpoint.includes('?email=') || 
                                  endpoint.includes('?telefono=') || 
                                  endpoint.includes('?nombre=')
    
    if (response.status === 404 && isVerificationRequest) {
      return { success: false, message: "Cliente no encontrado", data: null as T }
    }
    
    let errorMessage = `HTTP error! status: ${response.status}`
    try {
      const errorData = await response.json()
      if (errorData && errorData.message) {
        errorMessage = errorData.message
      }
    } catch (e) {
    }
    throw new Error(errorMessage)
  }

  return await response.json()
}

// ===== CLIENTES =====
export const clientesApi = {
  getAll: async (): Promise<ApiResponse<Cliente[]>> => {
    return apiRequest<Cliente[]>("clientes.php")
  },

  getByCodigo: async (codigo: string): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?codigo=${encodeURIComponent(codigo)}`)
  },

  getById: async (id: number): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?id=${id}`)
  },

  getByEmail: async (email: string): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?email=${encodeURIComponent(email)}`)
  },

  getByTelefono: async (telefono: string): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?telefono=${encodeURIComponent(telefono)}`)
  },

  getByNombre: async (nombre: string): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?nombre=${encodeURIComponent(nombre)}`)
  },

  verificarEmailExistente: async (email: string): Promise<ApiResponse<Cliente | null>> => {
    const response = await apiRequest<Cliente>(`clientes.php?email=${encodeURIComponent(email)}`)
    if (!response.success) {
      return { success: true, message: "Cliente no encontrado", data: null as any }
    }
    return response
  },

  verificarTelefonoExistente: async (telefono: string): Promise<ApiResponse<Cliente | null>> => {
    const response = await apiRequest<Cliente>(`clientes.php?telefono=${encodeURIComponent(telefono)}`)
    if (!response.success) {
      return { success: true, message: "Cliente no encontrado", data: null as any }
    }
    return response
  },

  verificarNombreExistente: async (nombre: string): Promise<ApiResponse<Cliente | null>> => {
    const response = await apiRequest<Cliente>(`clientes.php?nombre=${encodeURIComponent(nombre)}`)
    if (!response.success) {
      return { success: true, message: "Cliente no encontrado", data: null as any }
    }
    return response
  },
  create: async (cliente: { nombre: string; telefono?: string; email?: string; direccion?: string; codigo?: string }): Promise<ApiResponse<Cliente>> => {
    invalidateCache("clientes.php")
    return apiRequest<Cliente>("clientes.php", {
      method: "POST",
      body: JSON.stringify(cliente),
    })
  },

  update: async (id: number, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> => {
    invalidateCache("clientes.php")
    return apiRequest<Cliente>(`clientes.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente),
    })
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    invalidateCache("clientes.php")
    invalidateCache("facturas.php") // Las facturas también pueden verse afectadas
    return apiRequest<null>(`clientes.php?id=${id}`, {
      method: "DELETE",
    })
  },
}

// ===== PRODUCTOS =====
export const productosApi = {
  getAll: async (activos?: boolean): Promise<ApiResponse<Producto[]>> => {
    let endpoint = "productos.php"
    if (activos !== undefined) {
      endpoint += `?activos=${activos}`
    }
    return apiRequest<Producto[]>(endpoint)
  },

  getById: async (id: number): Promise<ApiResponse<Producto>> => {
    return apiRequest<Producto>(`productos.php?id=${id}`)
  },

  create: async (producto: Omit<Producto, "id" | "created_at" | "updated_at">): Promise<ApiResponse<Producto>> => {
    invalidateCache("productos.php")
    return apiRequest<Producto>("productos.php", {
      method: "POST",
      body: JSON.stringify(producto),
    })
  },

  update: async (id: number, producto: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    invalidateCache("productos.php")
    return apiRequest<Producto>(`productos.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(producto),
    })
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    invalidateCache("productos.php")
    return apiRequest<null>(`productos.php?id=${id}`, {
      method: "DELETE",
    })
  },
}

// ===== FACTURAS =====
export const facturasApi = {
  getAll: async (filtros?: {
    fecha_desde?: string
    fecha_hasta?: string
    estado?: string
    cliente_id?: number
    incluir_detalles?: boolean
  }): Promise<ApiResponse<Factura[]>> => {
    let endpoint = "facturas.php"
    const params: Record<string, any> = {}
    
    if (filtros) {
      if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde
      if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta
      if (filtros.estado) params.estado = filtros.estado
      if (filtros.cliente_id) params.cliente_id = filtros.cliente_id.toString()
      if (filtros.incluir_detalles) params.incluir_detalles = "true"

      const urlParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key, String(value))
      })
      if (urlParams.toString()) {
        endpoint += `?${urlParams.toString()}`
      }
    }
    return apiRequest<Factura[]>(endpoint, {}, undefined, params)
  },

  getById: async (id: number): Promise<ApiResponse<Factura>> => {
    return apiRequest<Factura>(`facturas.php?id=${id}`)
  },

  getByNumero: async (numero: string): Promise<ApiResponse<Factura>> => {
    return apiRequest<Factura>(`facturas.php?numero=${encodeURIComponent(numero)}`)
  },

  create: async (factura: {
    cliente_id: number
    fecha: string
    subtotal: number
    total: number
    comentario?: string
    estado?: string
    detalles: Array<{
      producto_id: number
      cantidad: number
      precio_unitario: number
    }>
  }): Promise<ApiResponse<Factura>> => {
    invalidateCache("facturas.php")
    invalidateCache("estadisticas")
    invalidateCache("productos.php")
    return apiRequest<Factura>("facturas.php", {
      method: "POST",
      body: JSON.stringify(factura),
    })
  },

  updateEstado: async (id: number, estado: string): Promise<ApiResponse<{ cambio_pendiente_a_pagada: boolean; factura_id: number } | null>> => {
    invalidateCache("facturas.php")
    return apiRequest<{ cambio_pendiente_a_pagada: boolean; factura_id: number } | null>(`facturas.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    })
  },

  getEstadisticas: async (
    fecha?: string,
  ): Promise<
    ApiResponse<{
      total_facturas: number
      total_ingresos: number
      promedio_factura: number
    }>
  > => {
    let endpoint = "facturas.php?estadisticas=true"
    const params: Record<string, any> = { estadisticas: "true" }
    if (fecha) {
      endpoint += `&fecha=${fecha}`
      params.fecha = fecha
    }
    return apiRequest(endpoint, {}, undefined, params)
  },
}

export const authApi = {
  login: (username: string, password: string) =>
    apiRequest("auth.php", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  checkAuth: () => {
    const token = getAccessToken()
    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return apiRequest("auth.php", {
      method: "GET",
      headers,
    })
  },

  refreshToken: (refreshToken: string) =>
    apiRequest("auth.php", {
      method: "PUT",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: () =>
    apiRequest("auth.php", {
      method: "DELETE",
    }),
}
