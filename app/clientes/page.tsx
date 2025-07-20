"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, Plus, Edit, Trash2, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { useClientes } from "@/hooks/useClientes"

export default function ClientesPage() {
  const { clientes, loading, error } = useClientes()

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Clientes" subtitle="Gestión de clientes registrados" />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header con botones */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Lista de Clientes</h1>
                <p className="text-slate-600">Todos los clientes registrados en el sistema</p>
              </div>
              <Link href="/clientes/nuevo" className="btn-primary flex items-center space-x-2">
                <Plus size={16} />
                <span>Nuevo Cliente</span>
              </Link>
            </div>

            {/* Lista de clientes */}
            <div className="card">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-slate-600 mt-2">Cargando clientes...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error: {error}</p>
                </div>
              ) : clientes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{cliente.nombre}</h3>
                          <p className="text-sm text-slate-600">Código: {cliente.codigo}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded">
                            <Edit size={14} />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        {cliente.telefono && (
                          <div className="flex items-center space-x-2">
                            <Phone size={14} />
                            <span>{cliente.telefono}</span>
                          </div>
                        )}
                        {cliente.email && (
                          <div className="flex items-center space-x-2">
                            <Mail size={14} />
                            <span>{cliente.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          Registrado: {new Date(cliente.created_at).toLocaleDateString("es-DO")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Users size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay clientes registrados</p>
                  <p className="text-sm">Los clientes aparecerán aquí cuando se registren</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
