"use client"

import { productosApi } from "@/lib/api"
import { useState, useEffect } from "react"
import type { Producto } from "@/lib/types"
import { useAuthenticatedApi } from "./useAuthenticatedApi"

export function useProductos(soloActivos?: boolean) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchProductos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Solo hacer fetch si está autenticado
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      const response = await authenticatedRequest(() => productosApi.getAll(soloActivos))

      if (response.success) {
        // Mapeando los datos para incluir la información de categoría
        const productosConCategoria: Producto[] = response.data.map((item: any): Producto => {

          // Se va a crear el objeto categoria si existe información de categoría
          let categoria = undefined
          if (item.categoria_nombre && item.categoria_id) {
            categoria = {
              id: Number(item.categoria_id),
              nombre: String(item.categoria_nombre),
              color: String(item.categoria_color || "#6B7280"),
              descripcion: String(item.categoria_descripcion || ""),
              activo: true,
              created_at: "",
              updated_at: "",
            }
          }

          const productoMapeado: Producto = {
            id: Number(item.id),
            nombre: String(item.nombre),
            precio: Number(item.precio),
            descripcion: item.descripcion || "",
            stock: Number(item.stock),
            activo: Boolean(item.activo),
            categoria_id: item.categoria_id ? Number(item.categoria_id) : undefined,
            created_at: String(item.created_at),
            updated_at: String(item.updated_at),
            categoria: categoria,
          }

          return productoMapeado
        })


        setProductos(productosConCategoria)
      } else {
        setError(response.message)
        console.error("❌ Error en respuesta API:", response.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const crearProducto = async (producto: Omit<Producto, "id" | "created_at" | "updated_at">) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => productosApi.create(producto))
      if (response.success) {
        await fetchProductos()
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      console.error("❌ Error creando producto:", err)
      throw err
    }
  }

  const actualizarProducto = async (id: number, producto: Partial<Producto>) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => productosApi.update(id, producto))
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
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => productosApi.delete(id))
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
    // Solo hacer fetch cuando la autenticación esté verificada
    if (authChecked) {
      fetchProductos()
    }
  }, [authChecked, isAuthenticated, soloActivos])

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
