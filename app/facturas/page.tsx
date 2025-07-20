"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { FileText, Plus, Eye, Filter } from "lucide-react"
import Link from "next/link"
import { useFacturas } from "@/hooks/useFacturas"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function FacturasPage() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const numero = searchParams.get("numero")

  const [showSuccess, setShowSuccess] = useState(false)
  const { facturas, loading, error } = useFacturas()

  useEffect(() => {
    if (success === "true" && numero) {
      setShowSuccess(true)
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [success, numero])

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Facturas" subtitle="Gestión de facturas de venta" />

        <main className="flex-1 overflow-y-auto p-6">
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
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Lista de Facturas</h1>
                <p className="text-slate-600">Todas las facturas registradas en el sistema</p>
              </div>
              <Link href="/facturas/nueva" className="btn-primary flex items-center space-x-2">
                <Plus size={16} />
                <span>Nueva Factura</span>
              </Link>
            </div>

            {/* Filtros */}
            <div className="card mb-6">
              <div className="flex items-center space-x-4">
                <Filter size={20} className="text-slate-400" />
                <div className="flex space-x-4">
                  <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Todos los estados</option>
                    <option value="pagada">Pagadas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="anulada">Anuladas</option>
                  </select>
                  <input
                    type="date"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              ) : facturas.length > 0 ? (
                <div className="overflow-x-auto">
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
                      {facturas.map((factura) => (
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
                            <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay facturas registradas</p>
                  <p className="text-sm">Las facturas aparecerán aquí cuando se creen</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
