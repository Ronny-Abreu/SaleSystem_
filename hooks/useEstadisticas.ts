"use client"

import { facturasApi } from "@/lib/api"
import { useState, useEffect } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"

interface Estadisticas {
  total_facturas: number
  total_ingresos: number
  promedio_factura: number
}

export function useEstadisticas(fecha?: string) {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchEstadisticas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Solo hacer fetch si está autenticado
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      const response = await authenticatedRequest(() => facturasApi.getEstadisticas(fecha))

      if (response.success) {
        setEstadisticas(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Solo hacer fetch cuando la autenticación esté verificada
    if (authChecked) {
      fetchEstadisticas()
    }
  }, [authChecked, isAuthenticated, fecha])

  return {
    estadisticas,
    loading,
    error,
    refetch: fetchEstadisticas,
  }
}
