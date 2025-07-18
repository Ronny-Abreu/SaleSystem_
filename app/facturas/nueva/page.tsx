"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Plus, Minus, Printer, Save, ArrowLeft, Calculator, Package } from "lucide-react"
import Link from "next/link"

interface FacturaItem {
  id: string
  nombre: string
  cantidad: number
  precio: number
  total: number
}

interface Cliente {
  codigo: string
  nombre: string
}

export default function NuevaFactura() {
  const [cliente, setCliente] = useState<Cliente>({ codigo: "", nombre: "" })
  const [items, setItems] = useState<FacturaItem[]>([])
  const [comentario, setComentario] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  // Datos de ejemplo para autocompletar
  const clientesEjemplo = [
    { codigo: "CLI-001", nombre: "Juan Pérez" },
    { codigo: "CLI-002", nombre: "María García" },
    { codigo: "CLI-003", nombre: "Carlos López" },
  ]

  const productosEjemplo = [
    { id: "1", nombre: "Refresco Coca Cola", precio: 50 },
    { id: "2", nombre: "Agua Mineral", precio: 25 },
    { id: "3", nombre: "Sandwich Mixto", precio: 150 },
    { id: "4", nombre: "Café Americano", precio: 75 },
  ]

  const buscarCliente = (codigo: string) => {
    const clienteEncontrado = clientesEjemplo.find((c) => c.codigo === codigo)
    if (clienteEncontrado) {
      setCliente(clienteEncontrado)
    } else {
      setCliente({ codigo, nombre: "" })
    }
  }

  const agregarItem = () => {
    const nuevoItem: FacturaItem = {
      id: Date.now().toString(),
      nombre: "",
      cantidad: 1,
      precio: 0,
      total: 0,
    }
    setItems([...items, nuevoItem])
  }

  const actualizarItem = (id: string, campo: keyof FacturaItem, valor: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const itemActualizado = { ...item, [campo]: valor }
          if (campo === "cantidad" || campo === "precio") {
            itemActualizado.total = itemActualizado.cantidad * itemActualizado.precio
          }
          return itemActualizado
        }
        return item
      }),
    )
  }

  const eliminarItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const calcularSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const numeroFactura = `REC-${String(Date.now()).slice(-3)}`
  const fechaActual = new Date().toLocaleDateString("es-DO")

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Nueva Factura" subtitle="Crear una nueva factura de venta" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/facturas"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Volver a facturas</span>
              </Link>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Calculator size={16} />
                  <span>{showPreview ? "Editar" : "Vista previa"}</span>
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <Save size={16} />
                  <span>Guardar</span>
                </button>
              </div>
            </div>

            {!showPreview ? (
              /* Formulario de edición */
              <div className="space-y-6">
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
                      <input
                        type="text"
                        value={fechaActual}
                        disabled
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Información del cliente */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Código del Cliente</label>
                      <input
                        type="text"
                        value={cliente.codigo}
                        onChange={(e) => buscarCliente(e.target.value)}
                        placeholder="CLI-001"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Cliente</label>
                      <input
                        type="text"
                        value={cliente.nombre}
                        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                        placeholder="Nombre completo"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Artículos */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Artículos</h3>
                    <button onClick={agregarItem} className="btn-primary flex items-center space-x-2">
                      <Plus size={16} />
                      <span>Agregar artículo</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Artículo</label>
                            <select
                              value={item.nombre}
                              onChange={(e) => {
                                const producto = productosEjemplo.find((p) => p.nombre === e.target.value)
                                if (producto) {
                                  actualizarItem(item.id, "nombre", producto.nombre)
                                  actualizarItem(item.id, "precio", producto.precio)
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar artículo</option>
                              {productosEjemplo.map((producto) => (
                                <option key={producto.id} value={producto.nombre}>
                                  {producto.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Cantidad</label>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) =>
                                actualizarItem(item.id, "cantidad", Number.parseInt(e.target.value) || 1)
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Precio Unit.</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.precio}
                              onChange={(e) =>
                                actualizarItem(item.id, "precio", Number.parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Total</label>
                              <p className="text-lg font-semibold text-slate-900">RD${item.total.toFixed(2)}</p>
                            </div>
                            <button
                              onClick={() => eliminarItem(item.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <Package size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No hay artículos agregados</p>
                        <p className="text-sm">Haz clic en "Agregar artículo" para comenzar</p>
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen</h3>
                    <div className="space-y-3">
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
                  <h1 className="text-2xl font-bold text-slate-900">La Rubia</h1>
                  <p className="text-slate-600">Sistema de Facturación</p>
                  <div className="mt-4 p-2 bg-slate-100 rounded-lg inline-block">
                    <p className="font-semibold">Factura: {numeroFactura}</p>
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
                    <p className="text-slate-600">Código: {cliente.codigo || "N/A"}</p>
                    <p className="text-slate-600">Nombre: {cliente.nombre || "N/A"}</p>
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
                            <td className="py-2 text-right font-semibold text-slate-900">RD${item.total.toFixed(2)}</td>
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

                {/* Botón de imprimir solo visible en vista previa */}
                <div className="mt-6 text-center no-print">
                  <button onClick={() => window.print()} className="btn-primary flex items-center space-x-2 mx-auto">
                    <Printer size={16} />
                    <span>Imprimir Factura</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
