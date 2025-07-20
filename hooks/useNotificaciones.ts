"use client"

import { facturasApi } from "@/lib/api"
import { useState, useEffect } from "react"

export interface Notificacion {
  id: string
  tipo: "factura_pendiente" | "stock_bajo" | "cliente_nuevo"
  titulo: string
  mensaje: string
  fecha: string
  leida: boolean
  data?: any
}

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0)

  const fetchNotificaciones = async () => {
    try {
      setLoading(true)

      // Obtener facturas pendientes
      const facturasPendientes = await facturasApi.getAll({ estado: "pendiente" })

      const notificacionesFacturas: Notificacion[] = facturasPendientes.success
        ? facturasPendientes.data.map((factura: any) => ({
            id: `factura-${factura.id}`,
            tipo: "factura_pendiente" as const,
            titulo: "Factura Pendiente",
            mensaje: `Factura ${factura.numero_factura} de ${factura.cliente?.nombre || "Cliente"} está pendiente de pago`,
            fecha: factura.fecha,
            leida: false,
            data: factura,
          }))
        : []

      setNotificaciones(notificacionesFacturas)
      setCantidadNoLeidas(notificacionesFacturas.filter((n) => !n.leida).length)
    } catch (error) {
      console.error("Error al cargar notificaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeida = (id: string) => {
    setNotificaciones((prev) => prev.map((notif) => (notif.id === id ? { ...notif, leida: true } : notif)))
    setCantidadNoLeidas((prev) => Math.max(0, prev - 1))
  }

  const marcarTodasComoLeidas = () => {
    setNotificaciones((prev) => prev.map((notif) => ({ ...notif, leida: true })))
    setCantidadNoLeidas(0)
  }

  useEffect(() => {
    fetchNotificaciones()

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchNotificaciones, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    notificaciones,
    loading,
    cantidadNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    refetch: fetchNotificaciones,
  }
}
