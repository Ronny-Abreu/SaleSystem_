"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { FileText, Users, Package, DollarSign, TrendingUp, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { useEstadisticas } from "@/hooks/useEstadisticas"
import { useFacturas } from "@/hooks/useFacturas"
import { useClientes } from "@/hooks/useClientes"
import { useProductos } from "@/hooks/useProductos"

export default function Home() {
  const { estadisticas, loading: loadingStats } = useEstadisticas()
  const { facturas, loading: loadingFacturas } = useFacturas({
    fecha_desde: new Date().toISOString().split("T")[0], // Solo hoy
  })
  const { clientes } = useClientes()
  const { productos } = useProductos()

  // Calcular estadísticas
  const stats = [
    {
      title: "Facturas Hoy",
      value: loadingStats ? "..." : estadisticas?.total_facturas.toString() || "0",
      change: "+2.5%",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ingresos Hoy",
      value: loadingStats ? "..." : `RD$${estadisticas?.total_ingresos.toLocaleString() || "0"}`,
      change: "+12.3%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Clientes",
      value: clientes.length.toString(),
      change: "+5.2%",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Productos",
      value: productos.length.toString(),
      change: "+1.8%",
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  // Obtener las facturas más recientes (máximo 4)
  const recentInvoices = facturas.slice(0, 4).map((factura) => ({
    id: factura.numero_factura,
    client: factura.cliente?.nombre || "Cliente desconocido",
    amount: `RD$${factura.total.toLocaleString()}`,
    time: new Date(factura.created_at).toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Resumen de ventas y actividad del día" />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Acciones Rápidas</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/facturas/nueva" className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Plus className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Nueva Factura</h3>
                    <p className="text-sm text-slate-600">Crear una nueva factura</p>
                  </div>
                </div>
              </Link>

              <Link href="/clientes/nuevo" className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Nuevo Cliente</h3>
                    <p className="text-sm text-slate-600">Registrar cliente</p>
                  </div>
                </div>
              </Link>

              <Link href="/productos/nuevo" className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Package className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Nuevo Producto</h3>
                    <p className="text-sm text-slate-600">Agregar producto</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Estadísticas del Día</h2>
              <div className="flex items-center text-sm text-slate-600">
                <Calendar size={16} className="mr-2" />
                {new Date().toLocaleDateString("es-DO", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.title} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp size={14} className="text-green-500 mr-1" />
                          <span className="text-sm text-green-600">{stat.change}</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={stat.color} size={24} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Facturas Recientes</h2>
              <Link href="/facturas" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todas
              </Link>
            </div>

            {loadingFacturas ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-600 mt-2">Cargando facturas...</p>
              </div>
            ) : recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{invoice.id}</p>
                        <p className="text-sm text-slate-600">{invoice.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{invoice.amount}</p>
                      <p className="text-sm text-slate-600">{invoice.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No hay facturas del día de hoy</p>
                <p className="text-sm">Las facturas aparecerán aquí cuando se creen</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
