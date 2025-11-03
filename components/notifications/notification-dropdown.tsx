"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, Clock, FileText } from "lucide-react"
import { useNotificaciones } from "@/hooks/useNotificaciones"

export function NotificationDropdown() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { notificaciones, cantidadNoLeidas, marcarComoLeida, marcarTodasComoLeidas } = useNotificaciones()

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case "factura_pendiente":
        return <FileText size={16} className="text-yellow-600" />
      default:
        return <Bell size={16} className="text-blue-600" />
    }
  }

  const formatTimeAgo = (fecha: string) => {
    const now = new Date()
    
    let date: Date
    
    if (fecha.includes("T")) {

      date = new Date(fecha)
    } else if (fecha.includes(" ")) {
      const [datePart, timePart] = fecha.split(" ")
      const timeOnly = timePart ? timePart.split(".")[0] : "00:00:00"
      const isoString = `${datePart}T${timeOnly}`
      date = new Date(isoString)
    } else {

      date = new Date(`${fecha}T00:00:00`)
    }
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    // Formateo de la hora de la notificación (segundo, minuto, hora, día)
    const horaFormateada = date.toLocaleTimeString("es-DO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    const diaFormateado = date.toLocaleDateString("es-DO", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    })

    let tiempoTranscurrido = ""
    if (diffInSeconds < 60) {
      tiempoTranscurrido = `hace ${diffInSeconds} segundo${diffInSeconds !== 1 ? "s" : ""}`
    } else if (diffInMinutes < 60) {
      tiempoTranscurrido = `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? "s" : ""}`
    } else if (diffInHours < 24) {
      tiempoTranscurrido = `hace ${diffInHours} hora${diffInHours !== 1 ? "s" : ""}`
    } else if (diffInDays < 7) {
      tiempoTranscurrido = `hace ${diffInDays} día${diffInDays !== 1 ? "s" : ""}`
    } else {
      // Para fechas más antiguas, mostrar la fecha completa
      return `${diaFormateado} ${horaFormateada}`
    }

    return `${tiempoTranscurrido} - ${diaFormateado} ${horaFormateada}`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <Bell size={20} />
        {cantidadNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {cantidadNoLeidas > 9 ? "9+" : cantidadNoLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Notificaciones</h3>
                {cantidadNoLeidas > 0 && (
                  <button
                    onClick={marcarTodasComoLeidas}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <CheckCheck size={14} />
                    <span>Marcar todas</span>
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notificaciones.length > 0 ? (
                notificaciones.map((notificacion) => {
                  const facturaId = notificacion.data?.id || notificacion.id.replace("factura-", "")
                  
                  const handleClick = () => {
                    marcarComoLeida(notificacion.id)
                    setIsOpen(false)
                    if (facturaId && notificacion.tipo === "factura_pendiente") {
                      router.push(`/facturas/${facturaId}`)
                    }
                  }

                  return (
                  <div
                    key={notificacion.id}
                    className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                      !notificacion.leida ? "bg-blue-50" : ""
                    }`}
                    onClick={handleClick}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">{getIconForType(notificacion.tipo)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">{notificacion.titulo}</p>
                          {!notificacion.leida && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{notificacion.mensaje}</p>
                        <p className="text-xs text-slate-400 mt-2 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatTimeAgo(notificacion.fecha)}
                        </p>
                      </div>
                    </div>
                  </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Bell size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>No hay notificaciones</p>
                  <p className="text-sm">Las notificaciones aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
