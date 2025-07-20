"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"
import { useClientes } from "@/hooks/useClientes"
import { useRouter } from "next/navigation"
import { useCodigoCliente } from "@/hooks/useCodigoCliente"

export default function NuevoCliente() {
  const router = useRouter()
  const { crearCliente } = useClientes()
  const { siguienteCodigo, loading: loadingCodigo } = useCodigoCliente()

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  })

  // Actualizar el código cuando esté disponible (SE CREARÁ UN CODIGO SECUENCIAL PARA CADA USUARIO EN AUTOMATICO)
  useEffect(() => {
    if (siguienteCodigo && !formData.codigo) {
      setFormData((prev) => ({ ...prev, codigo: siguienteCodigo }))
    }
  }, [siguienteCodigo])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Validaciones básicas
      if (!formData.codigo.trim()) {
        throw new Error("El código del cliente es requerido")
      }
      if (!formData.nombre.trim()) {
        throw new Error("El nombre del cliente es requerido")
      }

      await crearCliente(formData)
      router.push("/clientes?success=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Nuevo Cliente" subtitle="Registrar un nuevo cliente en el sistema" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/clientes"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Volver a clientes</span>
              </Link>
            </div>

            {/* Formulario */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <User className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Información del Cliente</h2>
                  <p className="text-slate-600">Complete los datos del nuevo cliente</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Código del Cliente *</label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="809-555-0000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="cliente@email.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
                  <textarea
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Dirección completa del cliente"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-800"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Link href="/clientes" className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors">
                    Cancelar
                  </Link>
                  <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2">
                    <Save size={16} />
                    <span>{loading ? "Guardando..." : "Guardar Cliente"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
