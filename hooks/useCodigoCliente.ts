"use client"

import { clientesApi } from "@/lib/api"
import { useState, useEffect } from "react"

export function useCodigoCliente() {
  const [siguienteCodigo, setSiguienteCodigo] = useState("")
  const [loading, setLoading] = useState(true)

  const generarSiguienteCodigo = async () => {
    try {
      setLoading(true)
      const response = await clientesApi.getAll()

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
    generarSiguienteCodigo()
  }, [])

  return {
    siguienteCodigo,
    loading,
    regenerar: generarSiguienteCodigo,
  }
}
