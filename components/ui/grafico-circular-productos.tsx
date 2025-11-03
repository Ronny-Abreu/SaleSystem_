// Componente de gráfico circular para productos
export function GraficoCircularProductos({
  productos,
}: {
  productos: Array<{ producto_id: number; nombre: string; cantidadTotal: number; stock: number }>
}) {
  const totalCantidad = productos.reduce((sum, p) => sum + p.cantidadTotal, 0)
  const radio = 50
  const circunferencia = 2 * Math.PI * radio

  if (productos.length === 0 || totalCantidad === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-40 h-40 mb-4">
          <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle cx="80" cy="80" r={radio} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-slate-500">Sin datos</p>
          </div>
        </div>
      </div>
    )
  }

  const colores = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
  let offsetAcumulado = 0

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-48 h-48 mb-6">
        <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
          {/* Círculo base */}
          <circle cx="96" cy="96" r={radio} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          {/* Segmentos de productos */}
          {productos.map((producto, index) => {
            const porcentaje = (producto.cantidadTotal / totalCantidad) * 100
            const longitud = (porcentaje / 100) * circunferencia
            const offsetInicial = circunferencia - offsetAcumulado - longitud
            offsetAcumulado += longitud

            return (
              <circle
                key={producto.producto_id}
                cx="96"
                cy="96"
                r={radio}
                fill="none"
                stroke={colores[index % colores.length]}
                strokeWidth="12"
                strokeDasharray={`${longitud} ${circunferencia}`}
                strokeDashoffset={offsetInicial}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            )
          })}
        </svg>
        {/* Texto central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{totalCantidad}</p>
            <p className="text-xs text-slate-500">Unidades</p>
          </div>
        </div>
      </div>
    </div>
  )
}

