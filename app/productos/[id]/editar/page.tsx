"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { productosApi } from "@/lib/api"

// Categorías por defecto
const CATEGORIAS = [
  { id: 1, nombre: "Bebidas" },
  { id: 2, nombre: "Comidas" },
  { id: 3, nombre: "Snacks" },
  { id: 4, nombre: "Postres" },
  { id: 5, nombre: "Otros" },
]

export default function EditarProducto() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    stock: "",
    activo: true,
    categoria_id: "",
  })

  // Cargar datos del producto
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true)
        const response = await productosApi.getById(Number(params.id))

        if (response.success) {
          const producto = response.data
          setFormData({
            nombre: producto.nombre,
            precio: producto.precio.toString(),
            descripcion: producto.descripcion || "",
            stock: producto.stock.toString(),
            activo: producto.activo,
            categoria_id: producto.categoria_id?.toString() || "",
          })
        } else {
          setError(response.message)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchProducto()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      setSaving(true)

      // Validaciones básicas
      if (!formData.nombre.trim()) {
        throw new Error("El nombre es requerido")
      }

      if (!formData.precio || Number.parseFloat(formData.precio) <= 0) {
        throw new Error("El precio debe ser mayor a 0")
      }

      if (!formData.stock || Number.parseInt(formData.stock) < 0) {
        throw new Error("El stock no puede ser negativo")
      }

      const productoData = {
        nombre: formData.nombre.trim(),
        precio: Number.parseFloat(formData.precio),
        descripcion: formData.descripcion.trim(),
        stock: Number.parseInt(formData.stock),
        activo: formData.activo,
          categoria_id: formData.categoria_id ? Number.parseInt(formData.categoria_id) : undefined,
      }

      const response = await productosApi.update(Number(params.id), productoData)

      if (response.success) {
        setSuccess("Producto actualizado exitosamente")
        setTimeout(() => {
          router.push("/productos")
        }, 1500)
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que quieres desactivar este producto?")) {
      return
    }

    try {
      setDeleting(true)
      const response = await productosApi.delete(Number(params.id))

      if (response.success) {
        setSuccess("Producto desactivado exitosamente")
        setTimeout(() => {
          router.push("/productos")
        }, 1500)
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Cargando..." />
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
        <Header title="Editar Producto" subtitle="Modificar información del producto" />

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

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                <span>{deleting ? "Desactivando..." : "Desactivar"}</span>
              </button>
            </div>

            {/* Mensajes */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Formulario */}
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="Ej: Coca Cola 600ml"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="precio" className="block text-sm font-medium text-slate-700 mb-2">
                      Precio (RD$) *
                    </label>
                    <input
                      type="number"
                      id="precio"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-2">
                      Stock *
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="categoria_id" className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría
                  </label>
                  <select
                    id="categoria_id"
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="">Sin categoría</option>
                    {CATEGORIAS.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-800"
                    placeholder="Descripción opcional del producto"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="activo" className="ml-2 block text-sm text-slate-700">
                    Producto activo
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link href="/productos" className="btn-secondary">
                    Cancelar
                  </Link>
                  <button type="submit" disabled={saving} className="btn-primary flex items-center space-x-2">
                    <Save size={16} />
                    <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
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
