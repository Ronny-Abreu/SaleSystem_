"use client"

import { X, Calculator, FileText } from "lucide-react"
import { useEffect, useState, useMemo } from "react"

interface SimularArqueoModalProps {
  isOpen: boolean
  onClose: () => void
  ventasDelDia: number
  fecha: string
}

export function SimularArqueoModal({
  isOpen,
  onClose,
  ventasDelDia,
  fecha,
}: SimularArqueoModalProps) {
  const [inversionInicial, setInversionInicial] = useState<string>("")
  const [porcentajeDelivery, setPorcentajeDelivery] = useState<string>("7")

  const formatearNumero = (valor: string): string => {
    if (valor === "") return ""
    
    let numeroLimpio = valor.replace(/[^\d.]/g, "")
        if (numeroLimpio === ".") return "."
    
    const partes = numeroLimpio.split(".")
    if (partes.length > 2) {
      numeroLimpio = partes[0] + "." + partes.slice(1).join("")
    }
    
    const parteEntera = partes[0] || ""
    const parteDecimal = partes.length > 1 ? partes[1] : undefined
    
    const parteEnteraFormateada = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    
    if (parteDecimal !== undefined) {
      return `${parteEnteraFormateada}.${parteDecimal}`
    }
    
    return parteEnteraFormateada || ""
  }

  const obtenerValorNumerico = (valor: string): number => {
    const numeroLimpio = valor.replace(/[^\d.]/g, "")
    return parseFloat(numeroLimpio) || 0
  }

  // Calcular arqueo neto
  const arqueoNeto = useMemo(() => {
    const inversion = obtenerValorNumerico(inversionInicial)
    const porcentaje = parseFloat(porcentajeDelivery) || 0
    const montoDelivery = ventasDelDia * (porcentaje / 100)
    return inversion + ventasDelDia - montoDelivery
  }, [inversionInicial, porcentajeDelivery, ventasDelDia])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const handleGenerarPDF = () => {
    const inversion = obtenerValorNumerico(inversionInicial)
    const porcentaje = parseFloat(porcentajeDelivery) || 0
    const montoDelivery = ventasDelDia * (porcentaje / 100)
    const gananciasDelDia = ventasDelDia - montoDelivery
    const arqueo = arqueoNeto

    // Formatear fecha para mostrar
    const fechaFormateada = new Date(fecha + "T00:00:00").toLocaleDateString("es-DO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // HTML para el PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Arqueo del Día - ${fecha}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
              size: A4;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 11pt;
            color: #333;
            background: white;
          }
          .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 28pt;
            color: #1e40af;
            font-weight: bold;
          }
          .header p {
            margin: 8px 0 0 0;
            font-size: 12pt;
            color: #64748b;
          }
          .info-section {
            margin: 25px 0;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 600;
            color: #475569;
            font-size: 11pt;
          }
          .info-value {
            color: #1e293b;
            text-align: right;
            font-size: 11pt;
            font-weight: 500;
          }
          .total-section {
            margin-top: 25px;
            padding: 20px;
            background: #eff6ff;
            border: 2px solid #2563eb;
            border-radius: 8px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16pt;
            font-weight: bold;
            color: #1e40af;
          }
          .formula-section {
            margin-top: 20px;
            padding: 15px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
            font-size: 10pt;
            color: #92400e;
          }
          .formula-section strong {
            display: block;
            margin-bottom: 5px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 9pt;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Simulación de Arqueo</h1>
            <p>${fechaFormateada}</p>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Inversión Inicial:</span>
              <span class="info-value">RD$${inversion.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ventas del Día:</span>
              <span class="info-value">RD$${ventasDelDia.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">% Delivery:</span>
              <span class="info-value">${porcentaje.toFixed(2)}%</span>
            </div>
            <div class="info-row">
              <span class="info-label">Monto Delivery:</span>
              <span class="info-value">RD$${montoDelivery.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ganancias del día:</span>
              <span class="info-value">RD$${gananciasDelDia.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div class="total-section">
            <div class="total-row">
              <span>Arqueo Neto:</span>
              <span>RD$${arqueo.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div class="formula-section">
            <strong>Fórmula aplicada:</strong>
            Arqueo Neto = (Inversión + Ventas del Día) - (Ventas del Día × % Delivery / 100)
          </div>

          <div class="footer">
            <p><strong>SaleSystem</strong> - Sistema de Facturación</p>
            <p>Fecha de generación: ${new Date().toLocaleString("es-DO", { 
              year: "numeric", 
              month: "long", 
              day: "numeric", 
              hour: "2-digit", 
              minute: "2-digit" 
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([html], { type: "text/html;charset=utf-8" })
    const blobUrl = URL.createObjectURL(blob)
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      const link = document.createElement("a")
      link.href = blobUrl
      link.target = "_blank"
      link.rel = "noopener noreferrer"
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 1000)
    } else {
      const printWindow = window.open(blobUrl, "_blank", "noopener,noreferrer")
      
      if (printWindow) {
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 1000)
        
        printWindow.addEventListener("load", () => {
          setTimeout(() => {
            try {
              printWindow.print()
            } catch (e) {
              console.log("Print dialog no disponible")
            }
          }, 500)
        })
      } else {
        alert("Por favor, permite que se abran ventanas emergentes para generar el PDF")
        URL.revokeObjectURL(blobUrl)
      }
    }
  }

  const handleListo = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Calculator className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-slate-900">Simular Arqueo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Inversión inicial */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Inversión inicial
              </label>
              <input
                type="text"
                value={inversionInicial}
                onChange={(e) => {
                  const value = e.target.value
                  // Formatear el número con comas mientras se escribe
                  const valorFormateado = formatearNumero(value)
                  setInversionInicial(valorFormateado)
                }}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Porcentaje Delivery */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                % Delivery
              </label>
              <input
                type="number"
                value={porcentajeDelivery}
                onChange={(e) => {
                  const value = e.target.value
                  // Permitir solo números y punto decimal
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setPorcentajeDelivery(value)
                  }
                }}
                placeholder="7"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            {/* Ventas del día (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ventas del día
              </label>
              <input
                type="text"
                value={`RD$${ventasDelDia.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed text-sm"
              />
            </div>

            {/* Arqueo neto (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Arqueo neto
              </label>
              <input
                type="text"
                value={`RD$${arqueoNeto.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed text-sm font-semibold"
              />
            </div>

            {/* Información adicional */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Fórmula:</strong> Arqueo Neto = (Inversión + Ventas del Día) - (Ventas del Día × % Delivery / 100)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t space-x-2">
          <button
            onClick={handleListo}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            Listo
          </button>
          <button
            onClick={handleGenerarPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>Generar PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}

