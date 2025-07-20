"use client"

import { useState, useEffect } from "react"
import { Search, X, Package, Check, Filter, AlertCircle } from "lucide-react"
import { useProductos } from "@/hooks/useProductos"
import type { Producto, CategoriaProducto } from "@/lib/types"

interface ProductoSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProducto: (producto: Producto, cantidad: number) => void
}

export function ProductoSearchModal({ isOpen, onClose, onSelectProducto }: ProductoSearchModalProps) {
  const { productos, loading } = useProductos(true) // Solo productos activos
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [error, setError] = useState<string | null>(null)

  // Obtener categorías únicas de los productos
  const categorias = productos.reduce((acc, producto) => {
    if (producto.categoria && !acc.find((c) => c.id === producto.categoria!.id)) {
      acc.push(producto.categoria)
    }
    return acc
  }, [] as CategoriaProducto[])

  useEffect(() => {
    let filtered = productos

    // Filtrar por categoría
    if (selectedCategoria) {
      filtered = filtered.filter((producto) => producto.categoria_id === selectedCategoria)
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProductos(filtered)
  }, [searchTerm, selectedCategoria, productos])

  const handleSelectProducto = (producto: Producto) => {
    setSelectedProducto(producto)
    setCantidad(1)
    setError(null)

    if (producto.stock === 0) {
      setError(`El producto "${producto.nombre}" no tiene stock disponible`)
    }
  }

  const handleCantidadChange = (nuevaCantidad: number) => {
    setCantidad(nuevaCantidad)
    setError(null)

    if (selectedProducto && nuevaCantidad > selectedProducto.stock) {
      setError(`Solo hay ${selectedProducto.stock} unidades disponibles de "${selectedProducto.nombre}"`)
    }
  }

  const handleConfirmarSeleccion = () => {
    if (!selectedProducto) {
      setError("Debe elegir un producto")
      return
    }

    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0")
      return
    }

    if (cantidad > selectedProducto.stock) {
      setError(`Solo hay ${selectedProducto.stock} unidades disponibles`)
      return
    }

    if (selectedProducto.stock === 0) {
      setError("Este producto no tiene stock disponible")
      return
    }

    onSelectProducto(selectedProducto, cantidad)
    handleClose()
  }

  const handleClose = () => {
    onClose()
    setSelectedProducto(null)
    setCantidad(1)
    setSearchTerm("")
    setSelectedCategoria(null)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Seleccionar Producto</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Filter size={16} className="text-slate-400" />
            <button
              onClick={() => setSelectedCategoria(null)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategoria === null
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todas
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => setSelectedCategoria(categoria.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategoria === categoria.id ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={{
                  backgroundColor: selectedCategoria === categoria.id ? categoria.color : undefined,
                }}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Cargando productos...</p>
            </div>
          ) : filteredProductos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProductos.map((producto) => (
                <div
                  key={producto.id}
                  onClick={() => handleSelectProducto(producto)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProducto?.id === producto.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  } ${producto.stock === 0 ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{producto.nombre}</h3>
                      <p className="text-sm text-slate-600 mt-1">{producto.descripcion}</p>
                      {producto.categoria && (
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white mt-2"
                          style={{ backgroundColor: producto.categoria.color }}
                        >
                          {producto.categoria.nombre}
                        </span>
                      )}
                    </div>
                    {selectedProducto?.id === producto.id && <Check className="text-blue-600" size={20} />}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">RD${producto.precio.toFixed(2)}</p>
                      <p className={`text-sm ${producto.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        Stock: {producto.stock}
                      </p>
                    </div>
                    <Package className="text-slate-400" size={20} />
                  </div>

                  {producto.stock === 0 && (
                    <div className="mt-2 text-center">
                      <span className="text-xs text-red-600 font-medium">Sin stock disponible</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <p>No se encontraron productos</p>
              <p className="text-sm">Intenta con otro término de búsqueda o categoría</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedProducto && (
          <div className="p-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-slate-900">{selectedProducto.nombre}</h3>
                <p className="text-sm text-slate-600">RD${selectedProducto.precio.toFixed(2)} c/u</p>
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-slate-700">Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProducto.stock}
                  value={cantidad}
                  onChange={(e) => handleCantidadChange(Number.parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  disabled={selectedProducto.stock === 0}
                />
                <span className="text-sm text-slate-600">de {selectedProducto.stock}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Total: RD${(selectedProducto.precio * cantidad).toFixed(2)}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarSeleccion}
                  className="btn-primary"
                  disabled={!selectedProducto || selectedProducto.stock === 0 || cantidad > selectedProducto.stock}
                >
                  Agregar Producto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
