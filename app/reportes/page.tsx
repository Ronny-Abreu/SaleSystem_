"use client"

import { useState, useEffect, useCallback } from "react"
import { DatePicker } from "antd"
import moment from "moment"
import "moment/locale/es"
moment.locale("es")

interface FacturaReporte {
  id: number
  estado: string
  total: number
  fecha: string
}

const Reportes = () => {
  const [mesSeleccionado, setMesSeleccionado] = useState<moment.Moment | null>(moment())
  const [facturas, setFacturas] = useState<FacturaReporte[]>([])

  const fetchReportes = useCallback(async () => {
    if (mesSeleccionado) {
      const fechaInicio = mesSeleccionado.clone().startOf("month").format("YYYY-MM-DD")
      const fechaFin = mesSeleccionado.clone().endOf("month").format("YYYY-MM-DD")

      try {
        const response = await fetch(`/api/facturas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        const facturas: FacturaReporte[] = response.data
        setFacturas(data)
      } catch (error) {
        console.error("Error fetching facturas:", error)
      }
    }
  }, [mesSeleccionado])

  useEffect(() => {
    fetchReportes()
  }, [mesSeleccionado, fetchReportes])

  const facturasPagadas = facturas.filter((f: FacturaReporte) => f.estado === "pagada").length
  const facturasPendientes = facturas.filter((f: FacturaReporte) => f.estado === "pendiente").length
  const totalVentas = facturas
    .filter((f: FacturaReporte) => f.estado === "pagada")
    .reduce((sum: number, f: FacturaReporte) => sum + f.total, 0)

  const handleMonthChange = (date: moment.Moment | null) => {
    setMesSeleccionado(date)
  }

  return (
    <div>
      <h1>Reportes</h1>
      <DatePicker picker="month" value={mesSeleccionado} onChange={handleMonthChange} />
      <div>
        <h2>Resumen del Mes</h2>
        <p>Facturas Pagadas: {facturasPagadas}</p>
        <p>Facturas Pendientes: {facturasPendientes}</p>
        <p>Total de Ventas: {totalVentas}</p>
      </div>
    </div>
  )
}

export default Reportes
