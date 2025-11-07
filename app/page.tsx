"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Package, DollarSign, TrendingUp, TrendingDown, Calendar, Plus, FileText, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDashboardData } from "@/hooks/useDashboardData"
import { useMemo } from "react"
import type { FacturaDetalle } from "@/lib/types"

export default function Home() {
  const router = useRouter()
  const hoy = new Date().toISOString().split("T")[0]

  const {
    facturasHoy,
    facturasAyer,
    productos,
    estadisticasHoy,
    estadisticasAyer,
    loading: loadingAll,
  } = useDashboardData()

  const detallesFacturas = useMemo(() => {
    const detallesMap = new Map<number, FacturaDetalle[]>()
    facturasHoy.forEach((factura) => {
      if (factura.detalles && factura.detalles.length > 0) {
        detallesMap.set(factura.id, factura.detalles)
      }
    })
    return detallesMap
  }, [facturasHoy])

  // Calcular ingresos y porcentaje
  const ingresosHoy = estadisticasHoy?.total_ingresos || 0
  const ingresosAyer = estadisticasAyer?.total_ingresos || 0
  const loadingStatsHoy = loadingAll
  const loadingStatsAyer = loadingAll
  const loadingFacturas = loadingAll
  const porcentajeIngresos = useMemo(() => {
    if (ingresosAyer === 0) {
      return ingresosHoy > 0 ? "+100%" : "0%"
    }
    const cambio = ((ingresosHoy - ingresosAyer) / ingresosAyer) * 100
    return `${cambio >= 0 ? "+" : ""}${cambio.toFixed(1)}%`
  }, [ingresosHoy, ingresosAyer])

  // Calcular clientes únicos que compraron hoy
  const clientesUnicosHoy = useMemo(() => {
    const clientesSet = new Set<number>()
    facturasHoy.forEach((factura) => {
      if (factura.cliente_id) {
        clientesSet.add(factura.cliente_id)
      }
    })
    return clientesSet.size
  }, [facturasHoy])

  // Obtener información de clientes recientes que compraron hoy
  const clientesRecientes = useMemo(() => {
    const clientesMap = new Map<number, { id: number; nombre: string; codigo: string; fechaUltimaCompra: Date }>()
    
    facturasHoy.forEach((factura) => {
      if (factura.cliente_id && factura.cliente) {
        const fechaCompra = new Date(factura.created_at)
        const clienteExistente = clientesMap.get(factura.cliente_id)
        
        if (!clienteExistente || fechaCompra > clienteExistente.fechaUltimaCompra) {
          clientesMap.set(factura.cliente_id, {
            id: factura.cliente_id,
            nombre: factura.cliente.nombre || "Cliente desconocido",
            codigo: factura.cliente.codigo || "",
            fechaUltimaCompra: fechaCompra,
          })
        }
      }
    })

    return Array.from(clientesMap.values())
      .sort((a, b) => b.fechaUltimaCompra.getTime() - a.fechaUltimaCompra.getTime())
      .slice(0, 5)
  }, [facturasHoy])

  // Calcular clientes únicos del día anterior
  const clientesUnicosAyer = useMemo(() => {
    const clientesSet = new Set<number>()
    facturasAyer.forEach((factura) => {
      if (factura.cliente_id) {
        clientesSet.add(factura.cliente_id)
      }
    })
    return clientesSet.size
  }, [facturasAyer])

  const porcentajeClientes = useMemo(() => {
    if (clientesUnicosAyer === 0) {
      return clientesUnicosHoy > 0 ? "+100%" : "0%"
    }
    const cambio = ((clientesUnicosHoy - clientesUnicosAyer) / clientesUnicosAyer) * 100
    return `${cambio >= 0 ? "+" : ""}${cambio.toFixed(1)}%`
  }, [clientesUnicosHoy, clientesUnicosAyer])

  // Calcular productos vendidos hoy
  const productosVendidosHoy = useMemo(() => {
    const productosMap = new Map<number, { nombre: string; cantidadTotal: number; producto_id: number }>()

    detallesFacturas.forEach((detalles) => {
      detalles.forEach((detalle) => {
        if (!productosMap.has(detalle.producto_id)) {
          productosMap.set(detalle.producto_id, {
            nombre: detalle.nombre_producto,
            cantidadTotal: 0,
            producto_id: detalle.producto_id,
          })
        }
        const producto = productosMap.get(detalle.producto_id)!
        producto.cantidadTotal += detalle.cantidad
      })
    })

    return Array.from(productosMap.values())
      .map((prod) => {
        const producto = productos.find((p) => p.id === prod.producto_id)
        return {
          ...prod,
          stock: producto?.stock || 0,
        }
      })
      .sort((a, b) => b.cantidadTotal - a.cantidadTotal)
      .slice(0, 5)
  }, [detallesFacturas, productos])

  const productosVendidosAyer = useMemo(() => {
    let totalCantidad = 0
    facturasAyer.forEach((factura) => {
      if (factura.detalles) {
        totalCantidad += factura.detalles.reduce(
          (sum: number, detalle: FacturaDetalle) => sum + detalle.cantidad,
          0,
        )
      }
    })
    return totalCantidad
  }, [facturasAyer])

  const porcentajeProductos = useMemo(() => {
    const productosHoy = productosVendidosHoy.reduce((sum, p) => sum + p.cantidadTotal, 0)
    if (productosVendidosAyer === 0) {
      return productosHoy > 0 ? "+100%" : "0%"
    }
    const cambio = ((productosHoy - productosVendidosAyer) / productosVendidosAyer) * 100
    return `${cambio >= 0 ? "+" : ""}${cambio.toFixed(1)}%`
  }, [productosVendidosHoy, productosVendidosAyer])

  // Historial de ingresos del día (facturas de hoy)
  const historialIngresos = useMemo(() => {
    return [...facturasHoy]
      .sort((a, b) => {
        const fechaA = new Date(a.created_at)
        const fechaB = new Date(b.created_at)
        return fechaB.getTime() - fechaA.getTime()
      })
      .slice(0, 5)
      .map((factura) => ({
        id: factura.id,
        numero: factura.numero_factura,
        cliente: factura.cliente?.nombre || "Cliente desconocido",
        total: factura.total,
        hora: new Date(factura.created_at).toLocaleTimeString("es-DO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
  }, [facturasHoy])

  // URL para facturas de hoy
  const urlFacturasHoy = `/facturas?fecha_desde=${hoy}&fecha_hasta=${hoy}`

  const esPositivo = (porcentaje: string) => {
    return !porcentaje.startsWith("-") && porcentaje !== "0%"
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Resumen de ventas y actividad del día" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Acciones Rápidas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/facturas/nueva?fromDashboard=true" className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Plus className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Nueva Factura</h3>
                    <p className="text-sm text-slate-600">Crear una nueva factura</p>
                  </div>
                </div>
              </Link>

              <Link href="/clientes/nuevo?fromDashboard=true" className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Nuevo Cliente</h3>
                    <p className="text-sm text-slate-600">Registrar cliente</p>
                  </div>
                </div>
              </Link>

              <Link href="/productos/nuevo?fromDashboard=true" className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Package className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Nuevo Producto</h3>
                    <p className="text-sm text-slate-600">Agregar producto</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Estadísticas del Día</h2>
              <div className="flex items-center text-sm text-slate-600 mt-1">
                <Calendar size={16} className="mr-2" />
                {new Date().toLocaleDateString("es-DO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card de Ingresos Hoy */}
              <div
                onClick={() => router.push(urlFacturasHoy)}
                className="card hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Ingresos Hoy</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {loadingAll ? "..." : `RD$${ingresosHoy.toLocaleString()}`}
                    </p>
                    <div className="flex items-center mt-2">
                      {esPositivo(porcentajeIngresos) ? (
                        <TrendingUp size={14} className="text-green-500 mr-1" />
                      ) : (
                        <TrendingDown size={14} className="text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm ${
                          esPositivo(porcentajeIngresos) ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {loadingAll ? "..." : porcentajeIngresos}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
                {/* Historial de ingresos dentro de la card */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-medium text-slate-600 mb-2">Historial del día:</p>
                  {loadingAll ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mx-auto"></div>
                    </div>
                  ) : historialIngresos.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {historialIngresos.map((ingreso) => (
                        <Link
                          key={ingreso.id}
                          href={`/facturas/${ingreso.id}?fromIngresosHoy=true`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">{ingreso.numero}</p>
                            <p className="text-xs text-slate-600 truncate">{ingreso.cliente}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs font-semibold text-slate-900">
                              RD${ingreso.total.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">{ingreso.hora}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">No hay ingresos registrados hoy</p>
                  )}
                </div>
              </div>

              {/* Card de Clientes */}
              <div
                onClick={() => router.push("/clientes/hoy")}
                className="card hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Clientes</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {loadingAll ? "..." : clientesUnicosHoy.toString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Clientes únicos que compraron hoy</p>
                    <div className="flex items-center mt-2">
                      {esPositivo(porcentajeClientes) ? (
                        <TrendingUp size={14} className="text-green-500 mr-1" />
                      ) : (
                        <TrendingDown size={14} className="text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm ${
                          esPositivo(porcentajeClientes) ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {porcentajeClientes}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="text-purple-600" size={24} />
                  </div>
                </div>
                {/* Historial de clientes recientes dentro de la card */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-medium text-slate-600 mb-2">Clientes recientes:</p>
                  {loadingAll ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                  ) : clientesRecientes.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {clientesRecientes.map((cliente) => (
                        <Link
                          key={cliente.id}
                          href={`/clientes/${cliente.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">{cliente.nombre}</p>
                            <p className="text-xs text-slate-600 truncate">{cliente.codigo}</p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-xs text-slate-500">
                              {cliente.fechaUltimaCompra.toLocaleTimeString("es-DO", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">No hay clientes registrados hoy</p>
                  )}
                </div>
              </div>

              {/* Card de Productos */}
              <div
                onClick={() => router.push("/productos/hoy")}
                className="card hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Productos</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {loadingAll ? "..." : productosVendidosHoy.length.toString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Productos comprados hoy</p>
                    <div className="flex items-center mt-2">
                      {esPositivo(porcentajeProductos) ? (
                        <TrendingUp size={14} className="text-green-500 mr-1" />
                      ) : (
                        <TrendingDown size={14} className="text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm ${
                          esPositivo(porcentajeProductos) ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {porcentajeProductos}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="text-orange-600" size={24} />
                  </div>
                </div>
                {/* Historial de productos dentro de la card */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-medium text-slate-600 mb-2">Productos más vendidos:</p>
                  {loadingAll ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mx-auto"></div>
                    </div>
                  ) : productosVendidosHoy.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {productosVendidosHoy.map((producto) => (
                        <Link
                          key={producto.producto_id}
                          href={`/productos/${producto.producto_id}/editar`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-900 truncate">{producto.nombre}</p>
                            <p className="text-xs text-slate-600">Comprado {producto.cantidadTotal}x hoy</p>
                          </div>
                          <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 ml-2">
                            Stock: {producto.stock}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">No hay productos vendidos hoy</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
