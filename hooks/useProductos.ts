"use client"

import { productosApi } from "@/lib/api"
import { useState, useEffect, useCallback, useRef } from "react"
import type { Producto } from "@/lib/types"
import { useAuthenticatedApi } from "./useAuthenticatedApi"
import { generateCacheKey, getFromCache, setCache, invalidateCache, getCacheStrategy } from "@/lib/cache"

export function useProductos(soloActivos?: boolean) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const fetchProductos = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      // Solo hacer fetch si está autenticado
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      // Generar clave de cache
      const endpoint = "api/productos.php"
      const cacheKey = generateCacheKey(endpoint, "GET", soloActivos ? { activo: true } : undefined)
      
      if (!forceRefresh) {
        const cached = getFromCache<Producto[]>(cacheKey)
        if (cached) {
          setProductos(cached)
          setLoading(false)

          authenticatedRequest(() => productosApi.getAll(soloActivos))
            .then((response) => {
              if (response.success) {
                const productosConCategoria: Producto[] = response.data.map((item: any): Producto => {
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

                  return {
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
                })
                const ttl = getCacheStrategy(endpoint)
                setCache(cacheKey, productosConCategoria, ttl)
                setProductos(productosConCategoria)
              }
            })
            .catch(() => {
            })
          return
        }
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
        const ttl = getCacheStrategy(endpoint)
        setCache(cacheKey, productosConCategoria, ttl)
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
  }, [isAuthenticated, authenticatedRequest, soloActivos])

  const crearProducto = async (producto: Omit<Producto, "id" | "created_at" | "updated_at">) => {
    try {
      if (!isAuthenticated) throw new Error("Usuario no autenticado")
      const response = await authenticatedRequest(() => productosApi.create(producto))
      if (response.success) {
        invalidateCache("productos.php")
        await fetchProductos(true)
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
        invalidateCache("productos.php")
        await fetchProductos(true)
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
        invalidateCache("productos.php")
        await fetchProductos(true)
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      throw err
    }
  }

  const initializedRef = useRef(false)

  useEffect(() => {
    // Solo hacer fetch cuando la autenticación esté verificada
    if (!authChecked || !isAuthenticated) {
      setLoading(false)
      return
    }

    const endpoint = "api/productos.php"
    const cacheKey = generateCacheKey(endpoint, "GET", soloActivos ? { activo: true } : undefined)
    const cached = getFromCache<Producto[]>(cacheKey)
    
    if (cached && cached.length > 0) {
      setProductos(cached)
      setLoading(false)
      if (!initializedRef.current) {
        initializedRef.current = true
        fetchProductos(false).catch(() => {})
      }
      return
    }

    if (!initializedRef.current) {
      initializedRef.current = true
      fetchProductos(false).catch(() => {})
    }
  }, [authChecked, isAuthenticated, soloActivos])

  useEffect(() => {
    initializedRef.current = false
  }, [soloActivos])

  return {
    productos,
    loading,
    error,
    refetch: () => fetchProductos(true),
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  }
}
