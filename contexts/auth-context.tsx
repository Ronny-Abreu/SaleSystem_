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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  const checkAuth = async () => {
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
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setUser(null)
    } finally {
      setLoading(false)
      setAuthChecked(true)
    }
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
