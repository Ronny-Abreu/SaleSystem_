"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BarChart3, Calendar, DollarSign, FileText, TrendingUp } from "lucide-react"
import { facturasApi } from "@/lib/api"

interface ReporteData {
  mes: string
  totalFacturas: number
  totalIngresos: number
  promedioFactura: number
  facturasPagadas: number
  facturasPendientes: number
}

export default function ReportesPage() {
  const [reporteData, setReporteData] = useState<ReporteData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mesSeleccionado, setMesSeleccionado] = useState(() => {
    const hoy = new Date()
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`
  })

  const fetchReportes = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener facturas del mes seleccionado
      const [año, mes] = mesSeleccionado.split("-")
      const fechaInicio = `${año}-${mes}-01`
      const ultimoDia = new Date(Number.parseInt(año), Number.parseInt(mes), 0).getDate()
      const fechaFin = `${año}-${mes}-${ultimoDia}`

      const response = await facturasApi.getAll({
        fecha_desde: fechaInicio,
        fecha_hasta: fechaFin,
      })

      if (response.success) {
        const facturas = response.data

        // Calcular estadísticas
        const totalFacturas = facturas.length
        const facturasPagadas = facturas.filter((f: any) => f.estado === "pagada").length
        const facturasPendientes = facturas.filter((f: any) => f.estado === "pendiente").length
        const totalIngresos = facturas
          .filter((f: any) => f.estado === "pagada")
          .reduce((sum: number, f: any) => sum + f.total, 0)
        const promedioFactura = totalFacturas > 0 ? totalIngresos / facturasPagadas : 0

        const reporte: ReporteData = {
          mes: mesSeleccionado,
          totalFacturas,
          totalIngresos,
          promedioFactura,
          facturasPagadas,
          facturasPendientes,
        }

        setReporteData([reporte])
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
    fetchReportes()
  }, [mesSeleccionado])

  const formatCurrency = (amount: number) => {
    return `RD$${amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}`
  }

  const formatMonth = (monthString: string) => {
    const [año, mes] = monthString.split("-")
    const fecha = new Date(Number.parseInt(año), Number.parseInt(mes) - 1)
    return fecha.toLocaleDateString("es-DO", { year: "numeric", month: "long" })
  }

  const reporte = reporteData[0]

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reportes Mensuales" subtitle="Análisis de ventas y estadísticas del negocio" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Selector de mes */}
            <div className="card mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Seleccionar Período</h2>
                <div className="flex items-center space-x-4">
                  <Calendar size={20} className="text-slate-400" />
                  <input
                    type="month"
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-600 mt-2">Generando reporte...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>Error: {error}</p>
              </div>
            ) : reporte ? (
              <>
                {/* Título del reporte */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">Reporte de {formatMonth(reporte.mes)}</h1>
                  <p className="text-slate-600">Resumen de actividad comercial del período seleccionado</p>
                </div>

                {/* Estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Facturas</p>
                        <p className="text-2xl font-bold text-blue-600">{reporte.totalFacturas}</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Ingresos Totales</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(reporte.totalIngresos)}</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Promedio por Factura</p>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(reporte.promedioFactura)}</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Tasa de Cobro</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {reporte.totalFacturas > 0
                            ? `${((reporte.facturasPagadas / reporte.totalFacturas) * 100).toFixed(1)}%`
                            : "0%"}
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-full">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles del reporte */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Estado de facturas */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado de Facturas</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium text-slate-900">Pagadas</span>
                        </div>
                        <span className="text-green-600 font-semibold">{reporte.facturasPagadas}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="font-medium text-slate-900">Pendientes</span>
                        </div>
                        <span className="text-yellow-600 font-semibold">{reporte.facturasPendientes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen financiero */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen Financiero</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-600">Ingresos Confirmados:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(reporte.totalIngresos)}</span>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-slate-600">Promedio por Venta:</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(reporte.promedioFactura)}</span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-600">Ventas por Día:</span>
                        <span className="font-semibold text-slate-900">
                          {(
                            reporte.totalFacturas /
                            new Date(
                              Number.parseInt(mesSeleccionado.split("-")[0]),
                              Number.parseInt(mesSeleccionado.split("-")[1]),
                              0,
                            ).getDate()
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de imprimir */}
                <div className="mt-6 text-center">
                  <button onClick={() => window.print()} className="btn-primary flex items-center space-x-2 mx-auto">
                    <FileText size={16} />
                    <span>Imprimir Reporte</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No hay datos para el período seleccionado</p>
                <p className="text-sm">Selecciona un mes diferente para ver el reporte</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
