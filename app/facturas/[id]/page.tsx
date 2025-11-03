"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Printer, Check, X, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { facturasApi } from "@/lib/api"
import type { Factura } from "@/lib/types"

type EstadoFactura = "pendiente" | "pagada" | "anulada"

export default function FacturaDetalle() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromClient = searchParams.get("fromClient")
  const fromIngresosHoy = searchParams.get("fromIngresosHoy") === "true"
  const fromClientesHoy = searchParams.get("fromClientesHoy") === "true"

  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualizandoEstado, setActualizandoEstado] = useState(false)

  const fetchFactura = async () => {
    try {
      setLoading(true)
      const response = await facturasApi.getById(Number(params.id))

      if (response.success) {
        setFactura(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (nuevoEstado: EstadoFactura) => {
    if (!factura) return

    try {
      setActualizandoEstado(true)
      const response = await facturasApi.updateEstado(factura.id, nuevoEstado)

      if (response.success) {
        setFactura({ ...factura, estado: nuevoEstado })
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar estado")
    } finally {
      setActualizandoEstado(false)
    }
  }

  useEffect(() => {
    fetchFactura()
  }, [params.id])

  // Determinar la URL de regreso
  const hoy = new Date().toISOString().split("T")[0]
  const backUrl = fromClient
    ? `/clientes/${fromClient}${fromClientesHoy ? "?fromClientesHoy=true" : ""}`
    : fromIngresosHoy
      ? `/facturas?fecha_desde=${hoy}&fecha_hasta=${hoy}`
      : "/facturas"

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Cargando..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !factura) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Error" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || "Factura no encontrada"}</p>
              <Link href={backUrl} className="btn-primary">
                Volver
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pagada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "anulada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "pagada":
        return <Check size={16} />
      case "pendiente":
        return <Clock size={16} />
      case "anulada":
        return <X size={16} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={`Factura ${factura.numero_factura}`} subtitle="Detalles de la factura" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href={backUrl} // Usar la URL dinámica
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline">
                  {fromClient
                    ? "Volver al Cliente"
                    : fromIngresosHoy
                      ? "Volver a Ingresos del Día"
                      : "Volver a facturas"}
                </span>
              </Link>

              <div className="flex space-x-2 md:space-x-3">
                <button onClick={() => window.print()} className="btn-secondary flex items-center space-x-2 text-sm">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Información de la factura */}
            <div className="card mb-6">
              <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 md:mb-0">Información General</h2>

                  {/* Estado actual con flecha indicadora */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600 md:hidden">Estado actual</span>
                    <ArrowRight size={16} className="text-slate-400 md:hidden" />
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 w-fit ${getEstadoColor(factura.estado)}`}
                    >
                      {getEstadoIcon(factura.estado)}
                      <span className="capitalize">{factura.estado}</span>
                    </span>
                  </div>
                </div>

                {/* Botones para cambiar estado - Debajo del título en móvil */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {factura.estado === "pendiente" && (
                    <button
                      onClick={() => cambiarEstado("pagada")}
                      disabled={actualizandoEstado}
                      className="btn-primary flex items-center space-x-2 text-xs md:text-sm px-3 py-2"
                    >
                      <Check size={14} />
                      <span>Marcar Pagada</span>
                    </button>
                  )}

                  {factura.estado === "pendiente" && (
                    <button
                      onClick={() => cambiarEstado("anulada")}
                      disabled={actualizandoEstado}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-xs md:text-sm"
                    >
                      <X size={14} />
                      <span>Anular</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Factura</h3>
                  <p className="text-slate-600 text-sm">Número: {factura.numero_factura}</p>
                  <p className="text-slate-600 text-sm">Fecha: {new Date(factura.fecha).toLocaleDateString("es-DO")}</p>
                  <p className="text-slate-600 text-sm">
                    Creada: {new Date(factura.created_at).toLocaleDateString("es-DO")}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Cliente</h3>
                  <p className="text-slate-600 text-sm">Código: {factura.cliente?.codigo}</p>
                  <p className="text-slate-600 text-sm">Nombre: {factura.cliente?.nombre}</p>
                  {factura.cliente?.telefono && (
                    <p className="text-slate-600 text-sm">Teléfono: {factura.cliente.telefono}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Totales</h3>
                  <p className="text-slate-600 text-sm">Subtotal: RD${factura.subtotal.toLocaleString()}</p>
                  <p className="text-lg font-semibold text-slate-900">Total: RD${factura.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Detalles de la factura */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Artículos</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">Artículo</th>
                      <th className="text-center py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">Cant.</th>
                      <th className="text-right py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">
                        Precio Unit.
                      </th>
                      <th className="text-right py-3 px-2 md:px-4 font-semibold text-slate-700 text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factura.detalles?.map((detalle, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3 px-2 md:px-4 text-slate-900 text-sm">{detalle.nombre_producto}</td>
                        <td className="py-3 px-2 md:px-4 text-center text-slate-600 text-sm">{detalle.cantidad}</td>
                        <td className="py-3 px-2 md:px-4 text-right text-slate-600 text-sm">
                          RD${detalle.precio_unitario.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 md:px-4 text-right font-semibold text-slate-900 text-sm">
                          RD${detalle.total_linea.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300">
                      <td colSpan={3} className="py-3 px-2 md:px-4 text-right font-semibold text-slate-900">
                        Total:
                      </td>
                      <td className="py-3 px-2 md:px-4 text-right text-lg md:text-xl font-bold text-slate-900">
                        RD${factura.total.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Comentarios */}
            {factura.comentario && (
              <div className="card">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Comentarios</h3>
                <p className="text-slate-600">{factura.comentario}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
