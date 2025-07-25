"use client"

import { useState, useEffect } from "react"
import { Search, X, Package, Check, Filter, AlertCircle, ShoppingCart } from "lucide-react"
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
  const [selectedProductos, setSelectedProductos] = useState<{
    [key: number]: { producto: Producto; cantidad: number }
  }>({})
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isCartAnimating, setIsCartAnimating] = useState(false)

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
    setError(null)

    if (producto.stock === 0) {
      setError(`El producto "${producto.nombre}" no tiene stock disponible`)
      return
    }

    // Permitir deseleccionar haciendo click nuevamente
    if (selectedProductos[producto.id]) {
      const newSelected = { ...selectedProductos }
      delete newSelected[producto.id]
      setSelectedProductos(newSelected)
    } else {
      setSelectedProductos({
        ...selectedProductos,
        [producto.id]: { producto, cantidad: 1 },
      })
    }
  }

  const handleCantidadChange = (productoId: number, nuevaCantidad: number) => {
    if (selectedProductos[productoId]) {
      const producto = selectedProductos[productoId].producto

      if (nuevaCantidad > producto.stock) {
        setError(`Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`)
        return
      }

      setSelectedProductos({
        ...selectedProductos,
        [productoId]: {
          ...selectedProductos[productoId],
          cantidad: nuevaCantidad,
        },
      })
      setError(null)
    }
  }

  const handleConfirmarSeleccion = () => {
    const productosSeleccionados = Object.values(selectedProductos)

    if (productosSeleccionados.length === 0) {
      setError("Debe elegir al menos un producto")
      return
    }

    // Validar stock para todos los productos
    for (const item of productosSeleccionados) {
      if (item.cantidad <= 0) {
        setError("La cantidad debe ser mayor a 0")
        return
      }

      if (item.cantidad > item.producto.stock) {
        setError(`Solo hay ${item.producto.stock} unidades disponibles de "${item.producto.nombre}"`)
        return
      }

      if (item.producto.stock === 0) {
        setError("Algunos productos no tienen stock disponible")
        return
      }
    }

    // Animación unificada para móvil y desktop
    setIsCartAnimating(true)

    setTimeout(() => {
      setShowSuccessMessage(true)
      setTimeout(
        () => {
          // Agregar todos los productos
          productosSeleccionados.forEach((item) => {
            onSelectProducto(item.producto, item.cantidad)
          })
          handleClose()
        },
        window.innerWidth < 768 ? 1500 : 1000,
      ) // Menos tiempo en desktop
    }, 1000)
  }

  const handleClose = () => {
    onClose()
    setSelectedProductos({})
    setSearchTerm("")
    setSelectedCategoria(null)
    setError(null)
    setShowSuccessMessage(false)
    setIsCartAnimating(false)
  }

  const calcularTotal = () => {
    return Object.values(selectedProductos).reduce((total, item) => {
      return total + item.producto.precio * item.cantidad
    }, 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Mensaje de éxito para móvil y desktop */}
      {showSuccessMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 shadow-xl text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">¡Productos agregados exitosamente!</p>
            <p className="text-sm text-slate-600">
              {Object.values(selectedProductos).length} producto
              {Object.values(selectedProductos).length !== 1 ? "s" : ""} agregado
              {Object.values(selectedProductos).length !== 1 ? "s" : ""} a la factura
            </p>

            {/* Animación de productos */}
            <div className="mt-4 flex justify-center space-x-2">
              {Object.values(selectedProductos)
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={item.producto.id}
                    className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Package size={16} className="text-blue-600" />
                  </div>
                ))}
              {Object.values(selectedProductos).length > 3 && (
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-xs text-slate-600">+{Object.values(selectedProductos).length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col ${showSuccessMessage ? "opacity-0" : ""}`}
      >
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
                    selectedProductos[producto.id]
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
                    {selectedProductos[producto.id] && <Check className="text-blue-600" size={20} />}
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
        {Object.keys(selectedProductos).length > 0 && (
          <div className="p-6 border-t border-slate-200">
            {/* Productos seleccionados */}
            <div className="mb-4 max-h-32 overflow-y-auto">
              <h4 className="font-medium text-slate-900 mb-2">Productos seleccionados:</h4>
              <div className="space-y-2">
                {Object.values(selectedProductos).map(({ producto, cantidad }) => (
                  <div key={producto.id} className="grid grid-cols-12 gap-2 items-center text-sm">
                    {/* Nombre del producto */}
                    <div className="col-span-6">
                      <span className="text-slate-700 truncate block">{producto.nombre}</span>
                    </div>

                    {/* Input de cantidad */}
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        max={producto.stock}
                        value={cantidad}
                        onChange={(e) => handleCantidadChange(producto.id, Number.parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Precio unitario y total */}
                    <div className="col-span-4 text-right">
                      <span className="text-slate-600">× RD${producto.precio.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">Total: RD${calcularTotal().toFixed(2)}</p>
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
                  className={`flex items-center justify-center w-12 h-10 md:w-auto md:h-auto md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    isCartAnimating ? "animate-pulse scale-110 bg-green-600" : ""
                  } shadow-lg hover:shadow-xl`}
                  disabled={Object.keys(selectedProductos).length === 0}
                >
                  <ShoppingCart
                    size={16}
                    className={`transition-all duration-300 ${isCartAnimating ? "animate-bounce" : ""}`}
                  />
                  <span className="hidden md:inline md:ml-2 font-medium">
                    {isCartAnimating ? "Agregando..." : "Agregar Productos"}
                  </span>

                  {/* Contador de productos en el botón del carrito */}
                  {Object.keys(selectedProductos).length > 0 && !isCartAnimating && (
                    <span className="hidden md:inline ml-2 bg-blue-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {Object.keys(selectedProductos).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
