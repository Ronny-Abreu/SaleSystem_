"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Eye, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { clientesApi, facturasApi } from "@/lib/api"
import type { Cliente, Factura } from "@/lib/types"
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi"

export default function DetalleCliente() {
  const params = useParams()
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const fromClientesHoy = searchParams.get("fromClientesHoy") === "true"
  const fromDashboard = searchParams.get("fromDashboard") === "true"
  const clienteId = Number(params.id)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFacturas, setLoadingFacturas] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ordenFecha, setOrdenFecha] = useState<"asc" | "desc">("desc") // desc = más recientes primero, asc = más antiguas primero
  const [filtroHoy, setFiltroHoy] = useState(fromClientesHoy) // Activar filtro si viene desde clientes del día

  // Filtrar facturas por día de hoy si el filtro está activo
  const facturasFiltradas = useMemo(() => {
    if (!filtroHoy) return facturas
    
    const hoy = (() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })()
    
    return facturas.filter((factura) => {
      const [year, month, day] = factura.fecha.split('-').map(Number)
      const fechaFacturaObj = new Date(year, month - 1, day)
      const fechaFactura = (() => {
        const year = fechaFacturaObj.getFullYear()
        const month = String(fechaFacturaObj.getMonth() + 1).padStart(2, '0')
        const day = String(fechaFacturaObj.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })()
      return fechaFactura === hoy
    })
  }, [facturas, filtroHoy])

  // Ordenar facturas por fecha
  const facturasOrdenadas = useMemo(() => {
    return [...facturasFiltradas].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime()
      const fechaB = new Date(b.fecha).getTime()
      return ordenFecha === "desc" ? fechaB - fechaA : fechaA - fechaB
    })
  }, [facturasFiltradas, ordenFecha])

  // Calcular estadísticas
  const totalFacturas = facturas.length
  const facturasPendientes = facturas.filter((f) => f.estado === "pendiente")
  const totalDeuda = facturasPendientes.reduce((sum, f) => sum + f.total, 0)
  const totalPagado = facturas.filter((f) => f.estado === "pagada").reduce((sum, f) => sum + f.total, 0)

  useEffect(() => {
    if (success === "updated") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [success])

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!isAuthenticated) {
          setLoading(false)
          setLoadingFacturas(false)
          return
        }

        // Cargar cliente
        const clienteResponse = await authenticatedRequest(() => clientesApi.getById(clienteId))
        if (clienteResponse.success) {
          setCliente(clienteResponse.data)
        } else {
          setError("Cliente no encontrado")
          return
        }

        setLoadingFacturas(true)
        const facturasResponse = await authenticatedRequest(() => facturasApi.getAll({ cliente_id: clienteId }))
        if (facturasResponse.success) {
          setFacturas(facturasResponse.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
        setLoadingFacturas(false)
      }
    }

    if (clienteId && authChecked) {
      cargarDatos()
    }
  }, [clienteId, authChecked, isAuthenticated])

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Detalle Cliente" subtitle="Cargando información del cliente..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Error" subtitle="No se pudo cargar el cliente" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href={fromDashboard ? "/" : fromClientesHoy ? "/clientes/hoy" : "/clientes"} className="btn-primary">
                {fromDashboard ? "Volver al Dashboard" : "Volver a Clientes"}
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={cliente.nombre} subtitle={`Cliente ${cliente.codigo}`} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Mensaje de éxito */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">Cliente actualizado exitosamente</p>
              </div>
            )}

            {/* Header con botones responsive */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2 md:space-x-3">
              <Link
                href={fromDashboard ? "/" : fromClientesHoy ? "/clientes/hoy" : "/clientes"}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden md:inline">
                  {fromDashboard ? "Volver al dashboard" : fromClientesHoy ? "Volver a clientes del día" : "Volver a clientes"}
                </span>
              </Link>

                <Link
                  href={`/clientes/${clienteId}/editar${fromDashboard ? "?fromDashboard=true" : fromClientesHoy ? "?fromClientesHoy=true" : ""}`}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                  <span className="hidden md:inline">Editar</span>
                </Link>
              </div>

              <Link
                href={`/facturas/nueva?cliente=${clienteId}${fromDashboard ? "&fromDashboard=true" : fromClientesHoy ? "&fromClientesHoy=true" : ""}`}
                className="btn-primary flex items-center space-x-2 px-3 py-2 text-sm"
              >
                <FileText size={16} />
                <span>Nueva Factura</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información del Cliente */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                <div className="card">
                  <div className="mb-6">
                    {/* Header responsive */}
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-3">
                      <div className="flex items-center space-x-3 mb-2 md:mb-0">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Phone className="text-blue-600" size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900">Información del Cliente</h2>
                      </div>
                    </div>
                    <p className="text-slate-600 mt-2 md:mt-0 md:ml-15">Datos de contacto y registro</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                      <p className="text-slate-900 font-medium">{cliente.codigo}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                      <p className="text-slate-900">{cliente.nombre}</p>
                    </div>

                    {cliente.telefono && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                        <div className="flex items-center space-x-2">
                          <Phone size={16} className="text-slate-400" />
                          <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:underline">
                            <p className="text-slate-900">{cliente.telefono}</p>
                          </a>
                        </div>
                      </div>
                    )}

                    {cliente.email && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-slate-400" />
                          <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:underline">
                            <p className="text-slate-900">{cliente.email}</p>
                          </a>
                        </div>
                      </div>
                    )}

                    {cliente.direccion && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                        <div className="flex items-start space-x-2">
                          <MapPin size={16} className="text-slate-400 mt-0.5" />
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.direccion)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            <p className="text-slate-900">{cliente.direccion}</p>
                          </a>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Registro</label>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-slate-400" />
                        <p className="text-slate-900">
                          {new Date(cliente.created_at).toLocaleDateString("es-DO", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facturas del Cliente */}
              <div className="lg:col-span-2 order-2 lg:order-2">
                <div className="card">
                  <div className="mb-6">
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap sm:flex-nowrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h2 className="text-xl font-semibold text-slate-900">Historial de Facturas</h2>
                          <button
                            onClick={() => setFiltroHoy(!filtroHoy)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                              filtroHoy
                                ? "bg-blue-600 text-white hover:bg-blue-700 animate-breathing"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            De hoy
                          </button>
                        </div>
                        <p className="text-slate-600 text-sm">
                          {filtroHoy ? "Facturas del día de hoy" : "Todas las facturas asociadas a este cliente"}
                        </p>

                        {/* Indicador de deuda */}
                        {totalDeuda > 0 && (
                          <div className="mt-3 md:mt-2">
                            <div className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                              Tiene deuda pendiente
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {loadingFacturas ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-slate-600 mt-2">Cargando facturas...</p>
                    </div>
                  ) : facturasOrdenadas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">Número</th>
                            <th className="text-left py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">
                              <div className="flex items-center space-x-2">
                                <span>Fecha</span>
                                <button
                                  onClick={() => setOrdenFecha(ordenFecha === "desc" ? "asc" : "desc")}
                                  className="p-1 hover:bg-slate-100 rounded transition-colors"
                                  title={ordenFecha === "desc" ? "Ordenar: más antiguas primero" : "Ordenar: más recientes primero"}
                                >
                                  {ordenFecha === "desc" ? (
                                    <ArrowUp size={16} className="text-slate-600" />
                                  ) : (
                                    <ArrowDown size={16} className="text-slate-600" />
                                  )}
                                </button>
                              </div>
                            </th>
                            <th className="text-right py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">Total</th>
                            <th className="text-center py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">
                              Estado
                            </th>
                            <th className="text-center py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {facturasOrdenadas.map((factura) => (
                            <tr key={factura.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td
                                className={`py-3 px-2 md:px-4 font-medium text-sm ${
                                  factura.estado === "pendiente" ? "text-red-600" : "text-slate-900"
                                }`}
                              >
                                {factura.numero_factura}
                              </td>
                              <td className="py-3 px-2 md:px-4 text-slate-600 text-sm">
                                {(() => {
                                  const [year, month, day] = factura.fecha.split('-').map(Number)
                                  const fecha = new Date(year, month - 1, day)
                                  return fecha.toLocaleDateString("es-DO")
                                })()}
                              </td>
                              <td className="py-3 px-2 md:px-4 text-right font-semibold text-slate-900 text-sm">
                                RD${factura.total.toLocaleString()}
                              </td>
                              <td className="py-3 px-2 md:px-4 text-center">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    factura.estado === "pagada"
                                      ? "bg-green-100 text-green-800"
                                      : factura.estado === "pendiente"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {factura.estado}
                                </span>
                              </td>
                              <td className="py-3 px-2 md:px-4 text-center">
                                <Link
                                  href={`/facturas/${factura.id}?fromClient=${clienteId}${fromDashboard ? "&fromDashboard=true" : fromClientesHoy ? "&fromClientesHoy=true" : ""}`}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                                >
                                  <Eye size={16} />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                      <p>{filtroHoy ? "No hay facturas del día de hoy" : "No hay facturas registradas"}</p>
                      <p className="text-sm mb-4">
                        {filtroHoy
                          ? "Este cliente no tiene facturas registradas hoy"
                          : "Este cliente aún no tiene facturas asociadas"}
                      </p>
                      {!filtroHoy && (
                        <Link
                          href={`/facturas/nueva?cliente=${clienteId}${fromDashboard ? "&fromDashboard=true" : fromClientesHoy ? "&fromClientesHoy=true" : ""}`}
                          className="btn-primary inline-flex items-center space-x-2"
                        >
                          <FileText size={16} />
                          <span>Crear Primera Factura</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas Rápidas - Móvil después de Historial */}
              <div className="lg:col-span-1 order-3 lg:order-3 mt-6 lg:mt-0">
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen de Cuenta</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total Facturas</span>
                      <span className="font-semibold text-slate-900">{totalFacturas}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total Pagado</span>
                      <span className="font-semibold text-green-600">RD${totalPagado.toLocaleString()}</span>
                    </div>

                    {totalDeuda > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle size={16} className="text-red-500" />
                          <span className="text-red-700 font-medium">Deuda Pendiente</span>
                        </div>
                        <span className="font-bold text-red-600">RD${totalDeuda.toLocaleString()}</span>
                      </div>
                    )}

                    {facturasPendientes.length > 0 && (
                      <div className="text-sm text-red-600">
                        {facturasPendientes.length} factura{facturasPendientes.length !== 1 ? "s" : ""} pendiente
                        {facturasPendientes.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
