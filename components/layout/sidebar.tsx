"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Users, Package, BarChart3, Settings, Menu, X, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ConfirmModal } from "@/components/ui/confirm-modal"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: FileText, label: "Facturas", href: "/facturas" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: Package, label: "Productos", href: "/productos" },
  { icon: BarChart3, label: "Reportes", href: "/reportes" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  // Función para manejar el estado del sidebar
  useEffect(() => {
    const event = new CustomEvent('sidebarToggle', { 
      detail: { isOpen } 
    })
    window.dispatchEvent(event)
  }, [isOpen])

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        className={`lg:hidden fixed z-[80] p-2 bg-white rounded-lg shadow-md transition-all duration-300 ${
          isOpen ? 'left-[272px]' : 'left-4'
        }`}
        style={{
          top: `calc(1rem + env(safe-area-inset-top))`,
        }}
      >
        {isOpen ? <X size={24} color="black" /> : <Menu size={24} color="black" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed left-0 right-0 bg-black bg-opacity-50 z-[60]" 
          onClick={() => setIsOpen(false)}
          style={{
            top: 0,
            bottom: 0,
            height: '100dvh',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static left-0 z-[70]
        w-64 bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        style={{
          top: 0,
          bottom: 0,
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LR</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900">SaleSystem</h1>
                <p className="text-sm text-slate-500">La Rubia</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{user?.nombre || 'Usuario'}</p>
                <p className="text-sm text-slate-500 capitalize">{user?.rol || 'Vendedor'}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center space-x-2 w-full px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de confirmación de cerrar sesión */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder al sistema."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        confirmButtonColor="red"
        loading={isLoggingOut}
      />
    </>
  )
}