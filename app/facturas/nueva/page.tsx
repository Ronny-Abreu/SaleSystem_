"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Plus, Minus, Printer, Save, ArrowLeft, Calculator, Package, Search, Info, AlertCircle } from "lucide-react"
import { useProductos } from "@/hooks/useProductos"
import { useFacturas } from "@/hooks/useFacturas"
import { useClientes } from "@/hooks/useClientes"
import { useRouter, useSearchParams } from "next/navigation"
import { ClienteSearchModal } from "@/components/modals/cliente-search-modal"
import { ProductoSearchModal } from "@/components/modals/producto-search-modal"
import { buildBackendUrl } from "@/lib/config"
import type { Cliente, Producto } from "@/lib/types"

interface FacturaItem {
  id: string
  producto_id: number
  nombre: string
  cantidad: number
  precio: number
  total: number
}

export default function NuevaFactura() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { productos, loading: loadingProductos } = useProductos(true) // Solo productos activos
  const { crearFactura } = useFacturas()
  const { buscarPorId } = useClientes()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [items, setItems] = useState<FacturaItem[]>([])
  const [comentario, setComentario] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showProductoModal, setShowProductoModal] = useState(false)
  const [estadoFactura, setEstadoFactura] = useState<"pagada" | "pendiente">("pagada")

  // Detectar si viene desde productos
  const vieneDesdeProductos = searchParams.get("desde") === "productos"
  
  // Obtener clienteId de la URL si viene de creación de cliente
  const clienteIdFromUrl = searchParams.get("clienteId")

  // Efecto para cargar cliente si viene desde la creación de cliente
  useEffect(() => {
    const loadClienteFromUrl = async () => {
      if (clienteIdFromUrl && !cliente) {
        try {
          const clienteCargado = await buscarPorId(Number.parseInt(clienteIdFromUrl))
          if (clienteCargado) {
            setCliente(clienteCargado)

            const newUrl = window.location.pathname
            window.history.replaceState({}, "", newUrl)
          }
        } catch (err) {
          console.error("Error cargando cliente:", err)
        }
      }
    }
    loadClienteFromUrl()
  }, [clienteIdFromUrl, cliente, buscarPorId])

  // Efecto para precargar productos del carrito si viene desde la pantalla de productos
  useEffect(() => {
    if (vieneDesdeProductos && productos.length > 0) {
      const totalItems = parseInt(searchParams.get("totalItems") || "0")
      const nuevosItems: FacturaItem[] = []

      for (let i = 1; i <= totalItems; i++) {
        const productoId = searchParams.get(`producto${i}`)
        const cantidad = parseInt(searchParams.get(`cantidad${i}`) || "1")

        if (productoId) {
          const producto = productos.find((p) => p.id === Number(productoId))
          if (producto) {
            const nuevoItem: FacturaItem = {
              id: `${producto.id}-${Date.now()}-${i}`,
              producto_id: producto.id,
              nombre: producto.nombre,
              cantidad: cantidad,
              precio: producto.precio,
              total: cantidad * producto.precio,
            }
            nuevosItems.push(nuevoItem)
          }
        }
      }

      if (nuevosItems.length > 0) {
        setItems(nuevosItems)
      }
    } else {
      // Lógica original para productos individuales
      const productoId = searchParams.get("productoId")
      if (productoId && productos.length > 0) {
        const productoParaPrecargar = productos.find((p) => p.id === Number(productoId))
        if (productoParaPrecargar) {
          if (!items.some((item) => item.producto_id === productoParaPrecargar.id)) {
            handleSelectProducto(productoParaPrecargar, 1)
          }
        }
      }
    }
  }, [searchParams, productos, vieneDesdeProductos])

  const handleSelectCliente = (clienteSeleccionado: Cliente) => {
    setCliente(clienteSeleccionado)
  }

  const agregarItem = () => {
    setShowProductoModal(true)
  }

  const handleSelectProducto = (producto: Producto, cantidad: number) => {
    const nuevoItem: FacturaItem = {
      id: `${producto.id}-${Date.now()}-${Math.random()}`,
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: cantidad,
      precio: producto.precio,
      total: cantidad * producto.precio,
    }

    setItems((prevItems) => [...prevItems, nuevoItem])
  }

  const actualizarCantidad = (id: string, nuevaCantidad: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const itemActualizado = { ...item, cantidad: nuevaCantidad }
          itemActualizado.total = itemActualizado.cantidad * itemActualizado.precio
          return itemActualizado
        }
        return item
      }),
    )
  }

  const eliminarItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const calcularSubtotal = () => {
    return items.reduce((sum, item) => sum + item.cantidad * item.precio, 0)
  }

  const limpiarCarritoEnLocalStorage = () => {
    if (vieneDesdeProductos) {
      localStorage.removeItem('carrito-productos')
    }
  }

  const handleVolver = () => {
    if (vieneDesdeProductos) {
      router.push('/productos')
    } else {
      router.push('/facturas')
    }
  }

  const guardarFactura = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validaciones
      if (!cliente) {
        throw new Error("Debe seleccionar un cliente válido")
      }

      if (items.length === 0) {
        throw new Error("Debe agregar al menos un artículo")
      }

      const itemsInvalidos = items.filter((item) => !item.producto_id || item.cantidad <= 0 || item.precio <= 0)
      if (itemsInvalidos.length > 0) {
        throw new Error("Todos los artículos deben tener producto, cantidad y precio válidos")
      }

      // Validar stock disponible
      for (const item of items) {
        const producto = productos.find((p) => p.id === item.producto_id)
        if (producto && item.cantidad > producto.stock) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`,
          )
        }
      }

      const subtotal = calcularSubtotal()

      const facturaData = {
        cliente_id: cliente.id,
        fecha: new Date().toISOString().split("T")[0],
        subtotal,
        total: subtotal,
        comentario,
        estado: estadoFactura,
        detalles: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
        })),
      }

      const facturaCreada = await crearFactura(facturaData)

      // Limpiar carrito si viene desde productos
      limpiarCarritoEnLocalStorage()

      // Abrir PDF en una nueva pestaña
      const pdfUrl = buildBackendUrl(`api/facturas.php?action=generate_pdf&id=${facturaCreada.id}`)
      window.open(pdfUrl, "_blank")

      // Redirigir según el origen
      if (vieneDesdeProductos) {
        router.push(`/productos?factura_creada=true&numero=${facturaCreada.numero_factura}`)
      } else {
        router.push(`/facturas?success=true&numero=${facturaCreada.numero_factura}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const numeroFactura = `REC-${String(Date.now()).slice(-3)}`
  const fechaActual = new Date().toLocaleDateString("es-DO")

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Nueva Factura" subtitle="Crear una nueva factura de venta" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          <div className="max-w-4xl mx-auto">
            {/* Header con botones*/}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={showPreview ? () => setShowPreview(false) : handleVolver}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="hidden md:inline">
                  {showPreview 
                    ? "Volver a factura actural" 
                    : (vieneDesdeProductos ? "Volver a productos" : "Volver a facturas")
                  }
                </span>
                <span className="md:hidden">Volver</span>
              </button>

              <div className="flex space-x-2 md:space-x-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-secondary flex items-center space-x-2 px-3 py-2 text-sm whitespace-nowrap"
                >
                  <Calculator size={16} />
                  <span>Vista previa</span>
                </button>

              </div>
            </div>

            {/* Mensaje informativo si viene desde productos */}
            {vieneDesdeProductos && items.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Package className="text-green-600" size={20} />
                  <p className="text-green-700">
                    <span className="font-semibold">Productos del carrito cargados:<br></br></span> {items.length} artículo{items.length !== 1 ? 's' : ''} cargados correctamente.
                  </p>
                </div>
              </div>
            )}

            {!showPreview ? (
              /* Formulario de edición */
              <div className="space-y-6">
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Información de la factura */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Información de la Factura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Número de Factura</label>
                      <input
                        type="text"
                        value={numeroFactura}
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
                      <input
                        type="text"
                        value={fechaActual}
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                      <select
                        value={estadoFactura}
                        onChange={(e) => setEstadoFactura(e.target.value as "pagada" | "pendiente")}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      >
                        <option value="pagada">Pagada</option>
                        <option value="pendiente">Pendiente</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información del cliente mejorada */}
                <div className="card">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold text-slate-900">Información del Cliente</h3>
                    </div>

                    {/* Botones de info - buscar - crear cliente */}
                    <div className="flex items-center space-x-2 md:order-last flex-wrap">
                      <div className="group relative">
                        <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                          <Info size={16} />
                        </button>
                        <div className="absolute -left-5 md:-left-4 top-8 w-64 p-3 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          Elije un cliente registrado, también puedes crearlo rápidamente en '<b>+</b>' y se autocompletará con su código y nombre correspondiente.
                        </div>
                      </div>

                      <button
                        onClick={() => setShowClienteModal(true)}
                        className="inline-flex items-center space-x-1.5 px-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        <Search size={14} />
                        <span className="text-xs">Buscar Cliente</span>
                      </button>

                      <button
                        onClick={() => router.push('/clientes/nuevo?returnTo=/facturas/nueva')}
                        className="inline-flex items-center space-x-1.5 px-2 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        <Plus size={14} />
                        <span className="text-xs md:hidden">Crear</span>
                        <span className="text-xs hidden md:inline">Crear Cliente</span>
                      </button>

                      
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Código del Cliente</label>
                      <input
                        type="text"
                        value={cliente?.codigo || ""}
                        disabled
                        placeholder="Selecciona un cliente"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-medium placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Cliente</label>
                      <input
                        type="text"
                        value={cliente?.nombre || ""}
                        disabled
                        placeholder="Selecciona un cliente"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-medium placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Artículos */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Artículos ({items.length})</h3>

                    {/* Contenedor de botones para escritorio */}
                    <div className="hidden md:flex items-center space-x-2">
                      {/* Botón Facturar desktop */}
                      {cliente && items.length > 0 && (
                        <button
                        onClick={guardarFactura}
                        disabled={loading}
                        className="btn-primary flex flex-row items-center gap-2 bg-orange-500 hover:bg-orange-600"
                      >
                        <Save size={16} />
                        <span className="whitespace-nowrap">{loading ? "Facturando..." : `Facturar ${cliente?.nombre || ''}`}</span>
                      </button>
                      )}

                      {/* Botón desktop */}
                      <button
                        onClick={agregarItem}
                        className="btn-primary flex flex-row items-center gap-2 animate-pulse hover:animate-none"
                        >
                        <Plus size={16} />
                        <span className="whitespace-nowrap">Agregar artículo</span>
                      </button>
                    </div>

                    {/* Botón agregar artículo responsive (solo móvil) */}
                    <div className="relative md:hidden">
                      <button
                        onClick={agregarItem}
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all duration-1000 animate-pulse hover:animate-none shadow-lg"
                      >
                        <Plus size={20} />
                      </button>

                      {/* Tooltip permanente para móvil */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-10">
                        <span className="whitespace-nowrap">Agregar artículo</span>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const producto = productos.find((p) => p.id === item.producto_id)
                      const excedeCantidad = producto && item.cantidad > producto.stock

                      return (
                        <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                          {/* Nombre del producto */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Artículo #{index + 1}
                            </label>
                            <input
                              type="text"
                              value={item.nombre}
                              disabled
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-800 font-medium"
                            />
                          </div>

                          {/* Fila con cantidad, total y eliminar */}
                          <div className="flex items-center space-x-4">
                            {/* Cantidad */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <label className="block text-sm font-medium text-slate-700">Cantidad</label>
                                {excedeCantidad && (
                                  <div className="md:hidden group relative">
                                    <button className="p-1 text-red-500 hover:text-red-600 transition-colors">
                                      <AlertCircle size={12} />
                                    </button>
                                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 whitespace-nowrap">
                                      No hay esa cantidad disponible
                                    </div>
                                  </div>
                                )}
                              </div>

                              <input
                                type="number"
                                min="1"
                                max={producto?.stock}
                                value={item.cantidad}
                                onChange={(e) => actualizarCantidad(item.id, Number.parseInt(e.target.value) || 1)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 ${
                                  excedeCantidad ? "border-red-500 bg-red-50 animate-shake" : "border-slate-300"
                                }`}
                              />
                            </div>

                            {/* Total */}
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-slate-700 mb-2">Total</label>
                              <p className="text-lg font-semibold text-slate-900 py-2">
                                RD${(item.cantidad * item.precio).toFixed(2)}
                              </p>
                            </div>

                            {/* Botón eliminar */}
                            <div className="flex-shrink-0">
                              <label className="block text-sm font-medium text-slate-700 mb-2 opacity-0">
                                Eliminar
                              </label>
                              <button
                                onClick={() => eliminarItem(item.id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar artículo"
                              >
                                <Minus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {items.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No hay artículos agregados</p>
                        <p className="text-sm md:hidden">Haz clic en el botón "+" para comenzar</p>
                        <p className="text-sm hidden md:block">Haz clic en "Agregar artículo" para comenzar</p>
                      </div>
                    )}
                  </div>
                </div>

                
                {/* Total y comentarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Comentarios</h3>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Comentarios adicionales (opcional)"
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-800 placeholder-slate-500"
                    />
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-slate-600">
                        <span>Artículos:</span>
                        <span>{items.length}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>RD${calcularSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between text-lg font-semibold text-slate-900">
                          <span>Total a Pagar:</span>
                          <span>RD${calcularSubtotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Vista previa de la factura */
              <div className="card max-w-2xl mx-auto factura-print">
                <div className="text-center mb-6">
                  <img src="/SaleSystemLOGO.png" alt="SaleSystem Logo" className="mx-auto h-24 w-auto mb-2" />
                  <p className="text-slate-600">Sistema de Facturación</p>
                  <div className="mt-4 p-2 bg-slate-100 rounded-lg inline-block">
                    <p className="font-semibold text-slate-800">Factura: {numeroFactura}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Información de la Factura</h3>
                    <p className="text-slate-600">Fecha: {fechaActual}</p>
                    <p className="text-slate-600">Número: {numeroFactura}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Cliente</h3>
                    <p className="text-slate-600">Código: {cliente?.codigo || "N/A"}</p>
                    <p className="text-slate-600">Nombre: {cliente?.nombre || "N/A"}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Artículos</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 text-slate-700">Artículo</th>
                          <th className="text-center py-2 text-slate-700">Cant.</th>
                          <th className="text-right py-2 text-slate-700">Precio</th>
                          <th className="text-right py-2 text-slate-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b border-slate-100">
                            <td className="py-2 text-slate-900">{item.nombre}</td>
                            <td className="py-2 text-center text-slate-600">{item.cantidad}</td>
                            <td className="py-2 text-right text-slate-600">RD${item.precio.toFixed(2)}</td>
                            <td className="py-2 text-right font-semibold text-slate-900">
                              RD${(item.cantidad * item.precio).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-end">
                    <div className="w-64">
                      <div className="flex justify-between text-lg font-bold text-slate-900">
                        <span>Total a Pagar:</span>
                        <span>RD${calcularSubtotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {comentario && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">Comentarios:</h4>
                    <p className="text-slate-600">{comentario}</p>
                  </div>
                )}

                <div className="mt-8 text-center text-sm text-slate-500">
                  <p>¡Gracias por su compra!</p>
                  <p>La Rubia - Sistema de Facturación</p>
                </div>
              </div>
            )}
          </div>

          {!showPreview && (
            <div className={`md:hidden fixed bottom-20 right-6 z-50 transition-opacity duration-500 ${cliente && items.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={guardarFactura}
                disabled={loading}
                className="w-14 h-14 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                title={loading ? "Guardando..." : "Guardar Factura"}
              >
                <Save size={24} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal de búsqueda de clientes mejorado */}
      <ClienteSearchModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSelectCliente={handleSelectCliente}
      />

      {/* Modal de selección de productos */}
      <ProductoSearchModal
        isOpen={showProductoModal}
        onClose={() => setShowProductoModal(false)}
        onSelectProducto={handleSelectProducto}
      />
    </div>
  )
}