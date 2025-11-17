"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { FileText, Plus, Eye, Filter, Search, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { useFacturas } from "@/hooks/useFacturas"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"

export default function FacturasPage() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const numero = searchParams.get("numero")
  const fechaDesdeUrl = searchParams.get("fecha_desde")
  const fechaHastaUrl = searchParams.get("fecha_hasta")

  const [showSuccess, setShowSuccess] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState("")
  const [filtroFecha, setFiltroFecha] = useState(fechaDesdeUrl || "")
  const [filtroFechaHasta, setFiltroFechaHasta] = useState(fechaHastaUrl || "")
  const [busqueda, setBusqueda] = useState("")

  const { facturas, loading, error } = useFacturas({
    estado: filtroEstado || undefined,
    fecha_desde: filtroFecha || undefined,
    fecha_hasta: filtroFechaHasta || undefined,
  })

  // Filtrar facturas por búsqueda local
  const facturasFiltradas = facturas.filter((factura) => {
    if (!busqueda) return true
    const busquedaLower = busqueda.toLowerCase()
    return (
      factura.numero_factura.toLowerCase().includes(busquedaLower) ||
      factura.cliente?.nombre?.toLowerCase().includes(busquedaLower) ||
      factura.cliente?.codigo?.toLowerCase().includes(busquedaLower)
    )
  })

  useEffect(() => {
    if (success === "true" && numero) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [success, numero])

  // Inicializar filtros desde URL si están presentes
  useEffect(() => {
    if (fechaDesdeUrl) {
      setFiltroFecha(fechaDesdeUrl)
    }
    if (fechaHastaUrl) {
      setFiltroFechaHasta(fechaHastaUrl)
    }
  }, [fechaDesdeUrl, fechaHastaUrl])

  // Detectar si se está consultando un solo día (ingresos del día)
  const esConsultaDiaEspecifico = useMemo(() => {
    return filtroFecha && filtroFechaHasta && filtroFecha === filtroFechaHasta
  }, [filtroFecha, filtroFechaHasta])

  const fechaFormateada = useMemo(() => {
    if (!esConsultaDiaEspecifico || !filtroFecha) return null
    try {
      const [year, month, day] = filtroFecha.split("-").map(Number)
      const fecha = new Date(year, month - 1, day)
      return fecha.toLocaleDateString("es-DO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return null
    }
  }, [esConsultaDiaEspecifico, filtroFecha])

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Facturas" subtitle="Gestión de facturas de venta" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="max-w-6xl mx-auto">
            {/* Mensaje de éxito */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">¡Factura creada exitosamente!</p>
                    <p className="text-sm text-green-700">Factura {numero} ha sido registrada correctamente.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              {esConsultaDiaEspecifico ? (
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                    Lista de Facturas
                  </h1>
                  <p className="text-sm md:text-base text-slate-600">
                    Todas las facturas registradas en el sistema
                  </p>
                </div>
              )}

              {/* Botón desktop */}
              <div className="hidden md:block">
                <Link
                  href={esConsultaDiaEspecifico ? `/facturas/nueva?fromIngresosHoy=true` : "/facturas/nueva"}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Nueva Factura</span>
                </Link>
              </div>
            </div>

            {/* Título y fecha (solo para ingresos del día) */}
            {esConsultaDiaEspecifico && (
              <div className="mb-6">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                  Ingresos del Día
                </h1>
                <p className="text-sm md:text-base text-slate-600">
                  Facturas registradas el {fechaFormateada}
                </p>
              </div>
            )}

            {/* Filtros */}
            <div className="card mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Filtros:</span>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por código de factura o nombre del cliente..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pagada">Pagadas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="anulada">Anuladas</option>
                  </select>

                  <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => {
                      const fechaValue = e.target.value
                      if (fechaValue) {
                        const fechaValidada = fechaValue.match(/^\d{4}-\d{2}-\d{2}$/)
                        if (fechaValidada) {
                          setFiltroFecha(fechaValue)
                        }
                      } else {
                        setFiltroFecha("")
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Fecha desde"
                  />

                  <input
                    type="date"
                    value={filtroFechaHasta}
                    onChange={(e) => {
                      const fechaValue = e.target.value
                      if (fechaValue) {
                        const fechaValidada = fechaValue.match(/^\d{4}-\d{2}-\d{2}$/)
                        if (fechaValidada) {
                          setFiltroFechaHasta(fechaValue)
                        }
                      } else {
                        setFiltroFechaHasta("")
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Fecha hasta"
                  />
                </div>
              </div>
            </div>

            {/* Lista de facturas */}
            <div className="card">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-600 mt-2">Cargando facturas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error: {error}</p>
                </div>
              ) : facturasFiltradas.length > 0 ? (
                <>
                  {/* Vista desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Número</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha</th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700">Total</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Estado</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturasFiltradas.map((factura) => (
                          <tr key={factura.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium text-slate-900">{factura.numero_factura}</td>
                            <td className="py-3 px-4 text-slate-600">
                              {factura.cliente?.nombre || "Cliente desconocido"}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {new Date(factura.fecha).toLocaleDateString("es-DO")}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-slate-900">
                              RD${factura.total.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
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
                            <td className="py-3 px-4 text-center">
                              <Link
                                href={`/facturas/${factura.id}${esConsultaDiaEspecifico ? "?fromIngresosHoy=true" : ""}`}
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

                  {/* Vista móvil */}
                  <div className="md:hidden space-y-4">
                    {facturasFiltradas.map((factura) => (
                      <div key={factura.id} className="p-4 border border-slate-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{factura.numero_factura}</span>
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
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Cliente: {factura.cliente?.nombre || "Cliente desconocido"}
                        </p>
                        <p className="text-sm text-slate-600 mb-3">
                          Fecha: {new Date(factura.fecha).toLocaleDateString("es-DO")}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-slate-900">
                            RD${factura.total.toLocaleString()}
                          </span>
                          <Link
                            href={`/facturas/${factura.id}${esConsultaDiaEspecifico ? "?fromIngresosHoy=true" : ""}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay facturas registradas</p>
                  <p className="text-sm">Las facturas aparecerán aquí cuando se creen</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón flotante para móvil */}
          <div className="md:hidden fixed bottom-6 right-6 z-50">
            <Link
              href={esConsultaDiaEspecifico ? `/facturas/nueva?fromIngresosHoy=true` : "/facturas/nueva"}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
              title="Nueva Factura"
            >
              <Plus size={24} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}
