import { API_BASE_URL } from "@/lib/config"
import type { Cliente, Producto, Factura } from "@/lib/types"

// Tipos para las respuestas de la API
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const cache = new Map<string, { data: ApiResponse<any>; timestamp: number; ttl: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now > value.timestamp + value.ttl) {
      cache.delete(key)
    }
  }
}, 60000)

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  cacheOptions?: { cache?: RequestCache; next?: { revalidate?: number }; ttl?: number }
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/${endpoint}`
  const method = options.method || "GET"
  const hasBody = options.body !== undefined

  const cacheKey = method === "GET" ? `${method}:${url}` : null
  const ttl = cacheOptions?.ttl || 30000

  if (cacheKey && !hasBody) {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      return cached.data as ApiResponse<T>
    }
  }

  const headers: HeadersInit = {}
  if (hasBody || method !== "GET") {
    headers["Content-Type"] = "application/json"
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

  if (cacheOptions && method === "GET") {
    fetchOptions.cache = cacheOptions.cache || "default"
    fetchOptions.next = cacheOptions.next
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
    }
    throw new Error(errorMessage);
  }

  const data = await response.json()

  // Guardar en caché solo para GET requests exitosos
  if (cacheKey && method === "GET" && response.ok) {
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  return data
}

// ===== CLIENTES =====
export const clientesApi = {
  // Obtener todos los clientes
  getAll: async (): Promise<ApiResponse<Cliente[]>> => {
    return apiRequest<Cliente[]>("clientes.php")
  },

  // Buscar cliente por código
  getByCodigo: async (codigo: string): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?codigo=${encodeURIComponent(codigo)}`)
  },

  // Buscar cliente por ID
  getById: async (id: number): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?id=${id}`)
  },

  // Crear nuevo cliente
  create: async (cliente: Omit<Cliente, "id" | "created_at" | "updated_at">): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>("clientes.php", {
      method: "POST",
      body: JSON.stringify(cliente),
    })
  },

  // Actualizar cliente
  update: async (id: number, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> => {
    return apiRequest<Cliente>(`clientes.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(cliente),
    })
  },

  // Eliminar cliente
  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiRequest<null>(`clientes.php?id=${id}`, {
      method: "DELETE",
    })
  },
}

// ===== PRODUCTOS =====
export const productosApi = {
  // Obtener todos los productos
  getAll: async (activos?: boolean): Promise<ApiResponse<Producto[]>> => {
    let endpoint = "productos.php"
    if (activos !== undefined) {
      endpoint += `?activos=${activos}`
    }
    return apiRequest<Producto[]>(endpoint)
  },

  // Buscar producto por ID
  getById: async (id: number): Promise<ApiResponse<Producto>> => {
    return apiRequest<Producto>(`productos.php?id=${id}`)
  },

  // Crear nuevo producto
  create: async (producto: Omit<Producto, "id" | "created_at" | "updated_at">): Promise<ApiResponse<Producto>> => {
    return apiRequest<Producto>("productos.php", {
      method: "POST",
      body: JSON.stringify(producto),
    })
  },

  // Actualizar producto
  update: async (id: number, producto: Partial<Producto>): Promise<ApiResponse<Producto>> => {
    return apiRequest<Producto>(`productos.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(producto),
    })
  },

  // Eliminar producto (soft delete)
  delete: async (id: number): Promise<ApiResponse<null>> => {
    return apiRequest<null>(`productos.php?id=${id}`, {
      method: "DELETE",
    })
  },
}

// ===== FACTURAS =====
export const facturasApi = {
  // Obtener todas las facturas
  getAll: async (filtros?: {
    fecha_desde?: string
    fecha_hasta?: string
    estado?: string
    cliente_id?: number
    incluir_detalles?: boolean
  }): Promise<ApiResponse<Factura[]>> => {
    let endpoint = "facturas.php"
    if (filtros) {
      const params = new URLSearchParams()
      if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde)
      if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta)
      if (filtros.estado) params.append("estado", filtros.estado)
      if (filtros.cliente_id) params.append("cliente_id", filtros.cliente_id.toString())
      if (filtros.incluir_detalles) params.append("incluir_detalles", "true")

      if (params.toString()) {
        endpoint += `?${params.toString()}`
      }
    }
    return apiRequest<Factura[]>(endpoint)
  },

  // Buscar factura por ID
  getById: async (id: number): Promise<ApiResponse<Factura>> => {
    return apiRequest<Factura>(`facturas.php?id=${id}`)
  },

  // Buscar factura por número
  getByNumero: async (numero: string): Promise<ApiResponse<Factura>> => {
    return apiRequest<Factura>(`facturas.php?numero=${encodeURIComponent(numero)}`)
  },

  // Crear nueva factura
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
    return apiRequest<Factura>("facturas.php", {
      method: "POST",
      body: JSON.stringify(factura),
    })
  },

  // Actualizar estado de factura
  updateEstado: async (id: number, estado: string): Promise<ApiResponse<null>> => {
    return apiRequest<null>(`facturas.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ estado }),
    })
  },

  // Obtener estadísticas del día
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
    if (fecha) {
      endpoint += `&fecha=${fecha}`
    }
    return apiRequest(endpoint)
  },
}

// API de Autenticación
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest("auth.php", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  checkAuth: () => apiRequest("auth.php"),

  logout: () =>
    apiRequest("auth.php", {
      method: "DELETE",
    }),
}
