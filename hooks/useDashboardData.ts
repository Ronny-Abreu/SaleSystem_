"use client"

import { useState, useEffect } from "react"
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
  facturasPendientes: Factura[]
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    facturasHoy: [],
    facturasAyer: [],
    productos: [],
    estadisticasHoy: null,
    estadisticasAyer: null,
    facturasPendientes: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  useEffect(() => {
    if (!authChecked || !isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)

        const hoy = new Date().toISOString().split("T")[0]
        const ayer = new Date()
        ayer.setDate(ayer.getDate() - 1)
        const fechaAyer = ayer.toISOString().split("T")[0]

        // Ejecutar todos los requests en paralelo
        const [
          facturasHoyResponse,
          facturasAyerResponse,
          productosResponse,
          estadisticasHoyResponse,
          estadisticasAyerResponse,
          facturasPendientesResponse,
        ] = await Promise.all([
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
          authenticatedRequest(() => facturasApi.getEstadisticas(hoy)),
          authenticatedRequest(() => facturasApi.getEstadisticas(fechaAyer)),
          authenticatedRequest(() => facturasApi.getAll({ estado: "pendiente" })),
        ])

        setData({
          facturasHoy: facturasHoyResponse.success ? facturasHoyResponse.data : [],
          facturasAyer: facturasAyerResponse.success ? facturasAyerResponse.data : [],
          productos: productosResponse.success
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
            : [],
          estadisticasHoy: estadisticasHoyResponse.success ? estadisticasHoyResponse.data : null,
          estadisticasAyer: estadisticasAyerResponse.success ? estadisticasAyerResponse.data : null,
          facturasPendientes: facturasPendientesResponse.success ? facturasPendientesResponse.data : [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [authChecked, isAuthenticated, authenticatedRequest])

  return {
    ...data,
    loading,
    error,
  }
}

