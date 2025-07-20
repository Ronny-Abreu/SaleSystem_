"use client"

import { useState, useEffect } from "react"
import { Search, X, Users, Check } from "lucide-react"
import { useClientes } from "@/hooks/useClientes"
import type { Cliente } from "@/lib/types"

interface ClienteSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectCliente: (cliente: Cliente) => void
}

export function ClienteSearchModal({ isOpen, onClose, onSelectCliente }: ClienteSearchModalProps) {
  const { clientes, loading } = useClientes()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes)
    } else {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredClientes(filtered)
    }
  }, [searchTerm, clientes])

  const handleSelectCliente = () => {
    if (!selectedCliente) {
      alert("Debe elegir un cliente para facturar")
      return
    }
    onSelectCliente(selectedCliente)
    onClose()
    setSelectedCliente(null)
    setSearchTerm("")
  }

  const handleClose = () => {
    onClose()
    setSelectedCliente(null)
    setSearchTerm("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Buscar Cliente</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o código del cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Cargando clientes...</p>
            </div>
          ) : filteredClientes.length > 0 ? (
            <div className="space-y-2">
              {filteredClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCliente?.id === cliente.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Users className="text-slate-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{cliente.nombre}</h3>
                        <p className="text-sm text-slate-600">Código: {cliente.codigo}</p>
                        {cliente.telefono && <p className="text-xs text-slate-500">Tel: {cliente.telefono}</p>}
                      </div>
                    </div>
                    {selectedCliente?.id === cliente.id && <Check className="text-blue-600" size={20} />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No se encontraron clientes</p>
              <p className="text-sm">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {selectedCliente ? `Cliente seleccionado: ${selectedCliente.nombre}` : "Selecciona un cliente"}
          </p>
          <div className="flex space-x-3">
            <button onClick={handleClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSelectCliente} className="btn-primary" disabled={!selectedCliente}>
              Elegir Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
