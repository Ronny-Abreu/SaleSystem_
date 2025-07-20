"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Plus, Edit, Trash2, Phone, Mail, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useClientes } from "@/hooks/useClientes"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { facturasApi } from "@/lib/api"
import type { Factura } from "@/lib/types"

export default function ClientesPage() {
  const router = useRouter()
  const { clientes, loading, error, eliminarCliente } = useClientes()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loadingFacturas, setLoadingFacturas] = useState(true)
  const [clientesConDeuda, setClientesConDeuda] = useState<Set<number>>(new Set())

  // Cargar facturas para calcular deudas
  useEffect(() => {
    const cargarFacturas = async () => {
      try {
        setLoadingFacturas(true)
        const response = await facturasApi.getAll()
        if (response.success) {
          setFacturas(response.data)

          // Calcular qué clientes tienen deuda
          const clientesConDeudaPendiente = new Set<number>()
          response.data.forEach((factura: Factura) => {
            if (factura.estado === "pendiente") {
              clientesConDeudaPendiente.add(factura.cliente_id)
            }
          })
          setClientesConDeuda(clientesConDeudaPendiente)
        }
      } catch (err) {
        console.error("Error cargando facturas:", err)
      } finally {
        setLoadingFacturas(false)
      }
    }

    if (clientes.length > 0) {
      cargarFacturas()
    }
  }, [clientes])

  const handleDelete = async (id: number, nombre: string) => {
    if (confirm(`¿Está seguro de que desea eliminar al cliente "${nombre}"?`)) {
      try {
        setDeletingId(id)
        await eliminarCliente(id)
      } catch (err) {
        alert("Error al eliminar el cliente: " + (err instanceof Error ? err.message : "Error desconocido"))
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleCardClick = (clienteId: number) => {
    router.push(`/clientes/${clienteId}`)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clientes" subtitle="Gestión de clientes registrados" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Lista de Clientes</h1>
                <p className="text-slate-600">
                  Todos los clientes registrados en el sistema
                  {!loadingFacturas && clientesConDeuda.size > 0 && (
                    <span className="ml-2 text-red-600">
                      • {clientesConDeuda.size} cliente{clientesConDeuda.size !== 1 ? "s" : ""} con deuda pendiente
                    </span>
                  )}
                </p>
              </div>
              <Link href="/clientes/nuevo" className="btn-primary flex items-center space-x-2">
                <Plus size={16} />
                <span>Nuevo Cliente</span>
              </Link>
            </div>

            {/* Lista de clientes */}
            <div className="card">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-600 mt-2">Cargando clientes...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error: {error}</p>
                </div>
              ) : clientes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientes.map((cliente) => {
                    const tieneDeuda = clientesConDeuda.has(cliente.id)

                    return (
                      <div
                        key={cliente.id}
                        className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer group relative ${
                          tieneDeuda
                            ? "border-red-200 bg-red-50/30 hover:bg-red-50/50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() => handleCardClick(cliente.id)}
                      >
                        {/* Indicador de deuda */}
                        {tieneDeuda && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                              <AlertTriangle size={12} className="text-white" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3
                                className={`font-semibold group-hover:text-blue-600 transition-colors ${
                                  tieneDeuda ? "text-slate-900" : "text-slate-900"
                                }`}
                              >
                                {cliente.nombre}
                              </h3>
                              {tieneDeuda && (
                                <span title="Cliente con deuda pendiente">
                                  <AlertTriangle
                                    size={16}
                                    className="text-red-500 flex-shrink-0"
                                  />
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">Código: {cliente.codigo}</p>
                            {tieneDeuda && (
                              <p className="text-xs text-red-600 font-medium mt-1">Tiene facturas pendientes</p>
                            )}
                          </div>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/clientes/${cliente.id}`)
                              }}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                              title="Ver detalles"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/clientes/${cliente.id}/editar`)
                              }}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                              title="Editar cliente"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(cliente.id, cliente.nombre)
                              }}
                              disabled={deletingId === cliente.id}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                              title="Eliminar cliente"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                          {cliente.telefono && (
                            <div className="flex items-center space-x-2">
                              <Phone size={14} />
                              <span>{cliente.telefono}</span>
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center space-x-2">
                              <Mail size={14} />
                              <span>{cliente.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-500">
                            Registrado: {new Date(cliente.created_at).toLocaleDateString("es-DO")}
                          </p>
                        </div>

                        {/* Indicador visual de que es clickeable */}
                        <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click para ver detalles y facturas →
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Users size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay clientes registrados</p>
                  <p className="text-sm">Los clientes aparecerán aquí cuando se registren</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
