"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Printer, Check, X, Clock } from "lucide-react"
import Link from "next/link"
import { facturasApi } from "@/lib/api"
import type { Factura } from "@/lib/types"

type EstadoFactura = "pendiente" | "pagada" | "anulada"

export default function FacturaDetalle() {
  const params = useParams()
  const router = useRouter()
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
              <Link href="/facturas" className="btn-primary">
                Volver a Facturas
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

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/facturas"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Volver a facturas</span>
              </Link>

              <div className="flex space-x-3">
                <button onClick={() => window.print()} className="btn-secondary flex items-center space-x-2">
                  <Printer size={16} />
                  <span>Imprimir</span>
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Información General</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getEstadoColor(factura.estado)}`}
                  >
                    {getEstadoIcon(factura.estado)}
                    <span className="capitalize">{factura.estado}</span>
                  </span>

                  {/* Botones para cambiar estado */}
                  {factura.estado !== "pagada" && (
                    <button
                      onClick={() => cambiarEstado("pagada")}
                      disabled={actualizandoEstado}
                      className="btn-primary flex items-center space-x-2 text-sm"
                    >
                      <Check size={14} />
                      <span>Marcar Pagada</span>
                    </button>
                  )}

                  {factura.estado !== "pendiente" && factura.estado !== "anulada" && (
                    <button
                      onClick={() => cambiarEstado("pendiente")}
                      disabled={actualizandoEstado}
                      className="btn-secondary flex items-center space-x-2 text-sm"
                    >
                      <Clock size={14} />
                      <span>Marcar Pendiente</span>
                    </button>
                  )}

                  {factura.estado !== "anulada" && (
                    <button
                      onClick={() => cambiarEstado("anulada")}
                      disabled={actualizandoEstado}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm"
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
                  <p className="text-slate-600">Número: {factura.numero_factura}</p>
                  <p className="text-slate-600">Fecha: {new Date(factura.fecha).toLocaleDateString("es-DO")}</p>
                  <p className="text-slate-600">Creada: {new Date(factura.created_at).toLocaleDateString("es-DO")}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Cliente</h3>
                  <p className="text-slate-600">Código: {factura.cliente?.codigo}</p>
                  <p className="text-slate-600">Nombre: {factura.cliente?.nombre}</p>
                  {factura.cliente?.telefono && <p className="text-slate-600">Teléfono: {factura.cliente.telefono}</p>}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Totales</h3>
                  <p className="text-slate-600">Subtotal: RD${factura.subtotal.toLocaleString()}</p>
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
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Artículo</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Cantidad</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Precio Unit.</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factura.detalles?.map((detalle, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-900">{detalle.nombre_producto}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{detalle.cantidad}</td>
                        <td className="py-3 px-4 text-right text-slate-600">RD${detalle.precio_unitario.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">
                          RD${detalle.total_linea.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300">
                      <td colSpan={3} className="py-3 px-4 text-right font-semibold text-slate-900">
                        Total:
                      </td>
                      <td className="py-3 px-4 text-right text-xl font-bold text-slate-900">
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
