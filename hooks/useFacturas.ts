"use client"

import { facturasApi } from "@/lib/api"
import type { Factura } from "@/lib/types"
import { useState, useEffect, useCallback } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"
import { generateCacheKey, getFromCache, setCache, invalidateCache, getCacheStrategy } from "@/lib/cache"

export function useFacturas(filtros?: {
  fecha_desde?: string
  fecha_hasta?: string
  estado?: string
  cliente_id?: number
  incluir_detalles?: boolean
}) {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchFacturas = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Solo hacer fetch si está autenticado
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      // Generar clave de cache
      const endpoint = "api/facturas.php"
      const cacheKey = generateCacheKey(endpoint, "GET", filtros)
      
      if (!forceRefresh) {
        const cached = getFromCache<Factura[]>(cacheKey)
        if (cached) {
          setFacturas(cached)
          setLoading(false)

          authenticatedRequest(() => facturasApi.getAll(filtros))
            .then((response) => {
              if (response.success) {
                const ttl = getCacheStrategy(endpoint, filtros)
                setCache(cacheKey, response.data, ttl)
                setFacturas(response.data)
              }
            })
            .catch(() => {
            })
          return
        }
      }

      const response = await authenticatedRequest(() => facturasApi.getAll(filtros))

      if (response.success) {
        setFacturas(response.data)
        const ttl = getCacheStrategy(endpoint, filtros)
        setCache(cacheKey, response.data, ttl)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, authenticatedRequest, filtros])

  const crearFactura = async (factura: {
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
  }) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => facturasApi.create(factura))
      if (response.success) {
        invalidateCache("facturas.php")
        invalidateCache("estadisticas")
        await fetchFacturas(true)
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('factura:created', { detail: response.data }))
        }
        
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  const actualizarEstado = async (id: number, estado: string) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => facturasApi.updateEstado(id, estado))
      if (response.success) {
        // Invalidar cache de facturas
        invalidateCache("facturas.php")
        invalidateCache("estadisticas")
        await fetchFacturas(true)
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('factura:updated', { detail: { id, estado } }))
        }
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    if (authChecked) {
      fetchFacturas(false)
    }
  }, [authChecked, isAuthenticated, filtros?.fecha_desde, filtros?.fecha_hasta, filtros?.estado, filtros?.cliente_id, filtros?.incluir_detalles])

  return {
    facturas,
    loading,
    error,
    refetch: () => fetchFacturas(true),
    crearFactura,
    actualizarEstado,
  }
}
