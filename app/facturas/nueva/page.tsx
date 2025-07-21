"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Producto {
  id: number
  nombre: string
  precio: number
  stock: number
  activo: boolean
}

interface Item {
  producto: Producto
  cantidad: number
}

const FacturaNueva = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [cantidad, setCantidad] = useState<number>(1)
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState<number>(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchProductos()
  }, [])

  useEffect(() => {
    calcularTotal()
  }, [items])

  const fetchProductos = async () => {
    try {
      const response = await fetch("/api/productos")
      const data = await response.json()
      setProductos(data)
    } catch (error) {
      console.error("Error al obtener los productos:", error)
    }
  }

  const handleSelectProducto = (producto: Producto, cantidad: number) => {
    setProductoSeleccionado(producto)
    setCantidad(cantidad)
  }

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCantidad(Number.parseInt(e.target.value))
  }

  const handleRealizarPedido = (producto: Producto) => {
    if (producto.stock < cantidad) {
      toast({
        title: "Error",
        description: "No hay suficiente stock del producto",
      })
      return
    }

    const newItem = {
      producto: producto,
      cantidad: cantidad,
    }

    setItems([...items, newItem])

    toast({
      title: "Éxito",
      description: "Producto agregado al pedido",
    })
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const calcularTotal = () => {
    let newTotal = 0
    items.forEach((item) => {
      newTotal += item.producto.precio * item.cantidad
    })
    setTotal(newTotal)
  }

  const handleConfirmarPedido = async () => {
    try {
      const response = await fetch("/api/facturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: items }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Pedido confirmado",
        })
        setItems([])
      } else {
        toast({
          title: "Error",
          description: "Error al confirmar el pedido",
        })
      }
    } catch (error) {
      console.error("Error al confirmar el pedido:", error)
      toast({
        title: "Error",
        description: "Error al confirmar el pedido",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Nueva Factura</h1>

      <Separator className="mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Productos</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Lista de productos disponibles.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="font-medium">{producto.nombre}</TableCell>
                    <TableCell>{producto.precio}</TableCell>
                    <TableCell>{producto.stock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" onClick={() => handleSelectProducto(producto, 1)}>
                        Seleccionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Detalle del Producto</h2>
          {productoSeleccionado ? (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="text-lg font-semibold">{productoSeleccionado.nombre}</h3>
              <p>Precio: {productoSeleccionado.precio}</p>
              <p>Stock: {productoSeleccionado.stock}</p>
              <div className="mt-4 flex items-center space-x-2">
                <Label htmlFor="cantidad">Cantidad:</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  max={productoSeleccionado.stock}
                  value={cantidad}
                  onChange={handleCantidadChange}
                  className="w-24"
                />
                <Button onClick={() => handleRealizarPedido(productoSeleccionado)}>Agregar al pedido</Button>
              </div>
            </div>
          ) : (
            <p>Seleccione un producto de la lista.</p>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <h2 className="text-xl font-semibold mb-2">Pedido</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Artículos en el pedido actual.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Nombre</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.producto.id}>
                  <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>{item.producto.precio}</TableCell>
                  <TableCell>{item.producto.precio * item.cantidad}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(items.indexOf(item))}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>Total</TableCell>
                <TableCell className="font-bold">{total}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="primary">Confirmar Pedido</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción confirmará el pedido y no se podrá deshacer. Por favor, revisa los artículos antes de
                confirmar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmarPedido}>Continuar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default FacturaNueva
