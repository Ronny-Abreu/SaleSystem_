"use client"

import { clientesApi } from "@/lib/api"
import type { Cliente } from "@/lib/types"
import { useState, useEffect, useCallback } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"
import { generateCacheKey, getFromCache, setCache, invalidateCache, getCacheStrategy } from "@/lib/cache"

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchClientes = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Solo hacer fetch si está autenticado
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      // Generar clave de cache
      const endpoint = "api/clientes.php"
      const cacheKey = generateCacheKey(endpoint, "GET")
      
      if (!forceRefresh) {
        const cached = getFromCache<Cliente[]>(cacheKey)
        if (cached) {
          setClientes(cached)
          setLoading(false)

          authenticatedRequest(() => clientesApi.getAll())
            .then((response) => {
              if (response.success) {
                const ttl = getCacheStrategy(endpoint)
                setCache(cacheKey, response.data, ttl)
                setClientes(response.data)
              }
            })
            .catch(() => {
            })
          return
        }
      }

      const response = await authenticatedRequest(() => clientesApi.getAll())

      if (response.success) {
        setClientes(response.data)
        const ttl = getCacheStrategy(endpoint)
        setCache(cacheKey, response.data, ttl)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, authenticatedRequest])

  const buscarPorCodigo = async (codigo: string): Promise<Cliente | null> => {
    try {
      if (!isAuthenticated) return null
      const response = await authenticatedRequest(() => clientesApi.getByCodigo(codigo))
      return response.success ? response.data : null
    } catch (err) {
      console.error("Error buscando cliente:", err)
      return null
    }
  }

  const buscarPorId = async (id: number): Promise<Cliente | null> => {
    try {
      if (!isAuthenticated) return null
      const response = await authenticatedRequest(() => clientesApi.getById(id))
      return response.success ? response.data : null
    } catch (err) {
      console.error("Error buscando cliente:", err)
      return null
    }
  }

  const verificarEmailExistente = async (email: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !email.trim()) return false
      const response = await authenticatedRequest(() => clientesApi.verificarEmailExistente(email))
      return response.success && response.data !== null
    } catch (err) {
      return false
    }
  }

  const verificarTelefonoExistente = async (telefono: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !telefono.trim()) return false
      const response = await authenticatedRequest(() => clientesApi.verificarTelefonoExistente(telefono))
      return response.success && response.data !== null
    } catch (err) {
      return false
    }
  }

  const verificarNombreExistente = async (nombre: string): Promise<boolean> => {
    try {
      if (!isAuthenticated || !nombre.trim()) return false
      const response = await authenticatedRequest(() => clientesApi.verificarNombreExistente(nombre))
      return response.success && response.data !== null
    } catch (err) {
      return false
    }
  }

  const crearCliente = async (cliente: { nombre: string; telefono?: string; email?: string; direccion?: string; codigo?: string }) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => clientesApi.create(cliente))
      if (response.success) {
        invalidateCache("clientes.php")
        await fetchClientes(true)
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  const actualizarCliente = async (id: number, cliente: Partial<Cliente>) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => clientesApi.update(id, cliente))
      if (response.success) {
        invalidateCache("clientes.php")
        await fetchClientes(true)
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  const eliminarCliente = async (id: number) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => clientesApi.delete(id))
      if (response.success) {
        invalidateCache("clientes.php")
        await fetchClientes(true)
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    // Solo hacer fetch cuando la autenticación esté verificada
    if (authChecked) {
      fetchClientes(false)
    }
  }, [authChecked, isAuthenticated, fetchClientes])

  return {
    clientes,
    loading,
    error,
    refetch: () => fetchClientes(true),
    buscarPorCodigo,
    buscarPorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    verificarEmailExistente,
    verificarTelefonoExistente,
    verificarNombreExistente,
  }
}
