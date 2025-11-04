// Sistema de caché inteligente con localStorage y memoria
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

const memoryCache = new Map<string, CacheEntry<any>>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryCache.entries()) {
    if (now > entry.timestamp + entry.ttl) {
      memoryCache.delete(key)
    }
  }
}, 60000)

export const CacheStrategy = {
  TODAY: 30000,
  
  HISTORICAL: 300000,
  
  PRODUCTS: 600000,
  
  PENDING: 120000,
  
  STATS: 60000,
  
  GENERAL: 900000,
} as const

function getCacheStrategy(endpoint: string, params?: Record<string, any>): number {
  const hoy = new Date().toISOString().split("T")[0]
  
  // Facturas del día actual
  if (endpoint.includes("facturas.php")) {
    if (params?.fecha_desde === hoy && params?.fecha_hasta === hoy) {
      return CacheStrategy.TODAY
    }
    if (params?.estado === "pendiente") {
      return CacheStrategy.PENDING
    }
    if (params?.fecha_desde || params?.fecha_hasta) {
      return CacheStrategy.HISTORICAL
    }
  }
  
  // Estadísticas
  if (endpoint.includes("estadisticas")) {
    return CacheStrategy.STATS
  }
  
  // Productos
  if (endpoint.includes("productos.php") && !params?.id) {
    return CacheStrategy.PRODUCTS
  }
  
  return CacheStrategy.GENERAL
}

export function generateCacheKey(endpoint: string, method: string, params?: Record<string, any>): string {
  const [pathname, existingQuery] = endpoint.split('?')
  const searchParams = new URLSearchParams(existingQuery || '')
  
  // Agregar params adicionales si existen
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    })
  }
  
  const query = searchParams.toString()
  return `${method}:${pathname}${query ? `?${query}` : ''}`
}

// Obtener del caché
export function getFromCache<T>(key: string): T | null {
  const now = Date.now()
  
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry && now < memoryEntry.timestamp + memoryEntry.ttl) {
    return memoryEntry.data as T
  }
  
  try {
    const stored = localStorage.getItem(`cache_${key}`)
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored)
      if (now < entry.timestamp + entry.ttl) {
        memoryCache.set(key, entry)
        return entry.data
      } else {
        localStorage.removeItem(`cache_${key}`)
      }
    }
  } catch (e) {
  }
  
  return null
}

export function setCache<T>(key: string, data: T, ttl: number): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl,
    key,
  }
  
  memoryCache.set(key, entry)
  
  if (ttl > 300000) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
      
      const keys = Object.keys(localStorage).filter(k => k.startsWith("cache_"))
      if (keys.length > 50) {
        const entries = keys.map(k => {
          try {
            const entry = JSON.parse(localStorage.getItem(k) || "{}")
            return { key: k, timestamp: entry.timestamp || 0 }
          } catch {
            return { key: k, timestamp: 0 }
          }
        })
        entries.sort((a, b) => b.timestamp - a.timestamp)
        entries.slice(50).forEach(({ key }) => localStorage.removeItem(key))
      }
    } catch (e) {
    }
  }
}

export function invalidateCache(pattern: string): void {
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key)
    }
  }
  
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith("cache_"))
    keys.forEach(k => {
      if (k.includes(pattern)) {
        localStorage.removeItem(k)
      }
    })
  } catch (e) {
  }
}

export function checkAndInvalidateDayCache(): void {
  const hoy = new Date().toISOString().split("T")[0]
  const lastCacheDate = localStorage.getItem("lastCacheDate")
  
  if (lastCacheDate !== hoy) {
    invalidateCache("facturas.php")
    invalidateCache("estadisticas")
    localStorage.setItem("lastCacheDate", hoy)
  }
}

export async function cachedFetch<T>(
  fetchFn: () => Promise<T>,
  endpoint: string,
  method: string = "GET",
  params?: Record<string, any>,
  customTtl?: number
): Promise<T> {
  checkAndInvalidateDayCache()
  
  const cacheKey = generateCacheKey(endpoint, method, params)
  const ttl = customTtl || getCacheStrategy(endpoint, params)
  
  const cached = getFromCache<T>(cacheKey)
  if (cached) {
    fetchFn()
      .then((freshData) => {
        setCache(cacheKey, freshData, ttl)
      })
      .catch(() => {
      })
    return cached
  }
  
  const data = await fetchFn()
  setCache(cacheKey, data, ttl)
  return data
}

