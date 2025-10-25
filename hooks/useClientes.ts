"use client"

import { clientesApi } from "@/lib/api"
import type { Cliente } from "@/lib/types"
import { useState, useEffect } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchClientes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Solo hacer fetch si está autenticado
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      const response = await authenticatedRequest(() => clientesApi.getAll())

      if (response.success) {
        setClientes(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

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

  const crearCliente = async (cliente: Omit<Cliente, "id" | "created_at" | "updated_at">) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => clientesApi.create(cliente))
      if (response.success) {
        await fetchClientes() // Refrescar la lista
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
        await fetchClientes()
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
        await fetchClientes()
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
      fetchClientes()
    }
  }, [authChecked, isAuthenticated])

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
    buscarPorCodigo,
    buscarPorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  }
}
