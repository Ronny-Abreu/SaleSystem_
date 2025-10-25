"use client"

import { facturasApi } from "@/lib/api"
import type { Factura } from "@/lib/types"
import { useState, useEffect } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"

export function useFacturas(filtros?: {
  fecha_desde?: string
  fecha_hasta?: string
  estado?: string
}) {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchFacturas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Solo hacer fetch si está autenticado
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      const response = await authenticatedRequest(() => facturasApi.getAll(filtros))

      if (response.success) {
        setFacturas(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

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
        await fetchFacturas()
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
        await fetchFacturas()
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    // Solo hacer fetch cuando la autenticación esté verificada
    if (authChecked) {
      fetchFacturas()
    }
  }, [authChecked, isAuthenticated, filtros?.fecha_desde, filtros?.fecha_hasta, filtros?.estado])

  return {
    facturas,
    loading,
    error,
    refetch: fetchFacturas,
    crearFactura,
    actualizarEstado,
  }
}
