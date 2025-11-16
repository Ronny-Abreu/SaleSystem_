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

const STORAGE_KEY = "sale_system_user_session"
const TOKEN_KEY = "sale_system_access_token"
const REFRESH_TOKEN_KEY = "sale_system_refresh_token"

interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

const saveUserToStorage = (user: User, tokens?: AuthTokens): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      if (tokens) {
        localStorage.setItem(TOKEN_KEY, tokens.access_token)
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
      }
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

const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch (error) {
      console.error("Error leyendo token del localStorage:", error)
    }
  }
  return null
}

const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error("Error leyendo refresh token del localStorage:", error)
    }
  }
  return null
}

const clearUserFromStorage = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
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
    const token = getAccessToken()
    
    if (storedUser && token) {
      setUser(storedUser)
      setLoading(false)
      setAuthChecked(true)
      
      try {
        const response = await fetch(buildApiUrl("auth.php"), {
          method: "GET",
          credentials: "include",
          cache: "default",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const user: User = {
              id: data.data.id,
              username: data.data.username,
              nombre: data.data.nombre,
              rol: data.data.rol
            }
            setUser(user)
            saveUserToStorage(user)
          } else {
            setUser(null)
            clearUserFromStorage()
          }
        } else if (response.status === 401) {
          const refreshToken = getRefreshToken()
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(buildApiUrl("auth.php"), {
                method: "PUT",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
              })

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json()
                if (refreshData.success && refreshData.data) {
                  saveUserToStorage(storedUser, refreshData.data)
                  return
                }
              }
            } catch (refreshError) {
              console.error("Error al refrescar token:", refreshError)
            }
          }
          
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

    // Extraer tokens y datos del usuario
    const { access_token, refresh_token, expires_in, ...userData } = data.data
    
    const user: User = {
      id: userData.id,
      username: userData.username,
      nombre: userData.nombre,
      rol: userData.rol
    }

    setUser(user)
    saveUserToStorage(user, {
      access_token,
      refresh_token,
      expires_in
    })
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
