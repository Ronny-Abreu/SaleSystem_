"use client"

import { productosApi } from "@/lib/api"
import { useState, useEffect } from "react"
import type { Producto } from "@/lib/types"

export function useProductos(soloActivos = true) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProductos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productosApi.getAll(soloActivos)

      if (response.success) {
        setProductos(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const crearProducto = async (producto: Omit<Producto, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await productosApi.create(producto)
      if (response.success) {
        await fetchProductos()
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  const actualizarProducto = async (id: number, producto: Partial<Producto>) => {
    try {
      const response = await productosApi.update(id, producto)
      if (response.success) {
        await fetchProductos()
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  const eliminarProducto = async (id: number) => {
    try {
      const response = await productosApi.delete(id)
      if (response.success) {
        await fetchProductos()
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [soloActivos])

  return {
    productos,
    loading,
    error,
    refetch: fetchProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  }
}
