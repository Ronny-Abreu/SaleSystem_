"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"
import { facturasApi, productosApi } from "@/lib/api"
import type { Factura, Producto } from "@/lib/types"

interface Estadisticas {
  total_facturas: number
  total_ingresos: number
  promedio_factura: number
}

interface DashboardData {
  facturasHoy: Factura[]
  facturasAyer: Factura[]
  productos: Producto[]
  estadisticasHoy: Estadisticas | null
  estadisticasAyer: Estadisticas | null
}

interface CachedData {
  data: DashboardData
  timestamp: number
  hoy: string
}

const CACHE_KEY = "dashboard_data_cache"
const CACHE_DURATION = 30 * 1000

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    facturasHoy: [],
    facturasAyer: [],
    productos: [],
    estadisticasHoy: null,
    estadisticasAyer: null,
  })
  
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingQuickActions, setLoadingQuickActions] = useState(false)
  const [statsLoaded, setStatsLoaded] = useState(false)
  const [quickActionsLoaded, setQuickActionsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()
  const isRefreshingRef = useRef(false)

  // Función para guardar en cache
  const saveToCache = useCallback((data: DashboardData, hoy: string) => {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
        hoy,
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error("Error guardando en cache:", error)
    }
  }, [])

  const invalidateCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.error("Error invalidando cache:", error)
    }
  }, [])

  // Función para cargar desde cache
  const loadFromCache = useCallback((hoy: string): DashboardData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const cacheData: CachedData = JSON.parse(cached)
      
      if (cacheData.hoy !== hoy) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      const now = Date.now()
      if (now - cacheData.timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.error("Error cargando desde cache:", error)
      return null
    }
  }, [])

  const loadStats = useCallback(async (hoy: string, fechaAyer: string) => {
    try {
      setLoadingStats(true)
      setError(null)

      const [estadisticasHoyResponse, estadisticasAyerResponse] = await Promise.all([
        authenticatedRequest(() => facturasApi.getEstadisticas(hoy)),
        authenticatedRequest(() => facturasApi.getEstadisticas(fechaAyer)),
      ])

      setData((prev) => ({
        ...prev,
        estadisticasHoy: estadisticasHoyResponse.success ? estadisticasHoyResponse.data : null,
        estadisticasAyer: estadisticasAyerResponse.success ? estadisticasAyerResponse.data : null,
      }))

      setStatsLoaded(true)
      setLoadingStats(false)

      window.dispatchEvent(new CustomEvent('dashboard:statsLoaded'))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setLoadingStats(false)
    }
  }, [authenticatedRequest])

  const loadQuickActions = useCallback(async (hoy: string, fechaAyer: string, currentStats: { estadisticasHoy: Estadisticas | null, estadisticasAyer: Estadisticas | null }, skipCache = false, silent = false) => {
    try {
      if (isRefreshingRef.current && !skipCache) return
      isRefreshingRef.current = true

      if (!silent) {
        setLoadingQuickActions(true)
      }
      setError(null)

      const [facturasHoyResponse, facturasAyerResponse, productosResponse] = await Promise.all([
        authenticatedRequest(() =>
          facturasApi.getAll({
            fecha_desde: hoy,
            fecha_hasta: hoy,
            incluir_detalles: true,
          }),
        ),
        authenticatedRequest(() =>
          facturasApi.getAll({
            fecha_desde: fechaAyer,
            fecha_hasta: fechaAyer,
            incluir_detalles: true,
          }),
        ),
        authenticatedRequest(() => productosApi.getAll()),
      ])

      const productos = productosResponse.success
        ? productosResponse.data.map((item: any): Producto => {
            let categoria = undefined
            if (item.categoria_nombre && item.categoria_id) {
              categoria = {
                id: Number(item.categoria_id),
                nombre: String(item.categoria_nombre),
                color: String(item.categoria_color || "#6B7280"),
                descripcion: String(item.categoria_descripcion || ""),
                activo: true,
                created_at: "",
                updated_at: "",
              }
            }

            return {
              id: Number(item.id),
              nombre: String(item.nombre),
              precio: Number(item.precio),
              descripcion: item.descripcion || "",
              stock: Number(item.stock),
              activo: Boolean(item.activo),
              categoria_id: item.categoria_id ? Number(item.categoria_id) : undefined,
              created_at: String(item.created_at),
              updated_at: String(item.updated_at),
              categoria: categoria,
            }
          })
        : []

      const newData: DashboardData = {
        facturasHoy: facturasHoyResponse.success ? facturasHoyResponse.data : [],
        facturasAyer: facturasAyerResponse.success ? facturasAyerResponse.data : [],
        productos,
        estadisticasHoy: currentStats.estadisticasHoy,
        estadisticasAyer: currentStats.estadisticasAyer,
      }

      setData(newData)
      setQuickActionsLoaded(true)
      if (!silent) {
        setLoadingQuickActions(false)
      }

      saveToCache(newData, hoy)
      isRefreshingRef.current = false

      window.dispatchEvent(new CustomEvent('dashboard:fullyLoaded'))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      if (!silent) {
        setLoadingQuickActions(false)
      }
      isRefreshingRef.current = false
    }
  }, [authenticatedRequest, saveToCache])

  useEffect(() => {
    if (!authChecked || !isAuthenticated) {
      setLoadingStats(false)
      setLoadingQuickActions(false)
      return
    }

    const hoy = (() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()
    
    const fechaAyer = (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const year = yesterday.getFullYear()
      const month = String(yesterday.getMonth() + 1).padStart(2, '0')
      const day = String(yesterday.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()

    const cachedData = loadFromCache(hoy)
    if (cachedData) {
      setData(cachedData)
      setStatsLoaded(true)
      setQuickActionsLoaded(true)
      setLoadingStats(false)
      setLoadingQuickActions(false)
      
      window.dispatchEvent(new CustomEvent('dashboard:statsLoaded'))
      window.dispatchEvent(new CustomEvent('dashboard:fullyLoaded'))
      return
    }

    // Si no hay cache, cargar en secuencia
    // 1. Primero cargar estadísticas
    loadStats(hoy, fechaAyer)
  }, [authChecked, isAuthenticated, loadStats, loadFromCache])

  const refreshData = useCallback(async (force = false) => {
    if (!isAuthenticated) return

    const hoy = (() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()
    
    const fechaAyer = (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const year = yesterday.getFullYear()
      const month = String(yesterday.getMonth() + 1).padStart(2, '0')
      const day = String(yesterday.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()

    if (force) {
      invalidateCache()
    }

    await loadStats(hoy, fechaAyer)
    
    setTimeout(() => {
      setData((prev) => {
        loadQuickActions(hoy, fechaAyer, {
          estadisticasHoy: prev.estadisticasHoy,
          estadisticasAyer: prev.estadisticasAyer,
        }, true, false)
        return prev
      })
    }, 100)
  }, [isAuthenticated, loadStats, loadQuickActions, invalidateCache])

  // Cargar acciones rápidas cuando las estadísticas estén listas
  useEffect(() => {
    if (!statsLoaded || quickActionsLoaded) return

    const hoy = (() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()
    const fechaAyer = (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const year = yesterday.getFullYear()
      const month = String(yesterday.getMonth() + 1).padStart(2, '0')
      const day = String(yesterday.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()

    const timer = setTimeout(() => {
      loadQuickActions(hoy, fechaAyer, {
        estadisticasHoy: data.estadisticasHoy,
        estadisticasAyer: data.estadisticasAyer,
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [statsLoaded, quickActionsLoaded, loadQuickActions, data.estadisticasHoy, data.estadisticasAyer])


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && statsLoaded && quickActionsLoaded) {
        refreshData(false)
      }
    }

    const handleFocus = () => {
      if (isAuthenticated && statsLoaded && quickActionsLoaded) {
        refreshData(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated, statsLoaded, quickActionsLoaded, refreshData])

  const refreshDataInBackground = useCallback(async () => {
    if (!isAuthenticated) return

    const hoy = (() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()
    
    const fechaAyer = (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const year = yesterday.getFullYear()
      const month = String(yesterday.getMonth() + 1).padStart(2, '0')
      const day = String(yesterday.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()

    invalidateCache()

    try {
      const [estadisticasHoyResponse, estadisticasAyerResponse] = await Promise.all([
        authenticatedRequest(() => facturasApi.getEstadisticas(hoy)),
        authenticatedRequest(() => facturasApi.getEstadisticas(fechaAyer)),
      ])

      const estadisticasHoy = estadisticasHoyResponse.success ? estadisticasHoyResponse.data : null
      const estadisticasAyer = estadisticasAyerResponse.success ? estadisticasAyerResponse.data : null

      setData((prev) => ({
        ...prev,
        estadisticasHoy,
        estadisticasAyer,
      }))

      setStatsLoaded(true)

      await loadQuickActions(hoy, fechaAyer, {
        estadisticasHoy,
        estadisticasAyer,
      }, true, true)
    } catch (err) {
      console.error("Error actualizando datos en segundo plano:", err)
    }
  }, [isAuthenticated, authenticatedRequest, invalidateCache, loadQuickActions])

  useEffect(() => {
    const handleFacturaCreated = () => {
      refreshDataInBackground()
    }

    window.addEventListener('factura:created', handleFacturaCreated)
    window.addEventListener('factura:updated', handleFacturaCreated)
    window.addEventListener('producto:created', handleFacturaCreated)
    window.addEventListener('producto:updated', handleFacturaCreated)
    window.addEventListener('cliente:created', handleFacturaCreated)

    return () => {
      window.removeEventListener('factura:created', handleFacturaCreated)
      window.removeEventListener('factura:updated', handleFacturaCreated)
      window.removeEventListener('producto:created', handleFacturaCreated)
      window.removeEventListener('producto:updated', handleFacturaCreated)
      window.removeEventListener('cliente:created', handleFacturaCreated)
    }
  }, [refreshDataInBackground])

  return {
    ...data,
    loading: loadingStats || loadingQuickActions,
    loadingStats,
    loadingQuickActions,
    statsLoaded,
    quickActionsLoaded,
    error,
    refreshData,
  }
}
