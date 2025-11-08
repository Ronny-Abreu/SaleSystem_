"use client"

import { facturasApi } from "@/lib/api"
import { useState, useEffect, useCallback, useRef } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"
import { generateCacheKey, getFromCache, setCache, invalidateCache, getCacheStrategy } from "@/lib/cache"

export interface Notificacion {
  id: string
  tipo: "factura_pendiente" | "stock_bajo" | "cliente_nuevo"
  titulo: string
  mensaje: string
  fecha: string
  leida: boolean
  data?: any
}

const NOTIFICACIONES_LEIDAS_KEY = "notificaciones_leidas"

const getNotificacionesLeidas = (): Set<string> => {
  try {
    const leidas = localStorage.getItem(NOTIFICACIONES_LEIDAS_KEY)
    return leidas ? new Set(JSON.parse(leidas)) : new Set()
  } catch {
    return new Set()
  }
}

const saveNotificacionesLeidas = (leidas: Set<string>) => {
  try {
    localStorage.setItem(NOTIFICACIONES_LEIDAS_KEY, JSON.stringify(Array.from(leidas)))
  } catch (error) {
    console.error("Error guardando notificaciones leídas:", error)
  }
}

let notificacionesCache: Notificacion[] | null = null
let fetchingNotificaciones = false

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(notificacionesCache || [])
  const [loading, setLoading] = useState(!notificacionesCache)
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()
  const fetchRef = useRef(false)

  const fetchNotificaciones = useCallback(async (forceRefresh: boolean = false) => {
    if (fetchingNotificaciones && !forceRefresh) {
      return
    }

    try {
      fetchingNotificaciones = true
      setLoading(true)

      if (!isAuthenticated) {
        setLoading(false)
        fetchingNotificaciones = false
        return
      }

      const endpoint = "api/facturas.php"
      const filtros = { estado: "pendiente" }
      const cacheKey = generateCacheKey(endpoint, "GET", filtros)
      
      if (!forceRefresh) {
        const cached = getFromCache<any[]>(cacheKey)
        if (cached) {
          const leidas = getNotificacionesLeidas()
          
          const notificacionesFacturas: Notificacion[] = cached.map((factura: any) => {
            const id = `factura-${factura.id}`
            return {
              id,
              tipo: "factura_pendiente" as const,
              titulo: "Factura Pendiente",
              mensaje: `Factura ${factura.numero_factura} de ${factura.cliente?.nombre || "Cliente"} está pendiente de pago`,
              fecha: factura.created_at || factura.fecha,
              leida: leidas.has(id),
              data: factura,
            }
          })
          
          notificacionesCache = notificacionesFacturas
          setNotificaciones(notificacionesFacturas)
          setCantidadNoLeidas(notificacionesFacturas.filter((n) => !n.leida).length)
          setLoading(false)
          fetchingNotificaciones = false
          
          authenticatedRequest(() => facturasApi.getAll({ estado: "pendiente" }))
            .then((response) => {
              if (response.success) {
                const leidasActualizadas = getNotificacionesLeidas()
                
                const notificacionesActualizadas: Notificacion[] = response.data.map((factura: any) => {
                  const id = `factura-${factura.id}`
                  return {
                    id,
                    tipo: "factura_pendiente" as const,
                    titulo: "Factura Pendiente",
                    mensaje: `Factura ${factura.numero_factura} de ${factura.cliente?.nombre || "Cliente"} está pendiente de pago`,
                    fecha: factura.created_at || factura.fecha,
                    leida: leidasActualizadas.has(id),
                    data: factura,
                  }
                })
                
                notificacionesCache = notificacionesActualizadas
                setNotificaciones(notificacionesActualizadas)
                setCantidadNoLeidas(notificacionesActualizadas.filter((n) => !n.leida).length)
                
                const ttl = getCacheStrategy(endpoint, filtros)
                setCache(cacheKey, response.data, ttl)
              }
            })
            .catch(() => {
            })
          return
        }
      }

      // Obtener facturas pendientes
      const facturasPendientes = await authenticatedRequest(() => facturasApi.getAll({ estado: "pendiente" }))

      const leidas = getNotificacionesLeidas()

      const notificacionesFacturas: Notificacion[] = facturasPendientes.success
        ? facturasPendientes.data.map((factura: any) => {
            const id = `factura-${factura.id}`
            return {
              id,
              tipo: "factura_pendiente" as const,
              titulo: "Factura Pendiente",
              mensaje: `Factura ${factura.numero_factura} de ${factura.cliente?.nombre || "Cliente"} está pendiente de pago`,
              fecha: factura.created_at || factura.fecha,
              leida: leidas.has(id),
              data: factura,
            }
          })
        : []

      notificacionesCache = notificacionesFacturas
      setNotificaciones(notificacionesFacturas)
      setCantidadNoLeidas(notificacionesFacturas.filter((n) => !n.leida).length)
      
      if (facturasPendientes.success) {
        const ttl = getCacheStrategy(endpoint, filtros)
        setCache(cacheKey, facturasPendientes.data, ttl)
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setLoading(false)
      fetchingNotificaciones = false
    }
  }, [isAuthenticated, authenticatedRequest])

  const marcarComoLeida = (id: string) => {
    setNotificaciones((prev) => {
      const actualizadas = prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif))
      notificacionesCache = actualizadas
      return actualizadas
    })
    setCantidadNoLeidas((prev) => Math.max(0, prev - 1))
    
    const leidas = getNotificacionesLeidas()
    leidas.add(id)
    saveNotificacionesLeidas(leidas)
  }

  const marcarTodasComoLeidas = () => {
    setNotificaciones((prev) => {
      const todasLeidas = prev.map((notif) => ({ ...notif, leida: true }))
      notificacionesCache = todasLeidas
      
      const leidas = new Set(todasLeidas.map((n) => n.id))
      saveNotificacionesLeidas(leidas)
      
      return todasLeidas
    })
    setCantidadNoLeidas(0)
  }

  useEffect(() => {
    if (!authChecked || !isAuthenticated) {
      setLoading(false)
      return
    }

    if (notificacionesCache) {
      setNotificaciones(notificacionesCache)
      const leidas = getNotificacionesLeidas()
      setCantidadNoLeidas(notificacionesCache.filter((n) => !leidas.has(n.id)).length)
      setLoading(false)
    }

    if (fetchRef.current) {
      return
    }
    fetchRef.current = true

    let intervalId: NodeJS.Timeout | null = null
    let mounted = true

    if (!notificacionesCache && !fetchingNotificaciones) {
      fetchNotificaciones(false).catch(() => {})
    }
    
    const setupInterval = () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
      if (mounted) {
        intervalId = setInterval(() => {
          if (mounted && !fetchingNotificaciones) {
            fetchNotificaciones(false).catch(() => {})
          }
        }, 5 * 60 * 1000)
      }
    }
    
    const isDashboard = window.location.pathname === '/'
    
    if (isDashboard) {
      const handleDashboardLoaded = () => {
        if (mounted) {
          setupInterval()
        }
      }
      
      window.addEventListener('dashboard:fullyLoaded', handleDashboardLoaded, { once: true })
      
      const timeout = setTimeout(() => {
        if (mounted && intervalId === null) {
          setupInterval()
        }
      }, 2000)

      return () => {
        mounted = false
        fetchRef.current = false
        window.removeEventListener('dashboard:fullyLoaded', handleDashboardLoaded)
        clearTimeout(timeout)
        if (intervalId) {
          clearInterval(intervalId)
        }
      }
    } else {
      setupInterval()
      
      return () => {
        mounted = false
        fetchRef.current = false
        if (intervalId) {
          clearInterval(intervalId)
        }
      }
    }
  }, [authChecked, isAuthenticated])

  return {
    notificaciones,
    loading,
    cantidadNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    refetch: () => fetchNotificaciones(true),
  }
}
