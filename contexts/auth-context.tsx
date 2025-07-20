"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { buildApiUrl } from "@/lib/config"

interface User {
  id: number
  username: string
  nombre: string
  email?: string
  rol: "admin" | "vendedor"
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch(buildApiUrl("auth.php"), {
        method: "GET",
        credentials: 'include' // Se incluye las cookies de sesión para guardar
      })
      const data = await response.json()

      if (data.success) {
        setUser(data.data)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(buildApiUrl("auth.php"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Se incluye las cookies de sesión para guardar
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.data)
      } else {
        throw new Error(data.message || "Error de autenticación")
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      // Método DELETE para logout y destruir la conexión con ese usuario
      await fetch(buildApiUrl("auth.php"), {
        method: "DELETE",
        credentials: 'include'
      })
      setUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}