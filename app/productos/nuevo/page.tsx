"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Save, Package } from "lucide-react"
import Link from "next/link"
import { useProductos } from "@/hooks/useProductos"
import { useRouter } from "next/navigation"

// Categorías por defecto (en una implementación real, estas vendrían de la API)
const CATEGORIAS = [
  { id: 1, nombre: "Bebidas", color: "#3B82F6" },
  { id: 2, nombre: "Comidas", color: "#10B981" },
  { id: 3, nombre: "Snacks", color: "#F59E0B" },
  { id: 4, nombre: "Postres", color: "#EC4899" },
  { id: 5, nombre: "Otros", color: "#6B7280" },
]

export default function NuevoProducto() {
  const router = useRouter()
  const { crearProducto } = useProductos()

  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    stock: "",
    categoria_id: "",
    activo: true,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Validaciones básicas
      if (!formData.nombre.trim()) {
        throw new Error("El nombre del producto es requerido")
      }
      if (!formData.precio || Number.parseFloat(formData.precio) <= 0) {
        throw new Error("El precio debe ser mayor a 0")
      }
      if (!formData.stock || Number.parseInt(formData.stock) < 0) {
        throw new Error("El stock no puede ser negativo")
      }
      if (!formData.categoria_id) {
        throw new Error("La categoría es requerida")
      }

      const productoData = {
        nombre: formData.nombre,
        precio: Number.parseFloat(formData.precio),
        descripcion: formData.descripcion,
        stock: Number.parseInt(formData.stock),
        categoria_id: formData.categoria_id ? Number.parseInt(formData.categoria_id) : undefined,
        activo: formData.activo,
      }

      await crearProducto(productoData)
      router.push("/productos?success=true")
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
        <Header title="Nuevo Producto" subtitle="Registrar un nuevo producto en el inventario" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/productos"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Volver a productos</span>
              </Link>
            </div>

            {/* Formulario */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Package className="text-purple-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Información del Producto</h2>
                  <p className="text-slate-600">Complete los datos del nuevo producto</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Producto *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Nombre del producto"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Precio *</label>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Stock Inicial *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                    <select
                      name="categoria_id"
                      value={formData.categoria_id}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="">Seleccionar categoría</option>
                      {CATEGORIAS.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del producto (opcional)"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-800"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-slate-700">Producto activo (disponible para venta)</label>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Link
                  href="/productos"
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors whitespace-nowrap text-sm md:text-base"
                  >
                  Cancelar
                  </Link>
                  <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2 whitespace-nowrap text-sm md:text-base px-4 py-2"
                  >
                  <Save size={16} />
                  <span>{loading ? "Guardando..." : "Guardar"}</span>
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
