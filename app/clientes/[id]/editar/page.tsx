"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"
import { useClientes } from "@/hooks/useClientes"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { clientesApi } from "@/lib/api"

export default function EditarCliente() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { actualizarCliente } = useClientes()
  const clienteId = Number(params.id)
  const fromClientesHoy = searchParams.get("fromClientesHoy") === "true"

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  })

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos del cliente
  useEffect(() => {
    const cargarCliente = async () => {
      try {
        setLoadingData(true)
        const response = await clientesApi.getById(clienteId)

        if (response.success) {
          const cliente = response.data
          setFormData({
            codigo: cliente.codigo,
            nombre: cliente.nombre,
            telefono: cliente.telefono || "",
            email: cliente.email || "",
            direccion: cliente.direccion || "",
          })
        } else {
          setError("Cliente no encontrado")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoadingData(false)
      }
    }

    if (clienteId) {
      cargarCliente()
    }
  }, [clienteId])

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
      if (!formData.nombre.trim()) {
        throw new Error("El nombre del cliente es requerido")
      }

      await actualizarCliente(clienteId, {
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
      })

      const returnUrl = fromClientesHoy 
        ? `/clientes/${clienteId}?success=updated&fromClientesHoy=true`
        : `/clientes/${clienteId}?success=updated`
      router.push(returnUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Editar Cliente" subtitle="Cargando datos del cliente..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Editar Cliente" subtitle="Modificar información del cliente" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href={fromClientesHoy ? `/clientes/${clienteId}?fromClientesHoy=true` : `/clientes/${clienteId}`}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Volver al cliente</span>
              </Link>
            </div>

            {/* Formulario */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Editar Cliente</h2>
                  <p className="text-slate-600">Modifique los datos del cliente</p>
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Código del Cliente</label>
                    <input
                      type="text"
                      name="codigo"
                      value={formData.codigo}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-medium"
                    />
                    <p className="text-xs text-slate-500 mt-1">El código no se puede modificar</p>
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
                  <Link
                    href={fromClientesHoy ? `/clientes/${clienteId}?fromClientesHoy=true` : `/clientes/${clienteId}`}
                    className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancelar
                  </Link>
                  <button type="submit" disabled={loading} className="btn-primary flex items-center space-x-2 px-4 py-2">
                    <Save size={16} />
                    <span className="hidden sm:inline-block">{loading ? "Guardando..." : "Guardar Cambios"}</span>
                    <span className="inline-block sm:hidden">{loading ? "Guardando..." : "Guardar"}</span>
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
