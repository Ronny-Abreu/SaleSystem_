"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Calendar, ArrowLeft, ArrowLeftRight } from "lucide-react"
import Link from "next/link"
import { facturasApi, clientesApi } from "@/lib/api"
import type { Cliente, Factura } from "@/lib/types"
import { useAuthenticatedApi } from "@/hooks/useAuthenticatedApi"

export default function ClientesDelDia() {
  const [clientesQueCompraronHoy, setClientesQueCompraronHoy] = useState<Cliente[]>([])
  const [clientesQueCompraronAyer, setClientesQueCompraronAyer] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mostrarGrafico, setMostrarGrafico] = useState(false)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchClientesQueCompraronHoy = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      const hoy = new Date().toISOString().split("T")[0]
      const ayer = new Date()
      ayer.setDate(ayer.getDate() - 1)
      const fechaAyer = ayer.toISOString().split("T")[0]

      // Obtener facturas del día de hoy
      const responseFacturas = await authenticatedRequest(() =>
        facturasApi.getAll({
          fecha_desde: hoy,
          fecha_hasta: hoy,
        }),
      )

      // Obtener facturas de ayer para comparación
      const responseFacturasAyer = await authenticatedRequest(() =>
        facturasApi.getAll({
          fecha_desde: fechaAyer,
          fecha_hasta: fechaAyer,
        }),
      )

      // Calcular clientes únicos de ayer
      if (responseFacturasAyer.success) {
        const facturasAyer: Factura[] = responseFacturasAyer.data
        const clientesAyerSet = new Set<number>()
        facturasAyer.forEach((factura: Factura) => {
          if (factura.cliente_id) {
            clientesAyerSet.add(factura.cliente_id)
          }
        })
        setClientesQueCompraronAyer(clientesAyerSet.size)
      }

      if (responseFacturas.success) {
        const facturas: Factura[] = responseFacturas.data

        // Obtener IDs únicos de clientes que compraron hoy
        const clientesIdsSet = new Set<number>()
        facturas.forEach((factura) => {
          if (factura.cliente_id) {
            clientesIdsSet.add(factura.cliente_id)
          }
        })

        // Obtener todos los clientes para luego filtrar
        const responseClientes = await authenticatedRequest(() => clientesApi.getAll())

        if (responseClientes.success) {
          // Filtrar solo los clientes que compraron hoy
          const clientesFiltrados = responseClientes.data.filter((cliente: Cliente) =>
            clientesIdsSet.has(cliente.id),
          )

          // Ordenar por fecha de última factura (más reciente primero)
          const clientesConFecha = clientesFiltrados.map((cliente: Cliente) => {
            const facturasDelCliente = facturas.filter((f) => f.cliente_id === cliente.id)
            const ultimaFactura = facturasDelCliente.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )[0]
            return {
              cliente,
              fechaUltimaCompra: ultimaFactura ? new Date(ultimaFactura.created_at) : new Date(0),
            }
          })

          clientesConFecha.sort(
            (a, b) => b.fechaUltimaCompra.getTime() - a.fechaUltimaCompra.getTime(),
          )

          setClientesQueCompraronHoy(clientesConFecha.map((item) => item.cliente))
        }
      } else {
        setError(responseFacturas.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authChecked) {
      fetchClientesQueCompraronHoy()
    }
  }, [authChecked, isAuthenticated])

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clientes del Día" subtitle="Clientes que realizaron compras hoy" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Título y fecha */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
                Clientes que Compraron Hoy
              </h1>
              <p className="text-sm md:text-base text-slate-600">
                {new Date().toLocaleDateString("es-DO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Layout dinámico: gráfico y lista lado a lado en pantallas grandes cuando se muestra el gráfico */}
            <div
              className={`grid gap-6 transition-all duration-500 ease-in-out ${
                mostrarGrafico
                  ? "grid-cols-1 lg:grid-cols-2 mb-6"
                  : "grid-cols-1 mb-6"
              }`}
            >
              {/* Card de gráfico */}
              <div
                className={`card transition-all duration-500 ease-in-out ${
                  mostrarGrafico ? "lg:sticky lg:top-6 lg:self-start" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-600">Comparación con el día de ayer</p>
                      <button
                        onClick={() => setMostrarGrafico(!mostrarGrafico)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title={mostrarGrafico ? "Ocultar gráfico" : "Mostrar gráfico"}
                      >
                        <ArrowLeftRight
                          size={20}
                          className={`text-green-600 ${mostrarGrafico ? "text-green-700" : ""}`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {mostrarGrafico
                        ? "Gráfico de comparación"
                        : "Pulsa el botón de la derecha para ver gráfico"}
                    </p>
                  </div>
                </div>

                {/* Gráfico circular */}
                {mostrarGrafico && (
                  <div className="mt-4 pt-4 border-t border-slate-200 animate-fade-in">
                    <GraficoCircular
                      clientesHoy={clientesQueCompraronHoy.length}
                      clientesAyer={clientesQueCompraronAyer}
                    />
                  </div>
                )}
              </div>

              {/* Lista de clientes */}
              <div
                className={`card transition-all duration-500 ease-in-out ${
                  mostrarGrafico ? "lg:translate-x-0" : ""
                }`}
              >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Lista de Clientes</h2>
                <span className="text-sm text-slate-500">
                  {clientesQueCompraronHoy.length} cliente{clientesQueCompraronHoy.length !== 1 ? "s" : ""}
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
              ) : clientesQueCompraronHoy.length > 0 ? (
                <>
                  {/* Vista desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Código</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Nombre</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Teléfono</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientesQueCompraronHoy.map((cliente: Cliente) => (
                          <tr key={cliente.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium text-slate-900">{cliente.codigo}</td>
                            <td className="py-3 px-4 text-slate-900">
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-slate-400 flex-shrink-0" />
                                <span>{cliente.nombre}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{cliente.telefono || "N/A"}</td>
                            <td className="py-3 px-4">
                              <Link
                                href={`/clientes/${cliente.id}?fromClientesHoy=true`}
                                className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
                              >
                                Ver detalles
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Vista móvil */}
                  <div className="md:hidden space-y-4">
                    {clientesQueCompraronHoy.map((cliente: Cliente) => (
                      <Link
                        key={cliente.id}
                        href={`/clientes/${cliente.id}?fromClientesHoy=true`}
                        className="block p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors relative"
                      >
                        <div className="absolute right-4 top-4">
                          <Users size={20} className="text-slate-300" />
                        </div>
                        <div className="flex items-center justify-between mb-2 pr-8">
                          <span className="font-medium text-slate-900">{cliente.nombre}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">Código: {cliente.codigo}</p>
                        <p className="text-sm text-slate-600 mb-1">Teléfono: {cliente.telefono || "N/A"}</p>
                        <p className="text-sm text-slate-600 mb-2">Email: {cliente.email || "N/A"}</p>
                        <p className="text-xs text-blue-600 font-medium">Toca para ver detalles →</p>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Users size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay clientes que hayan comprado hoy</p>
                  <p className="text-sm">Los clientes aparecerán aquí cuando realicen compras</p>
                </div>
              )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// Componente de gráfico circular
function GraficoCircular({ clientesHoy, clientesAyer }: { clientesHoy: number; clientesAyer: number }) {
  const total = clientesHoy + clientesAyer
  const porcentajeHoy = total > 0 ? (clientesHoy / total) * 100 : 0
  const porcentajeAyer = total > 0 ? (clientesAyer / total) * 100 : 0

  // Calcular ángulos para el gráfico circular
  const radio = 60
  const circunferencia = 2 * Math.PI * radio
  const longitudAyer = (porcentajeAyer / 100) * circunferencia
  const longitudHoy = (porcentajeHoy / 100) * circunferencia
  const offsetAyer = circunferencia - longitudAyer
  const offsetHoy = circunferencia - longitudHoy

  // Si no hay datos, mostrar círculo vacío
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-48 h-48 mb-6">
          <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radio}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="16"
              className="text-slate-200"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-500">Sin datos</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-48 h-48 mb-6">
        <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
          {/* Círculo base gris */}
          <circle
            cx="96"
            cy="96"
            r={radio}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            className="text-slate-200"
          />
          {/* Segmento de ayer (gris) - desde el inicio */}
          {clientesAyer > 0 && (
            <circle
              cx="96"
              cy="96"
              r={radio}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="16"
              strokeDasharray={`${longitudAyer} ${circunferencia}`}
              strokeDashoffset={circunferencia - longitudAyer}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
          {/* Segmento de hoy (azul) - después de ayer */}
          {clientesHoy > 0 && (
            <circle
              cx="96"
              cy="96"
              r={radio}
              fill="none"
              stroke="#2563eb"
              strokeWidth="16"
              strokeDasharray={`${longitudHoy} ${circunferencia}`}
              strokeDashoffset={circunferencia - longitudHoy - longitudAyer}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
        </svg>
        {/* Texto central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">Hoy</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{clientesHoy}</p>
            <p className="text-xs text-slate-500">{porcentajeHoy.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
            <span className="text-sm font-medium text-slate-700">Ayer</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{clientesAyer}</p>
            <p className="text-xs text-slate-500">{porcentajeAyer.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
