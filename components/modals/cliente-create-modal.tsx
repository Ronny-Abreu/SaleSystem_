"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Save, User } from "lucide-react"
import { useClientes } from "@/hooks/useClientes"
import type { Cliente } from "@/lib/types"

interface ClienteCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onClienteCreated: (cliente: Cliente) => void
}

export function ClienteCreateModal({ isOpen, onClose, onClienteCreated }: ClienteCreateModalProps) {
  const { crearCliente, verificarEmailExistente, verificarTelefonoExistente, verificarNombreExistente } = useClientes()

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatTelefono = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    const limitedNumbers = numbers.slice(0, 10)
    
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 6) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 6)}-${limitedNumbers.slice(6)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (error) {
      setError(null)
    }
    
    if (name === 'telefono') {
      const formattedValue = formatTelefono(value)
      setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.currentTarget.tagName !== 'TEXTAREA') {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input, textarea, button[type="submit"]'))
        const currentIndex = inputs.indexOf(e.currentTarget)
        const nextInput = inputs[currentIndex + 1] as HTMLElement
        if (nextInput) {
          nextInput.focus()
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!formData.nombre.trim()) {
      setError("El nombre del cliente es requerido")
      setLoading(false)
      return
    }

    if (!formData.telefono.trim()) {
      setError("El teléfono del cliente es requerido")
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("El email del cliente es requerido")
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) {
      setError("El email debe tener un formato válido")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const nombreExiste = await verificarNombreExistente(formData.nombre.trim())
      if (nombreExiste) {
        setError("Ya existe un cliente con ese nombre")
        setLoading(false)
        return
      }

      const telefonoExiste = await verificarTelefonoExistente(formData.telefono.trim())
      if (telefonoExiste) {
        setError("Ya existe un cliente con ese teléfono")
        setLoading(false)
        return
      }

      const emailExiste = await verificarEmailExistente(formData.email.trim())
      if (emailExiste) {
        setError("Ya existe un cliente con ese email")
        setLoading(false)
        return
      }
      
      const clienteCreado = await crearCliente(formData)
      
      if (clienteCreado) {
        // Llamar al callback con el cliente creado
        onClienteCreated(clienteCreado)
        // Limpiar el formulario
        setFormData({
          nombre: "",
          telefono: "",
          email: "",
          direccion: "",
        })
        // Cerrar el modal
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
      })
      setError(null)
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: "",
        telefono: "",
        email: "",
        direccion: "",
      })
      setError(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <User size={18} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Crear Nuevo Cliente</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Juan Pérez"
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="809-555-0000"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="cliente@email.com"
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección completa del cliente (opcional)"
                rows={3}
                disabled={loading}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>{loading ? "Guardando..." : "Guardar Cliente"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

