"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Plus, Edit, Trash2, Phone, Mail, Eye, AlertTriangle, Search, Filter, X } from "lucide-react"
import Link from "next/link"
import { useClientes } from "@/hooks/useClientes"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { facturasApi } from "@/lib/api"
import type { Factura } from "@/lib/types"

export default function ClientesPage() {
  const router = useRouter()
  const { clientes, loading, error, eliminarCliente } = useClientes()
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loadingFacturas, setLoadingFacturas] = useState(true)
  const [clientesConDeuda, setClientesConDeuda] = useState<Set<number>>(new Set())
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [showDebtFilter, setShowDebtFilter] = useState(false)

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

  // Filtrar clientes basado en búsqueda y filtros
  const clientesFiltrados = useMemo(() => {
    let resultado = clientes

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const termino = searchTerm.toLowerCase().trim()
      resultado = resultado.filter(cliente => 
        cliente.nombre.toLowerCase().includes(termino) ||
        cliente.codigo.toLowerCase().includes(termino)
      )
    }

    // Filtrar por clientes con deuda
    if (showDebtFilter) {
      resultado = resultado.filter(cliente => clientesConDeuda.has(cliente.id))
    }

    return resultado
  }, [clientes, searchTerm, showDebtFilter, clientesConDeuda])

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

  const limpiarFiltros = () => {
    setSearchTerm("")
    setShowDebtFilter(false)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clientes" subtitle="Gestión de clientes registrados" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="max-w-6xl mx-auto">
            {/* Header responsive */}
            <div className="mb-6">
              <div className="flex flex-col space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">Lista de Clientes</h1>
                <p className="text-sm md:text-base text-slate-600">Todos los clientes registrados en el sistema</p>
                {!loadingFacturas && clientesConDeuda.size > 0 && (
                  <p className="text-sm text-red-600">
                    • {clientesConDeuda.size} cliente{clientesConDeuda.size !== 1 ? "s" : ""} con deuda pendiente
                  </p>
                )}
              </div>

              {/* Controles de búsqueda y filtros */}
              <div className="mt-4 space-y-3">
                {/* Barra de búsqueda */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-900" />
                    </div>
                    <input
                    type="text"
                    placeholder="Buscar por nombre o código de cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
                    />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowDebtFilter(!showDebtFilter)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      showDebtFilter
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <AlertTriangle size={14} />
                    <span>Solo con deudas</span>
                    {showDebtFilter && clientesConDeuda.size > 0 && (
                      <span className="ml-1 bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-xs">
                        {clientesFiltrados.length}
                      </span>
                    )}
                  </button>

                  {/* Indicador de filtros activos y botón limpiar */}
                  {(searchTerm || showDebtFilter) && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500">
                        {clientesFiltrados.length} de {clientes.length} clientes
                      </span>
                      <button
                        onClick={limpiarFiltros}
                        className="flex items-center space-x-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded"
                      >
                        <X size={12} />
                        <span>Limpiar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón desktop */}
              <div className="hidden md:block absolute top-4 right-6">
                <Link href="/clientes/nuevo" className="btn-primary flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Nuevo Cliente</span>
                </Link>
              </div>
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
              ) : clientesFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientesFiltrados.map((cliente) => {
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
                                className={`font-semibold group-hover:text-blue-600 transition-colors text-sm md:text-base ${
                                  tieneDeuda ? "text-slate-900" : "text-slate-900"
                                }`}
                              >
                                {cliente.nombre}
                              </h3>
                              {tieneDeuda && (
                                <span title="Cliente con deuda pendiente">
                                  <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-slate-600">Código: {cliente.codigo}</p>
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

                        <div className="space-y-2 text-xs md:text-sm text-slate-600">
                          {cliente.telefono && (
                            <div className="flex items-center space-x-2">
                              <Phone size={14} />
                              <span>{cliente.telefono}</span>
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center space-x-2">
                              <Mail size={14} />
                              <span className="truncate">{cliente.email}</span>
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
              ) : clientes.length > 0 ? (
                // Mostrar mensaje cuando hay clientes pero ninguno coincide con los filtros
                <div className="text-center py-8 text-slate-500">
                  <Filter size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No se encontraron clientes con los filtros aplicados</p>
                  <p className="text-sm">Intenta ajustar tu búsqueda o limpiar los filtros</p>
                  <button
                    onClick={limpiarFiltros}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm underline"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                // Mensaje cuando no hay clientes en absoluto
                <div className="text-center py-8 text-slate-500">
                  <Users size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay clientes registrados</p>
                  <p className="text-sm">Los clientes aparecerán aquí cuando se registren</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón flotante para móvil */}
          <div className="md:hidden fixed bottom-6 right-6 z-50">
            <Link
              href="/clientes/nuevo"
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
              title="Nuevo Cliente"
            >
              <Plus size={24} />
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}