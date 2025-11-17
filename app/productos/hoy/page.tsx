"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Package, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { facturasApi } from "@/lib/api"
import type { FacturaDetalle } from "@/lib/types"
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi"
import { useProductos } from "@/hooks/useProductos"
import { useFacturas } from "@/hooks/useFacturas"
import { GraficoCircularProductos } from "@/components/ui/grafico-circular-productos"

export default function ProductosHoy() {
  const hoy = (() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })()
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()
  const { productos } = useProductos()
  const { facturas: facturasHoy, loading: loadingFacturas } = useFacturas({
    fecha_desde: hoy,
    fecha_hasta: hoy,
  })

  const [detallesFacturas, setDetallesFacturas] = useState<Map<number, FacturaDetalle[]>>(new Map())
  const [loadingDetalles, setLoadingDetalles] = useState(false)

  // Obtener detalles de todas las facturas de hoy
  useEffect(() => {
    const fetchDetalles = async () => {
      if (!authChecked || !isAuthenticated || facturasHoy.length === 0) {
        setLoadingDetalles(false)
        return
      }

      try {
        setLoadingDetalles(true)
        const detallesMap = new Map<number, FacturaDetalle[]>()

        await Promise.all(
          facturasHoy.map(async (factura) => {
            try {
              const response = await authenticatedRequest(() => facturasApi.getById(factura.id))
              if (response.success && response.data.detalles) {
                detallesMap.set(factura.id, response.data.detalles)
              }
            } catch (err) {
              console.error(`Error obteniendo detalles de factura ${factura.id}:`, err)
            }
          }),
        )

        setDetallesFacturas(detallesMap)
      } catch (err) {
        console.error("Error obteniendo detalles:", err)
      } finally {
        setLoadingDetalles(false)
      }
    }

    fetchDetalles()
  }, [authChecked, isAuthenticated, authenticatedRequest, facturasHoy])

  // Calcular productos vendidos hoy
  const productosVendidosHoy = useMemo(() => {
    const productosMap = new Map<
      number,
      { nombre: string; cantidadTotal: number; producto_id: number; stock: number }
    >()

    detallesFacturas.forEach((detalles) => {
      detalles.forEach((detalle) => {
        const producto = productos.find((p) => p.id === detalle.producto_id)
        if (!productosMap.has(detalle.producto_id)) {
          productosMap.set(detalle.producto_id, {
            nombre: detalle.nombre_producto,
            cantidadTotal: 0,
            producto_id: detalle.producto_id,
            stock: producto?.stock || 0,
          })
        }
        const productoMap = productosMap.get(detalle.producto_id)!
        productoMap.cantidadTotal += detalle.cantidad
        productoMap.stock = producto?.stock || 0
      })
    })

    return Array.from(productosMap.values()).sort((a, b) => b.cantidadTotal - a.cantidadTotal)
  }, [detallesFacturas, productos])

  const loading = loadingFacturas || loadingDetalles

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Productos del Día" subtitle="Productos comprados hoy" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header con vuelta a dashboard */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Título y fecha */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Productos Comprados Hoy</h1>
              <p className="text-sm md:text-base text-slate-600">
                {new Date().toLocaleDateString("es-DO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Card con gráfico y lista de productos */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Todos los Productos (Hoy)</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-slate-600 mt-2">Cargando...</p>
                </div>
              ) : productosVendidosHoy.length > 0 ? (
                <>

                  {/* Gráfico circular */}
                  <div className="mb-6">
                    <GraficoCircularProductos productos={productosVendidosHoy.slice(0, 5)} />
                  </div>

                  {/* Lista de productos */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {productosVendidosHoy.map((producto, index) => {
                      const colores = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
                      const colorProducto = colores[index % colores.length]
                      return (
                        <Link
                          key={producto.producto_id}
                          href={`/productos/${producto.producto_id}/editar?fromProductosHoy=true`}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${colorProducto}20` }}
                            >
                              <span className="text-xs font-bold" style={{ color: colorProducto }}>
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{producto.nombre}</p>
                              <p className="text-xs text-slate-600">
                                {producto.cantidadTotal} unidad{producto.cantidadTotal !== 1 ? "es" : ""} comprada
                                {producto.cantidadTotal !== 1 ? "s" : ""} hoy
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                              Stock: {producto.stock}
                            </span>
                            <Package size={16} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Package size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay productos vendidos hoy</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
