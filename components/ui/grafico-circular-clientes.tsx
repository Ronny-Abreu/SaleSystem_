"use client"

interface GraficoCircularProps {
  clientesHoy: number
  clientesAyer: number
  onFiltroChange: (filtro: "hoy" | "ayer") => void
  filtroActual: "hoy" | "ayer"
}

export function GraficoCircular({
  clientesHoy,
  clientesAyer,
  onFiltroChange,
  filtroActual,
}: GraficoCircularProps) {
  const total = clientesHoy + clientesAyer
  const porcentajeHoy = total > 0 ? (clientesHoy / total) * 100 : 0
  const porcentajeAyer = total > 0 ? (clientesAyer / total) * 100 : 0

  // Calcular ángulos para el gráfico circular
  const radio = 60
  const circunferencia = 2 * Math.PI * radio
  const longitudAyer = (porcentajeAyer / 100) * circunferencia
  const longitudHoy = (porcentajeHoy / 100) * circunferencia
  const offsetAyer = circunferencia - longitudAyer
  const offsetHoy = circunferencia - longitudHoy

  // Si no hay datos, mostrar círculo vacío
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-48 h-48 mb-6">
          <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radio}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="16"
              className="text-slate-200"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">0</p>
              <p className="text-xs text-slate-500">Sin datos</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-48 h-48 mb-6">
        <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
          {/* Círculo base gris */}
          <circle
            cx="96"
            cy="96"
            r={radio}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            className="text-slate-200"
          />
          {/* Segmento de ayer (gris) - desde el inicio */}
          {clientesAyer > 0 && (
            <circle
              cx="96"
              cy="96"
              r={radio}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="16"
              strokeDasharray={`${longitudAyer} ${circunferencia}`}
              strokeDashoffset={circunferencia - longitudAyer}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
          {/* Segmento de hoy (azul) - después de ayer */}
          {clientesHoy > 0 && (
            <circle
              cx="96"
              cy="96"
              r={radio}
              fill="none"
              stroke="#2563eb"
              strokeWidth="16"
              strokeDasharray={`${longitudHoy} ${circunferencia}`}
              strokeDashoffset={circunferencia - longitudHoy - longitudAyer}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}
        </svg>
        {/* Texto central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="w-full space-y-3">
        <button
          onClick={() => onFiltroChange("hoy")}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
            filtroActual === "hoy"
              ? "bg-blue-600 text-white shadow-md scale-105"
              : "bg-blue-50 hover:bg-blue-100 cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full ${filtroActual === "hoy" ? "bg-white" : "bg-blue-600"}`}
            ></div>
            <span className={`text-sm font-medium ${filtroActual === "hoy" ? "text-white" : "text-slate-700"}`}>
              Hoy
            </span>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${filtroActual === "hoy" ? "text-white" : "text-slate-900"}`}>
              {clientesHoy}
            </p>
            <p className={`text-xs ${filtroActual === "hoy" ? "text-blue-100" : "text-slate-500"}`}>
              {porcentajeHoy.toFixed(1)}%
            </p>
          </div>
        </button>
        <button
          onClick={() => onFiltroChange("ayer")}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
            filtroActual === "ayer"
              ? "bg-slate-600 text-white shadow-md scale-105"
              : "bg-slate-100 hover:bg-slate-200 cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded-full ${filtroActual === "ayer" ? "bg-white" : "bg-slate-400"}`}
            ></div>
            <span className={`text-sm font-medium ${filtroActual === "ayer" ? "text-white" : "text-slate-700"}`}>
              Ayer
            </span>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${filtroActual === "ayer" ? "text-white" : "text-slate-900"}`}>
              {clientesAyer}
            </p>
            <p className={`text-xs ${filtroActual === "ayer" ? "text-slate-200" : "text-slate-500"}`}>
              {porcentajeAyer.toFixed(1)}%
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

