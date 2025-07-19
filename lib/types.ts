export interface Cliente {
  id: number
  codigo: string
  nombre: string
  telefono?: string
  email?: string
  direccion?: string
  created_at: string
  updated_at: string
}

export interface Producto {
  id: number
  nombre: string
  precio: number
  descripcion?: string
  stock: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Factura {
  id: number
  numero_factura: string
  cliente_id: number
  fecha: string
  subtotal: number
  total: number
  comentario?: string
  estado: "pagada" | "pendiente" | "anulada"
  created_at: string
  updated_at: string
  cliente?: Cliente
  detalles?: FacturaDetalle[]
}

export interface FacturaDetalle {
  id: number
  factura_id: number
  producto_id: number
  nombre_producto: string
  cantidad: number
  precio_unitario: number
  total_linea: number
  created_at: string
}

export interface Usuario {
  id: number
  username: string
  nombre: string
  email?: string
  rol: "admin" | "vendedor"
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ReporteDiario {
  fecha: string
  total_facturas: number
  total_ingresos: number
  facturas: Factura[]
}
