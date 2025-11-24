"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Package, Plus, Edit, Trash2, ShoppingCart, Filter, RefreshCw, X, ChevronDown, Check, Minus } from "lucide-react"
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

interface CarritoItem {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

export default function ProductosPage() {
  const router = useRouter()
  const { productos, loading, error, refetch, eliminarProducto } = useProductos()
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null)
  const [carrito, setCarrito] = useState<CarritoItem[]>([])
  const [carritoExpandido, setCarritoExpandido] = useState(true)
  const [productosSeleccionados, setProductosSeleccionados] = useState<Set<number>>(new Set())
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isCartAnimating, setIsCartAnimating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Cargar estado de carritoExpandido desde localStorage al montar el componente
  useEffect(() => {
    const carritoExpandidoGuardado = localStorage.getItem("carrito-expandido")
    if (carritoExpandidoGuardado !== null) {
      setCarritoExpandido(JSON.parse(carritoExpandidoGuardado))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("carrito-expandido", JSON.stringify(carritoExpandido)) // Guardar estado de carritoExpandido en localStorage cada vez que cambie
  }, [carritoExpandido])

  useEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setSidebarOpen(event.detail.isOpen)

      if (event.detail.isOpen && carritoExpandido) { // Si el sidebar se abre, contraer el carrito
        setCarritoExpandido(false)
      }
    }

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener)
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener)
    }
  }, [carritoExpandido])

  useEffect(() => {
    const carritoGuardado = localStorage.getItem("carrito-productos")   // Cargar carrito desde localStorage al montar el componente
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("carrito-productos", JSON.stringify(carrito))
  }, [carrito])

  const categoriasReales = productos.reduce((acc, producto) => {
    if (producto.categoria && producto.categoria_id) {
      const categoriaExistente = acc.find((c) => c.id === producto.categoria_id)
      if (!categoriaExistente) {
        acc.push({
          id: producto.categoria_id,
          nombre: producto.categoria.nombre,
          color: producto.categoria.color || "#6B7280",
        })
      }
    }
    return acc
  }, [] as Array<{ id: number; nombre: string; color: string }>)

  // Filtrar productos por categoría
  const productosFiltrados = selectedCategoria
    ? productos.filter((p) => p.categoria_id === selectedCategoria)
    : productos

  const productosAgrupados = categoriasReales.map((categoria) => ({
    ...categoria,
    productos: productos.filter((p) => p.categoria_id === categoria.id),
  })).filter((grupo) => grupo.productos.length > 0)

  // Productos sin categoría
  const productosSinCategoria = productos.filter((p) => !p.categoria_id)

  const agregarAlCarrito = (producto: any) => {
    if (!producto.activo) {
      alert("Este producto está inactivo y no se puede agregar al carrito")
      return
    }

    setCarrito((prevCarrito) => {
      const itemExistente = prevCarrito.find((item) => item.producto_id === producto.id)

      if (itemExistente) {
        // Si ya existe, incrementar cantidad
        return prevCarrito.map((item) =>
          item.producto_id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      } else {
        // Si no existe, agregar nuevo item
        return [
          ...prevCarrito,
          {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
          },
        ]
      }
    })
  }

  const eliminarDelCarrito = (producto_id: number) => {
    setCarrito((prevCarrito) => {
      const itemExistente = prevCarrito.find((item) => item.producto_id === producto_id)

      if (itemExistente && itemExistente.cantidad > 1) {
        // Si tiene más de 1, decrementar cantidad
        return prevCarrito.map((item) =>
          item.producto_id === producto_id ? { ...item, cantidad: item.cantidad - 1 } : item,
        )
      } else {
        // Si tiene 1 o menos, eliminar del carrito
        return prevCarrito.filter((item) => item.producto_id !== producto_id)
      }
    })
  }

  const limpiarCarrito = () => {
    setCarrito([])
    setProductosSeleccionados(new Set())
  }

  const eliminarProductosSeleccionados = () => {
    if (productosSeleccionados.size === 0) return

    setCarrito((prevCarrito) => prevCarrito.filter((item) => !productosSeleccionados.has(item.producto_id)))
    setProductosSeleccionados(new Set())
  }

  const aumentarCantidadSeleccionados = () => {
    if (productosSeleccionados.size === 0) return
    setCarrito((prevCarrito) =>
      prevCarrito.map((item) =>
        productosSeleccionados.has(item.producto_id) ? { ...item, cantidad: item.cantidad + 1 } : item,
      ),
    )
  }

  const disminuirCantidadSeleccionados = () => {
    if (productosSeleccionados.size === 0) return
    setCarrito((prevCarrito) =>
      prevCarrito
        .map((item) =>
          productosSeleccionados.has(item.producto_id) ? { ...item, cantidad: item.cantidad - 1 } : item,
        )
        .filter((item) => item.cantidad > 0),
    )
  }

  const toggleSeleccionProducto = (producto_id: number) => {
    setProductosSeleccionados((prev) => {
      const nuevaSeleccion = new Set(prev)
      if (nuevaSeleccion.has(producto_id)) {
        nuevaSeleccion.delete(producto_id)
      } else {
        nuevaSeleccion.add(producto_id)
      }
      return nuevaSeleccion
    })
  }

  const irAFactura = () => {
    // Animación carrito
    setIsCartAnimating(true)
    setCarritoExpandido(false)

    setTimeout(() => {
      setShowSuccessMessage(true)
      setTimeout(
        () => {
          // Crear URL con los productos del carrito
          const carritoParams = carrito
            .map((item, index) => `producto${index + 1}=${item.producto_id}&cantidad${index + 1}=${item.cantidad}`)
            .join("&")

          router.push(`/facturas/nueva?desde=productos&${carritoParams}&totalItems=${carrito.length}`)

          // Reset estados después de la navegación
          setShowSuccessMessage(false)
          setIsCartAnimating(false)
        },
        window.innerWidth < 768 ? 1500 : 1000,
      )
    }, 1000)
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

  const totalItemsCarrito = carrito.reduce((total, item) => total + item.cantidad, 0)
  const totalPrecioCarrito = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0)

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mensaje de éxito al crear factura*/}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80]">
          <div className="bg-white rounded-lg p-6 shadow-xl text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">¡Productos enviados exitosamente!</p>
            <p className="text-sm text-slate-600">
              {carrito.length} producto{carrito.length !== 1 ? "s" : ""} enviado{carrito.length !== 1 ? "s" : ""} a
              crear factura
            </p>

            {/* Animación de productos */}
            <div className="mt-4 flex justify-center space-x-2">
              {carrito.slice(0, 3).map((item, index) => (
                <div
                  key={item.producto_id}
                  className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Package size={16} className="text-blue-600" />
                </div>
              ))}
              {carrito.length > 3 && (
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-xs text-slate-600">+{carrito.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  Productos organizados por categorías
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
              <div className="flex items-center space-x-4 mb-4">
                <Filter size={20} className="text-slate-400 flex-shrink-0" />
                <button
                    onClick={() => setSelectedCategoria(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategoria === null
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className="whitespace-nowrap">Todas las categorías ({productos.length})</span>
                  </button>
              </div>
              <div className="flex flex-wrap gap-2">
                  {categoriasReales.map((categoria) => {
                    const count = productos.filter((p) => p.categoria_id === categoria.id).length
                    return (
                      <button
                        key={categoria.id}
                        onClick={() => setSelectedCategoria(categoria.id)}
                        className={`flex-grow flex-shrink-0 basis-[calc(33.33%-0.5rem)] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategoria === categoria.id
                            ? "text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        style={{
                          backgroundColor: selectedCategoria === categoria.id ? categoria.color : undefined,
                        }}
                      >
                        <span className="whitespace-nowrap">{categoria.nombre} ({count})</span>
                      </button>
                    )
                  })}
                  {productosSinCategoria.length > 0 && (
                    <button
                      onClick={() => setSelectedCategoria(0)}
                      className={`flex-grow flex-shrink-0 basis-[calc(33.33%-0.5rem)] px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategoria === 0
                          ? "bg-gray-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span className="whitespace-nowrap">Sin categoría ({productosSinCategoria.length})</span>
                    </button>
                  )}
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
                      carrito={carrito}
                      onAgregarAlCarrito={agregarAlCarrito}
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
                  {categoriasReales.find((c) => c.id === selectedCategoria)?.nombre || "Categoría"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productosFiltrados.map((producto) => (
                    <ProductoCard
                      key={producto.id}
                      producto={producto}
                      carrito={carrito}
                      onAgregarAlCarrito={agregarAlCarrito}
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
                          carrito={carrito}
                          onAgregarAlCarrito={agregarAlCarrito}
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
                          carrito={carrito}
                          onAgregarAlCarrito={agregarAlCarrito}
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

      {/* Carrito flotante */}
      {carrito.length > 0 && (
        <div className={`fixed bottom-6 right-6 ${sidebarOpen ? 'z-[30]' : 'z-50'}`}>
          {carritoExpandido && !sidebarOpen ? (
            // Carrito expandido (solo si el sidebar no está abierto)
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-80 lg:w-96 transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                  <ShoppingCart size={18} />
                  <span>Carrito ({totalItemsCarrito})</span>
                </h3>
                <div className="flex items-center space-x-2">
                  {productosSeleccionados.size > 0 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={disminuirCantidadSeleccionados}
                        disabled={Array.from(productosSeleccionados).some(
                          (id) => carrito.find((item) => item.producto_id === id)?.cantidad === 1,
                        )}
                        className="p-1 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Disminuir cantidad de seleccionados"
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        onClick={aumentarCantidadSeleccionados}
                        className="p-1 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Aumentar cantidad de seleccionados"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={eliminarProductosSeleccionados}
                        className="text-red-500 hover:text-red-600 transition-colors group"
                        title="Eliminar productos seleccionados"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Eliminar productos seleccionados
                      </div>
                    </div>
                  )}
                  <button
                    onClick={limpiarCarrito}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Limpiar carrito"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => setCarritoExpandido(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Contraer carrito"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {carrito.map((item) => (
                  <div key={item.producto_id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={productosSeleccionados.has(item.producto_id)}
                      onChange={() => toggleSeleccionProducto(item.producto_id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded "
                    />
                    <div className="flex items-center flex-1">
                      <span className="truncate flex-grow mr-2 text-slate-900">{item.nombre}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-auto min-w-[120px]">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-700 w-8 text-center">
                          {item.cantidad}
                        </span>
                        <span className="text-green-600 font-medium text-xs text-right">
                          RD${(item.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-slate-900">Total:</span>
                  <span className="font-bold text-green-600">RD${totalPrecioCarrito.toFixed(2)}</span>
                </div>
                <button
                  onClick={irAFactura}
                  className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isCartAnimating ? "animate-pulse scale-105 bg-green-500" : ""
                  }`}
                >
                  <ShoppingCart
                    size={16}
                    className={`transition-all duration-300 ${isCartAnimating ? "animate-bounce" : ""}`}
                  />
                  <span>{isCartAnimating ? "Enviando..." : "Crear Factura"}</span>
                </button>
              </div>
            </div>
          ) : (
            // Botón carrito flotante contraído
            <button
              onClick={() => !sidebarOpen && setCarritoExpandido(true)}
              className="bg-green-600 hover:bg-green-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 relative"
              title="Ver carrito"
            >
              <ShoppingCart size={24} />
              {/* Badge con cantidad de items */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {totalItemsCarrito}
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Componente para la tarjeta de producto
function ProductoCard({
  producto,
  carrito,
  onAgregarAlCarrito,
  onEditar,
  onEliminar,
}: {
  producto: any
  carrito: CarritoItem[]
  onAgregarAlCarrito: (producto: any) => void
  onEditar: (producto: any) => void
  onEliminar: (producto: any) => void
}) {
  const itemEnCarrito = carrito.find((item) => item.producto_id === producto.id)
  const cantidadEnCarrito = itemEnCarrito?.cantidad || 0

  // Estados para la animación del botón, para tener un control de que palabra y animación mostrar
  const [buttonState, setButtonState] = useState<"initial" | "animating" | "added" | "addingMore">( //Inital = Agregar al carrito, Animating = animación de borrar palabras, added = se agregará el nuevo boton, addingmore = nuevo mensaje del boton
    cantidadEnCarrito > 0 ? "added" : "initial",
  )

  // Actualizar el estado del botón cuando cambie la cantidad en el carrito
  useEffect(() => {
    if (cantidadEnCarrito > 0 && buttonState === "initial") {
      setButtonState("added")
    } else if (cantidadEnCarrito === 0 && buttonState !== "initial") {
      setButtonState("initial")
    }
  }, [cantidadEnCarrito, buttonState])

  const handleAgregarAlCarrito = () => {
    if (!producto.activo || producto.stock === 0) return

    if (buttonState === "initial") {
      setButtonState("animating")
      setTimeout(() => {
        setButtonState("added")
        onAgregarAlCarrito(producto)
      }, 1000)
    } else if (buttonState === "added") {
      setButtonState("addingMore")
      setTimeout(() => {
        setButtonState("added")
      }, 1200)
      onAgregarAlCarrito(producto)
    }
  }

  return (
    <div className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow relative">
      {cantidadEnCarrito > 0 && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">{cantidadEnCarrito}</span>
          </div>
        </div>
      )}

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
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between w-full gap-1">
            <span className="text-base sm:text-lg font-semibold text-slate-900 xs:mr-3 whitespace-nowrap">
              RD${producto.precio.toFixed(2)}
            </span>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
              <span className={`text-sm ${producto.stock > 0 ? "text-green-600" : "text-red-600"} whitespace-nowrap`}>
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
        </div>

        <button
          onClick={handleAgregarAlCarrito}
          disabled={producto.stock === 0 || !producto.activo || buttonState === "animating"}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors relative overflow-hidden ${
            producto.stock > 0 && producto.activo
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {/* Ícono del carrito */}
          <ShoppingCart
            size={14}
            className={`transition-all duration-500 z-10 ${
              buttonState === "animating"
                ? "transform translate-x-8 opacity-0"
                : buttonState === "added" || buttonState === "addingMore"
                  ? "transform translate-x-0 opacity-100"
                  : "transform translate-x-0 opacity-100"
            } ${buttonState === "addingMore" ? "animate-[slide-in-left_1s_cubic-bezier(0.250,0.460,0.450,0.940)]" : ""}`}
          />

          {/* Contenedor del texto = Correspondiente para las animaciones del botón para agregar al carrito */}
          <span className="relative z-10">
            {!producto.activo ? (
              "Producto Inactivo"
            ) : producto.stock === 0 ? (
              "Sin Stock"
            ) : (
              <>
                {/* Texto "Agregar al carrito" */}
                <span
                  className={`absolute whitespace-nowrap transition-all duration-500 ${
                    buttonState === "animating"
                      ? "opacity-0 transform translate-x-1"
                      : buttonState === "initial"
                        ? "opacity-100 transform translate-x-0"
                        : "opacity-0 transform translate-x-1"
                  }`}
                >
                  Agregar al carrito
                </span>

                {/* Texto: "Agregar más" */}
                <span
                  className={`whitespace-nowrap transition-all duration-500 delay-300 ${
                    buttonState === "added" || buttonState === "addingMore"
                      ? "opacity-100 transform translate-x-0"
                      : "opacity-0 transform -translate-x-1"
                  }`}
                >
                  Agregar más
                </span>
              </>
            )}
          </span>

          {/* Estilos CSS personalizados para las animaciones del botón para agregar al carrito */}
          <style jsx>{`
            @keyframes slide-in-left {
              0% {
                transform: translateX(-5px);
                opacity: 0;
              }
              100% {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
        </button>
      </div>
    </div>
  )
}