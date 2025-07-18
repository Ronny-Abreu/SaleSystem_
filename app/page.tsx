import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { FileText, Users, Package, DollarSign, TrendingUp, Calendar, Plus } from "lucide-react"
import Link from "next/link"

const stats = [
  {
    title: "Facturas Hoy",
    value: "12",
    change: "+2.5%",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Ingresos Hoy",
    value: "RD$15,420",
    change: "+12.3%",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Clientes",
    value: "248",
    change: "+5.2%",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Productos",
    value: "89",
    change: "+1.8%",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

const recentInvoices = [
  { id: "REC-001", client: "Juan Pérez", amount: "RD$1,250", time: "10:30 AM" },
  { id: "REC-002", client: "María García", amount: "RD$850", time: "11:15 AM" },
  { id: "REC-003", client: "Carlos López", amount: "RD$2,100", time: "12:45 PM" },
  { id: "REC-004", client: "Ana Martínez", amount: "RD$675", time: "2:20 PM" },
]

export default function Dashboard() {
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
          </div>
        </main>
      </div>
    </div>
  )
}
