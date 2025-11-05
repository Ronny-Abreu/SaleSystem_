"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { buildApiUrl } from "@/lib/config"


interface User {
  id: number
  username: string
  nombre: string
  rol: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  authChecked: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Constantes para las claves del localStorage
const STORAGE_KEY = "sale_system_user_session"

const saveUserToStorage = (user: User): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.error("Error guardando sesión en localStorage:", error)
    }
  }
}

const getUserFromStorage = (): User | null => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored) as User
      }
    } catch (error) {
      console.error("Error leyendo sesión del localStorage:", error)
    }
  }
  return null
}

const clearUserFromStorage = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error limpiando sesión del localStorage:", error)
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {     
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const checkAuth = async () => {
    const storedUser = getUserFromStorage()
    if (storedUser) {
      setUser(storedUser)
      setLoading(false)
      setAuthChecked(true)
      
      try {
        const response = await fetch(buildApiUrl("auth.php"), {
          method: "GET",
          credentials: "include",
          cache: "default",
          headers: {
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setUser(data.data)
            saveUserToStorage(data.data)
          } else {
            setUser(null)
            clearUserFromStorage()
          }
        } else if (response.status === 401) {
          setUser(null)
          clearUserFromStorage()
        } else {
          console.warn("Error del servidor al verificar sesión:", response.status)
        }
      } catch (error) {
        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
          console.warn("Error de red al verificar sesión, manteniendo sesión local")
        } else {
          console.error("Error inesperado al verificar sesión:", error)
        }
      }
      return
    }


    setUser(null)
    setLoading(false)
    setAuthChecked(true)
  }

  const login = async (username: string, password: string) => {
    const response = await fetch(buildApiUrl("auth.php"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Error de autenticación")
    }

    setUser(data.data)
    saveUserToStorage(data.data)
  }

  const logout = async () => {
    try {
      await fetch(buildApiUrl("auth.php"), {
        method: "DELETE",
        credentials: "include",
      })
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setUser(null)
      clearUserFromStorage()
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    authChecked,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>  
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
