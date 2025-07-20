"use client"

import { facturasApi } from "@/lib/api"
import { useState, useEffect } from "react"

interface Estadisticas {
  total_facturas: number
  total_ingresos: number
  promedio_factura: number
}

export function useEstadisticas(fecha?: string) {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEstadisticas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await facturasApi.getEstadisticas(fecha)

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
    fetchEstadisticas()
  }, [fecha])

  return {
    estadisticas,
    loading,
    error,
    refetch: fetchEstadisticas,
  }
}
