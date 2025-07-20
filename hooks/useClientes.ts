"use client"

import { clientesApi } from "@/lib/api"
import type { Cliente } from "@/lib/types"
import { useState, useEffect } from "react"

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await clientesApi.getAll()

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
      const response = await clientesApi.getByCodigo(codigo)
      return response.success ? response.data : null
    } catch (err) {
      console.error("Error buscando cliente:", err)
      return null
    }
  }

  const crearCliente = async (cliente: Omit<Cliente, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await clientesApi.create(cliente)
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

  const actualizarCliente = async (id: number, cliente: Partial<Cliente>) => {
    try {
      const response = await clientesApi.update(id, cliente)
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
      const response = await clientesApi.delete(id)
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
    fetchClientes()
  }, [])

  return {
    clientes,
    loading,
    error,
    refetch: fetchClientes,
    buscarPorCodigo,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
  }
}
