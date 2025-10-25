"use client"

import { useAuth } from "@/contexts/auth-context"
import { useCallback } from "react"

// Hook que envuelve las funciones de API para verificar autenticación
export function useAuthenticatedApi() {
  const { isAuthenticated, authChecked } = useAuth()

  const authenticatedRequest = useCallback(async <T>(
    apiFunction: () => Promise<T>
  ): Promise<T> => {

    if (!authChecked) {
      throw new Error("Autenticación pendiente de verificación")
    }

    if (!isAuthenticated) {
      throw new Error("Usuario no autenticado")
    }

    return apiFunction()
  }, [isAuthenticated, authChecked])

  return {
    authenticatedRequest,
    isAuthenticated,
    authChecked
  }
}
