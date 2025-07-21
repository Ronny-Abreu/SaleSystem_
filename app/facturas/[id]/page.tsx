"use client"

import { FacturaForm } from "@/components/facturas/FacturaForm"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState, useCallback } from "react"

interface Factura {
  id: string
  cliente: string
  concepto: string
  fecha: string
  importe: number
}

interface Params {
  id: string
}

export default function Page({ params }: { params: Params }) {
  const [factura, setFactura] = useState<Factura | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFactura = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/facturas/${params.id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setFactura(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchFactura()
  }, [params.id, fetchFactura])

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!factura) {
    return <div>Factura no encontrada</div>
  }

  return (
    <div>
      <h1>Factura</h1>
      <Separator />
      <FacturaForm factura={factura} />
    </div>
  )
}
