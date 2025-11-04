"use client"

import type React from "react"

import { useState } from "react"
import { User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LoginModalProps {
  isOpen: boolean
}

export function LoginModal({ isOpen }: LoginModalProps) {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Por favor complete todos los campos")
      return
    }

    try {
      setLoading(true)
      setError(null)
      await login(formData.username, formData.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Liquid Glass Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        style={{
          background: 'rgba(0, 0, 0, 0.5)' /* Fondo oscuro y opaco */
        }}
      />

      {/* Modal con efecto liquid glass */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: 'transparent', /* Fondo transparente para mostrar el backdrop */
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `
            0 8px 32px 0 rgba(31, 38, 135, 0.37),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(255, 255, 255, 0.1)
          `
        }}
      >
        <div className="relative p-8">
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 69, 239, 0.3))',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <User className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Iniciar Sesión</h2>
            <p className="text-gray-100 mt-2 drop-shadow-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div 
              className="mb-6 p-4 rounded-lg flex items-center space-x-3 backdrop-blur-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2 drop-shadow-sm">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu usuario"
                  className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-gray-300 backdrop-blur-sm transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2 drop-shadow-sm">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-10 pr-12 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-gray-300 backdrop-blur-sm transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 69, 239, 0.8))',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 15px 0 rgba(99, 102, 241, 0.4)'
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <div className="text-center">
              <p className="text-sm text-gray-200 mb-3 drop-shadow-sm">Usuario de prueba para ver Demo:</p>
              <div className="space-y-2 text-xs text-gray-300">
                {/* <div 
                  className="p-3 rounded-lg backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <strong className="text-white">admin</strong> / SaleSystem (Administrador)
                </div> */}
                <div 
                  className="p-3 rounded-lg backdrop-blur-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <strong className="text-white">Demo</strong> / tareafacil25(Vendedor)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}