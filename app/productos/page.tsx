"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Package, Plus, Edit, Trash2, ShoppingCart, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useProductos } from "@/hooks/useProductos"
import { useRouter } from "next/navigation"

// Categorías por defecto
const CATEGORIAS = [
  { id: 1, nombre: "Bebidas", color: "#3B82F6" },
  { id: 2, nombre: "Comidas", color: "#10B981" },
  { id: 3, nombre: "Snacks", color: "#F59E0B" },
  { id: 4, nombre: "Postres", color: "#EC4899" },
  { id: 5, nombre: "Otros", color: "#6B7280" },
]

export default function ProductosPage() {
  const router = useRouter()
  const { productos, loading, error, refetch, eliminarProducto } = useProductos()
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null)

  // Filtrar productos por categoría
  const productosFiltrados = selectedCategoria
    ? productos.filter((p) => p.categoria_id === selectedCategoria)
    : productos

  // Agrupar productos por categoría
  const productosAgrupados = CATEGORIAS.map((categoria) => ({
    ...categoria,
    productos: productos.filter((p) => p.categoria_id === categoria.id),
  })).filter((grupo) => grupo.productos.length > 0)

  // Productos sin categoría
  const productosSinCategoria = productos.filter((p) => !p.categoria_id)

  const handleRealizarPedido = (producto: any) => {
    if (!producto.activo) {
      alert("Este producto está inactivo y no se puede usar en facturas")
      return
    }
    router.push(`/facturas/nueva?producto=${producto.id}`)
  }

  const handleEditarProducto = (producto: any) => {
    router.push(`/productos/${producto.id}/editar`)
  }

  const handleEliminarProducto = async (producto: any) => {
    if (!confirm(`¿Estás seguro de que quieres desactivar "${producto.nombre}"?`)) {
      return
    }

    try {
      await eliminarProducto(producto.id)
      alert("Producto desactivado exitosamente")
    } catch (error) {
      alert("Error al desactivar el producto: " + (error instanceof Error ? error.message : "Error desconocido"))
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Productos" subtitle="Gestión del inventario de productos" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header con botones */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-900">Inventario de Productos</h1>
              <p className="text-slate-600 sm:mt-0 mt-1">
                Productos organizados por categorías ({productos.length} productos total)
              </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={refetch}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors
                  text-sm sm:text-base sm:px-3 sm:py-2 px-2 py-1"
                >
                  <RefreshCw size={16} className="sm:w-4 sm:h-4 w-3 h-3" />
                  <span className="hidden xs:inline">Refrescar</span>
                </button>
                <Link
                  href="/productos/nuevo"
                  className="btn-primary flex items-center space-x-2
                  text-base sm:text-base sm:px-3 sm:py-2 px-4 py-2"
                >
                  <Plus size={18} className="sm:w-4 sm:h-4 w-4 h-4" />
                  <span>Nuevo producto</span>
                </Link>
              </div>
            </div>

            {/* Filtros por categoría */}
            <div className="card mb-6">
              <div className="flex items-start space-x-4">
                <Filter size={20} className="text-slate-400 mt-2 flex-shrink-0" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategoria(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategoria === null
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Todas las categorías ({productos.length})
                  </button>
                  {CATEGORIAS.map((categoria) => {
                    const count = productos.filter((p) => p.categoria_id === categoria.id).length
                    return (
                      <button
                        key={categoria.id}
                        onClick={() => setSelectedCategoria(categoria.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategoria === categoria.id
                            ? "text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        style={{
                          backgroundColor: selectedCategoria === categoria.id ? categoria.color : undefined,
                        }}
                      >
                        {categoria.nombre} ({count})
                      </button>
                    )
                  })}
                  {productosSinCategoria.length > 0 && (
                    <button
                      onClick={() => setSelectedCategoria(0)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategoria === 0
                          ? "bg-gray-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Sin categoría ({productosSinCategoria.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-600 mt-2">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>Error: {error}</p>
                <button onClick={refetch} className="mt-4 btn-primary">
                  Reintentar
                </button>
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Package size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No hay productos registrados</p>
                <p className="text-sm">Los productos aparecerán aquí cuando se registren</p>
              </div>
            ) : selectedCategoria === 0 ? (
              /* Productos sin categoría */
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Productos sin categoría</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosSinCategoria.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      onRealizarPedido={handleRealizarPedido}
                      onEditar={handleEditarProducto}
                      onEliminar={handleEliminarProducto}
                    />
                  ))}
                </div>
              </div>
            ) : selectedCategoria ? (
              /* Vista filtrada por categoría */
              <div className="card">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  {CATEGORIAS.find((c) => c.id === selectedCategoria)?.nombre}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosFiltrados.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      onRealizarPedido={handleRealizarPedido}
                      onEditar={handleEditarProducto}
                      onEliminar={handleEliminarProducto}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Vista agrupada por categorías */
              <div className="space-y-6">
                {productosAgrupados.map((grupo) => (
                  <div key={grupo.id} className="card">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: grupo.color }} />
                      <h2 className="text-lg font-semibold text-slate-900">{grupo.nombre}</h2>
                      <span className="text-sm text-slate-500">({grupo.productos.length} productos)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grupo.productos.map((producto) => (
                        <ProductoCard
                          key={producto.id}
                          producto={producto}
                          onRealizarPedido={handleRealizarPedido}
                          onEditar={handleEditarProducto}
                          onEliminar={handleEliminarProducto}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Productos sin categoría */}
                {productosSinCategoria.length > 0 && (
                  <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-4 h-4 rounded-full bg-gray-400" />
                      <h2 className="text-lg font-semibold text-slate-900">Sin categoría</h2>
                      <span className="text-sm text-slate-500">({productosSinCategoria.length} productos)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productosSinCategoria.map((producto) => (
                        <ProductoCard
                          key={producto.id}
                          producto={producto}
                          onRealizarPedido={handleRealizarPedido}
                          onEditar={handleEditarProducto}
                          onEliminar={handleEliminarProducto}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// Componente para la tarjeta de producto
function ProductoCard({
  producto,
  onRealizarPedido,
  onEditar,
  onEliminar,
}: {
  producto: any
  onRealizarPedido: (producto: any) => void
  onEditar: (producto: any) => void
  onEliminar: (producto: any) => void
}) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{producto.nombre}</h3>
          <p className="text-sm text-slate-600 mt-1">{producto.descripcion}</p>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => onEditar(producto)}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
            title="Editar producto"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onEliminar(producto)}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Desactivar producto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900">RD${producto.precio.toFixed(2)}</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${producto.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              Stock: {producto.stock}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                producto.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {producto.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        <button
          onClick={() => onRealizarPedido(producto)}
          disabled={producto.stock === 0 || !producto.activo}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            producto.stock > 0 && producto.activo
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <ShoppingCart size={14} />
          <span>{!producto.activo ? "Producto Inactivo" : producto.stock > 0 ? "Realizar Pedido" : "Sin Stock"}</span>
        </button>
      </div>
    </div>
  )
}
