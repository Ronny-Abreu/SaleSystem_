"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useClientes } from "@/hooks/useClientes"
import { useFacturas } from "@/hooks/useFacturas"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Search, X, AlertTriangle, Plus, Edit, Trash2, Loader2, Users, Phone }
  from "lucide-react"
import { Cliente } from "@/lib/types"
import { AlertDialog } from "@/components/ui/AlertDialog"
import Link from "next/link"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

export default function ClientesPage() {
  const router = useRouter()
  const { clientes, loading, error, eliminarCliente } = useClientes()
  const { facturas, loading: loadingFacturas } = useFacturas()
  const [searchTerm, setSearchTerm] = useState("")
  const [showDebtFilter, setShowDebtFilter] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [alertDialogMessage, setAlertDialogMessage] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<{ id: number; nombre: string } | null>(null)

  const clientesConDeuda = useMemo(() => {
    const clientesConDeudaPendiente = new Set<number>()
    facturas.forEach((factura) => {
      if (factura.estado === "pendiente") {
        clientesConDeudaPendiente.add(factura.cliente_id)
      }
    })
    return clientesConDeudaPendiente
  }, [facturas])


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
    setClienteToDelete({ id, nombre })
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return

    const { id, nombre } = clienteToDelete
    setIsConfirmDialogOpen(false)

    const hasPending = clientesConDeuda.has(id)

    if (hasPending) {
      setAlertDialogMessage("No es posible. El cliente debe tener la cuenta saldada para poder ser eliminado.")
      setIsAlertDialogOpen(true)
      setClienteToDelete(null)
      return
    }

    try {
      setDeletingId(id)
      await eliminarCliente(id)

    } catch (err) {
      console.warn("Error al eliminar cliente:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setAlertDialogMessage(errorMessage)
      setIsAlertDialogOpen(true)
    } finally {
      setDeletingId(null)
      setClienteToDelete(null)
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
                        <X size={14} />
                        <span>Limpiar filtros</span>
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
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="ml-2 text-slate-600">Cargando clientes...</p>
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-300 rounded-lg bg-white mt-4">
                <p className="text-slate-500 text-lg font-medium">No se encontraron clientes</p>
                <p className="text-slate-500 text-sm mt-1">Ajusta tus filtros o añade un nuevo cliente.</p>
                <button
                  onClick={() => router.push("/clientes/nuevo")}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus size={16} className="mr-2" />
                  Añadir Cliente
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {clientesFiltrados.map((cliente) => {
                  const tieneDeuda = clientesConDeuda.has(cliente.id)

                  return (
                    <div
                      key={cliente.id}
                      className={`bg-white border rounded-lg shadow-sm overflow-hidden transform transition-transform duration-200 hover:scale-[1.01] flex flex-col relative ${
                        tieneDeuda
                          ? "border-red-200 bg-red-50/30 hover:bg-red-50/50"
                          : "border-slate-200"
                      }`}
                    >
                      <div
                        className="p-3 cursor-pointer flex-grow"
                        onClick={() => handleCardClick(cliente.id)}
                      >
                        <div className="flex items-center justify-between mb-2 relative"> {/* Added relative here */}
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-slate-900 flex items-center">
                                {cliente.nombre}
                                {tieneDeuda && ( // Icon moved here, next to the client's name
                                  <AlertTriangle size={16} className="text-red-500 ml-2" />
                                )}
                              </h3>
                              <p className="text-sm text-slate-600">Código: {cliente.codigo}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1 relative"> {/* Added relative here */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/clientes/${cliente.id}/editar`)
                              }}
                              className="p-2 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
                              title="Editar cliente"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(cliente.id, cliente.nombre)
                              }}
                              className={`p-2 rounded-full text-red-600 hover:bg-red-200 transition-colors ${
                                deletingId === cliente.id ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                              disabled={deletingId === cliente.id}
                              title="Eliminar cliente"
                            >
                              {deletingId === cliente.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                        {tieneDeuda && (
                          <p className="text-xs text-red-600 font-medium mt-1">Tiene facturas pendientes</p>
                        )}
                        <div className="mt-4 text-xs text-slate-700">
                        {cliente.telefono && (
                          <p className="flex items-center">
                            <Phone size={14} className="mr-2 text-slate-500" />{" "}
                            <a href={`tel:${cliente.telefono}`} className="text-blue-600 hover:underline">
                              {cliente.telefono}
                            </a>
                          </p>
                        )}
                        {cliente.email && (
                          <p className="flex items-center mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 text-slate-500"
                            >
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>{" "}
                            <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:underline">
                              {cliente.email}
                            </a>
                          </p>
                        )}
                        {cliente.direccion && (
                          <p className="flex items-start mt-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 text-slate-500 mt-1"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>{" "}
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cliente.direccion)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {cliente.direccion}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 p-3 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
                      <span>Registrado: {(() => {
                        if (!cliente.created_at) return "Fecha no disponible"
                        const fechaCreated = cliente.created_at.includes('T') 
                          ? cliente.created_at.split('T')[0] 
                          : cliente.created_at.split(' ')[0]
                        const [year, month, day] = fechaCreated.split('-').map(Number)
                        if (isNaN(year) || isNaN(month) || isNaN(day)) return "Fecha inválida"
                        const fecha = new Date(year, month - 1, day)
                        return fecha.toLocaleDateString("es-DO")
                      })()}</span>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        </main>

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

      </div>

      {isConfirmDialogOpen && clienteToDelete && (
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={handleConfirmDelete}
          title={`Eliminar cliente "${clienteToDelete.nombre}"`}
          message={
            clientesConDeuda.has(clienteToDelete.id)
              ? "Este cliente tiene facturas pendientes. ¿Está seguro de que desea intentar eliminarlo?"
              : `¿Está seguro de que desea eliminar al cliente "${clienteToDelete.nombre}"? Esta acción no se puede deshacer.`
          }
          isDestructive={true}
          showWarningIcon={clientesConDeuda.has(clienteToDelete.id)}
          confirmText={clientesConDeuda.has(clienteToDelete.id) ? "Sí, eliminar" : "Eliminar"
          }
        />
      )}

      {isAlertDialogOpen && (
        <AlertDialog
          isOpen={isAlertDialogOpen}
          onClose={() => setIsAlertDialogOpen(false)}
          title="Error al eliminar cliente"
          message={alertDialogMessage}
        />
      )}
    </div>
  )
}