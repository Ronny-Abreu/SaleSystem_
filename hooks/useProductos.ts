"use client"

import { productosApi } from "@/lib/api"
import { useState, useEffect } from "react"
import type { Producto } from "@/lib/types"

export function useProductos(soloActivos?: boolean) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProductos = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await productosApi.getAll(soloActivos)

      if (response.success) {
        // Mapeando los datos para incluir la información de categoría con tipos correctos
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
      const response = await productosApi.create(producto)
      if (response.success) {
        await fetchProductos() // Refrescar la lista
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
      const response = await productosApi.update(id, producto)
      if (response.success) {
        await fetchProductos() // Refrescar la lista
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
