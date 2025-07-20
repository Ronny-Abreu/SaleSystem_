"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Calendar, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { clientesApi } from "@/lib/api"
import type { Cliente } from "@/lib/types"

export default function ClientesDelDia() {
  const [clientesHoy, setClientesHoy] = useState<Cliente[]>([])
  const [todosClientes, setTodosClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vistaActual, setVistaActual] = useState<"hoy" | "todos">("hoy")

  const fetchClientes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await clientesApi.getAll()

      if (response.success) {
        const hoy = new Date().toISOString().split("T")[0]

        // Filtrar clientes creados hoy
        const clientesDeHoy = response.data.filter((cliente: Cliente) => {
          const fechaCreacion = new Date(cliente.created_at).toISOString().split("T")[0]
          return fechaCreacion === hoy
        })

        setClientesHoy(clientesDeHoy)
        setTodosClientes(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const clientesAMostrar = vistaActual === "hoy" ? clientesHoy : todosClientes

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clientes del Día" subtitle="Comparación de clientes nuevos vs todos los clientes" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/clientes"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Volver a clientes</span>
              </Link>

              <div className="flex space-x-3">
                <button
                  onClick={() => setVistaActual("hoy")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    vistaActual === "hoy" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Calendar size={16} />
                  <span>Clientes de Hoy</span>
                </button>
                <button
                  onClick={() => setVistaActual("todos")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    vistaActual === "todos" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Users size={16} />
                  <span>Todos los Clientes</span>
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Clientes de Hoy</p>
                    <p className="text-2xl font-bold text-blue-600">{clientesHoy.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total de Clientes</p>
                    <p className="text-2xl font-bold text-green-600">{todosClientes.length}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Crecimiento Hoy</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {todosClientes.length > 0
                        ? `${((clientesHoy.length / todosClientes.length) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de clientes */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {vistaActual === "hoy" ? "Clientes Registrados Hoy" : "Todos los Clientes"}
                </h2>
                <span className="text-sm text-slate-500">
                  {clientesAMostrar.length} cliente{clientesAMostrar.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-600 mt-2">Cargando clientes...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error: {error}</p>
                </div>
              ) : clientesAMostrar.length > 0 ? (
                <>
                  {/* Vista desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Código</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Nombre</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Teléfono</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Registro</th>
                          {vistaActual === "hoy" && (
                            <th className="text-center py-3 px-4 font-semibold text-slate-700">Estado</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {clientesAMostrar.map((cliente) => (
                          <tr key={cliente.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium text-slate-900">{cliente.codigo}</td>
                            <td className="py-3 px-4 text-slate-900">{cliente.nombre}</td>
                            <td className="py-3 px-4 text-slate-600">{cliente.telefono || "N/A"}</td>
                            <td className="py-3 px-4 text-slate-600">{cliente.email || "N/A"}</td>
                            <td className="py-3 px-4 text-slate-600">
                              {new Date(cliente.created_at).toLocaleDateString("es-DO")}
                            </td>
                            {vistaActual === "hoy" && (
                              <td className="py-3 px-4 text-center">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Nuevo
                                </span>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista móvil */}
                  <div className="md:hidden space-y-4">
                    {clientesAMostrar.map((cliente) => (
                      <div key={cliente.id} className="p-4 border border-slate-200 rounded-lg bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{cliente.nombre}</span>
                          {vistaActual === "hoy" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Nuevo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1">Código: {cliente.codigo}</p>
                        <p className="text-sm text-slate-600 mb-1">Teléfono: {cliente.telefono || "N/A"}</p>
                        <p className="text-sm text-slate-600 mb-3">Email: {cliente.email || "N/A"}</p>
                        <p className="text-xs text-slate-400">
                          Registrado: {new Date(cliente.created_at).toLocaleDateString("es-DO")}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Users size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>{vistaActual === "hoy" ? "No hay clientes registrados hoy" : "No hay clientes registrados"}</p>
                  <p className="text-sm">
                    {vistaActual === "hoy"
                      ? "Los clientes registrados hoy aparecerán aquí"
                      : "Los clientes aparecerán aquí cuando se registren"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
