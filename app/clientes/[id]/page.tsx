"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { clientesApi, facturasApi } from "@/lib/api"
import type { Cliente, Factura } from "@/lib/types"

export default function DetalleCliente() {
  const params = useParams()
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const clienteId = Number(params.id)

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingFacturas, setLoadingFacturas] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

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

        // Cargar cliente
        const clienteResponse = await clientesApi.getById(clienteId)
        if (clienteResponse.success) {
          setCliente(clienteResponse.data)
        } else {
          setError("Cliente no encontrado")
          return
        }

        // Cargar facturas del cliente
        setLoadingFacturas(true)
        const facturasResponse = await facturasApi.getAll()
        if (facturasResponse.success) {
          const facturasCliente = facturasResponse.data.filter((factura: Factura) => factura.cliente_id === clienteId)
          setFacturas(facturasCliente)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
        setLoadingFacturas(false)
      }
    }

    if (clienteId) {
      cargarDatos()
    }
  }, [clienteId])

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
              <Link href="/clientes" className="btn-primary">
                Volver a Clientes
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

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Mensaje de éxito */}
            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">Cliente actualizado exitosamente</p>
              </div>
            )}

            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/clientes"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Volver a clientes</span>
              </Link>

              <div className="flex space-x-3">
                <Link
                  href={`/clientes/${clienteId}/editar`}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </Link>
                <Link href={`/facturas/nueva?cliente=${clienteId}`} className="btn-primary flex items-center space-x-2">
                  <FileText size={16} />
                  <span>Nueva Factura</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información del Cliente */}
              <div className="lg:col-span-1">
                <div className="card">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Phone className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Información del Cliente</h2>
                      <p className="text-slate-600">Datos de contacto y registro</p>
                    </div>
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
                          <p className="text-slate-900">{cliente.telefono}</p>
                        </div>
                      </div>
                    )}

                    {cliente.email && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-slate-400" />
                          <p className="text-slate-900">{cliente.email}</p>
                        </div>
                      </div>
                    )}

                    {cliente.direccion && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                        <div className="flex items-start space-x-2">
                          <MapPin size={16} className="text-slate-400 mt-0.5" />
                          <p className="text-slate-900">{cliente.direccion}</p>
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

                {/* Estadísticas Rápidas */}
                <div className="card mt-6">
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

              {/* Facturas del Cliente */}
              <div className="lg:col-span-2">
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Historial de Facturas</h2>
                      <p className="text-slate-600">Todas las facturas asociadas a este cliente</p>
                    </div>
                    {totalDeuda > 0 && (
                      <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        Tiene deuda pendiente
                      </div>
                    )}
                  </div>

                  {loadingFacturas ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-slate-600 mt-2">Cargando facturas...</p>
                    </div>
                  ) : facturas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-semibold text-slate-700">Número</th>
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
                                  href={`/facturas/${factura.id}`}
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
                      <p>No hay facturas registradas</p>
                      <p className="text-sm mb-4">Este cliente aún no tiene facturas asociadas</p>
                      <Link
                        href={`/facturas/nueva?cliente=${clienteId}`}
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <FileText size={16} />
                        <span>Crear Primera Factura</span>
                      </Link>
                    </div>
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
