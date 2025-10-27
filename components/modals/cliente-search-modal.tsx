"use client"

import { useState, useEffect } from "react"
import { Search, X, Check, User, Phone } from "lucide-react"
import { useClientes } from "@/hooks/useClientes"
import type { Cliente } from "@/lib/types"

interface ClienteSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectCliente: (cliente: Cliente) => void
}

export function ClienteSearchModal({ isOpen, onClose, onSelectCliente }: ClienteSearchModalProps) {
  const { clientes, loading } = useClientes()
  const [busqueda, setBusqueda] = useState("")
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono?.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const handleSelectCliente = (cliente: Cliente) => {
    // Permitir desmarcar haciendo click nuevamente
    if (clienteSeleccionado?.id === cliente.id) {
      setClienteSeleccionado(null)
    } else {
      setClienteSeleccionado(cliente)
    }
  }

  const handleConfirmarSeleccion = () => {
    if (clienteSeleccionado) {
      onSelectCliente(clienteSeleccionado)
      onClose()
      setClienteSeleccionado(null)
      setBusqueda("")
    } else {
      // Mostrar tooltip de error
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    }
  }

  const handleClose = () => {
    onClose()
    setClienteSeleccionado(null)
    setBusqueda("")
    setShowTooltip(false)
  }

  useEffect(() => {
    if (isOpen) {
      setBusqueda("")
      setClienteSeleccionado(null)
      setShowTooltip(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <User size={20} className="text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Buscar Cliente</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código o teléfono..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <p className="text-sm text-slate-600 mt-2">Selecciona un cliente</p>
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Cargando clientes...</p>
            </div>
          ) : clientesFiltrados.length > 0 ? (
            <div className="space-y-2">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => handleSelectCliente(cliente)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    clienteSeleccionado?.id === cliente.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{cliente.nombre}</p>
                        <p className="text-sm text-slate-600">Código: {cliente.codigo}</p>
                        {cliente.telefono && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone size={12} className="text-slate-400" />
                            <p className="text-sm text-slate-600">{cliente.telefono}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {clienteSeleccionado?.id === cliente.id && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No se encontraron clientes</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          {/* Botón Elegir cliente - siempre visible en desktop */}
          <div className="relative">
            <button
              onClick={handleConfirmarSeleccion}
              className={`relative px-2 py-2 w-10 h-10 md:w-auto md:h-auto rounded-full md:rounded-lg transition-all duration-200 flex items-center justify-center whitespace-nowrap ${
                clienteSeleccionado
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "md:bg-blue-300 md:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white md:text-blue-100"
              } ${clienteSeleccionado || window.innerWidth < 768 ? "" : "md:opacity-60"}`}
              title="Elegir cliente"
            >
              {/* Botón Elegir cliente - Mobile */}
              <span className="md:hidden">
                <Check size={20} />
              </span>
              <span className="hidden md:inline">
                <Check size={16} />
              </span>
              <span className="hidden md:inline md:ml-2">Elegir cliente</span>
            </button>

            {/* Tooltip de error para desktop */}
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-red-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
                <span>Debe seleccionar un cliente</span>
                {/* Flecha del tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
