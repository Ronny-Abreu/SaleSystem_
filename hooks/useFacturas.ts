"use client"

import { facturasApi } from "@/lib/api"
import type { Factura } from "@/lib/types"
import { useState, useEffect } from "react"

export function useFacturas(filtros?: {
  fecha_desde?: string
  fecha_hasta?: string
  estado?: string
}) {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFacturas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await facturasApi.getAll(filtros)

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
      const response = await facturasApi.create(factura)
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
      const response = await facturasApi.updateEstado(id, estado)
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
    fetchFacturas()
  }, [filtros?.fecha_desde, filtros?.fecha_hasta, filtros?.estado])

  return {
    facturas,
    loading,
    error,
    refetch: fetchFacturas,
    crearFactura,
    actualizarEstado,
  }
}
