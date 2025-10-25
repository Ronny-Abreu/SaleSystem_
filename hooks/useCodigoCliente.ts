"use client"

import { clientesApi } from "@/lib/api"
import { useState, useEffect } from "react"
import { useAuthenticatedApi } from "./useAuthenticatedApi"

export function useCodigoCliente() {
  const [siguienteCodigo, setSiguienteCodigo] = useState("")
  const [loading, setLoading] = useState(true)
  const { authenticatedRequest, isAuthenticated, authChecked } = useAuthenticatedApi()

  const generarSiguienteCodigo = async () => {
    try {
      setLoading(true)
      
      if (!isAuthenticated) {
        setLoading(false)
        return
      }

      const response = await authenticatedRequest(() => clientesApi.getAll())

      if (response.success) {
        const clientes = response.data

        // Encontrar el último número de cliente
        let ultimoNumero = 0
        clientes.forEach((cliente) => {
          const match = cliente.codigo.match(/CLI-(\d+)/)
          if (match) {
            const numero = Number.parseInt(match[1])
            if (numero > ultimoNumero) {
              ultimoNumero = numero
            }
          }
        })

        // Generar el siguiente código
        const siguienteNumero = ultimoNumero + 1
        const codigo = `CLI-${siguienteNumero.toString().padStart(3, "0")}`
        setSiguienteCodigo(codigo)
      }
    } catch (err) {
      console.error("Error generando código:", err)
      setSiguienteCodigo("CLI-001") // Código por defecto
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authChecked) {
      generarSiguienteCodigo()
    }
  }, [authChecked, isAuthenticated])

  return {
    siguienteCodigo,
    loading,
    regenerar: generarSiguienteCodigo,
  }
}
