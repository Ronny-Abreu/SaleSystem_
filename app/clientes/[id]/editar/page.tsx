```tsx file="app/productos/page.tsx"
[v0-no-op-code-block-prefix]"use client"

import { useEffect, useState } from "react"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  activo: boolean
  categoria_id?: number
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedido, setPedido] = useState<any>({})
  const [productoAEditar, setProductoAEditar] = useState<any>({})
  const [modalPedido, setModalPedido] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch("/api/productos")
        const resultado = await respuesta.json()
        setProductos(resultado)
      } catch (error) {
        console.log(error)
      }
    }
    obtenerProductos()
  }, [])

  const handleRealizarPedido = (producto: Producto) => {
    setPedido(producto)
    setModalPedido(true)
  }

  const handleEditarProducto = (producto: Producto) => {
    setProductoAEditar(producto)
    setModalEditar(true)
  }

  const handleEliminarProducto = async (producto: Producto) => {
    const confirmar = confirm("¿Estás seguro de que deseas eliminar este producto?")

    if (confirmar) {
      try {
        await fetch(\`/api/productos/${producto.id}`,
  {
    method: "DELETE",
\,
  }
)\

const productosActualizados = productos.filter((productoState) => productoState.id !== producto.id)
setProductos(productosActualizados)
\
      } catch (error)
{
  console.log(error)
}
\
    }\
  }

const cerrarModal = () => {
  setModalPedido(false)
  setModalEditar(false)
}

return (
    <>
      <h1 className="text-4xl font-black">Productos</h1>
      <p className="text-2xl my-10">
        Administra tus Productos y Categorias
      </p>
      {productos?.length === 0 ? (
        <p>No hay productos</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {productos?.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onRealizarPedido={handleRealizarPedido}
              onEditar={handleEditarProducto}
              onEliminar={handleEliminarProducto}
            />
          ))}
        </div>
      )}

      {modalPedido && (
        <ModalPedido pedido={pedido} cerrarModal={cerrarModal} />
      )}
      {modalEditar && (
        <ModalEditar producto={productoAEditar} cerrarModal={cerrarModal} />
      )}
    </>
  )
\
}\

function ProductoCard({
  producto,
  onRealizarPedido,
  onEditar,
  onEliminar,
}: {
  producto: Producto
  onRealizarPedido: (producto: Producto) => void
  onEditar: (producto: Producto) => void
  onEliminar: (producto: Producto) => void
}) {
  const { nombre, precio, descripcion, stock } = producto

  return (
    <div className="border p-3 rounded-md">
      <h3 className="text-lg font-bold">{nombre}</h3>
      <p className="mt-5 font-black text-4xl text-amber-500">{precio}€</p>
      <p className="text-sm mt-3">Stock: {stock}</p>
      <p className="text-sm mt-3">{descripcion}</p>

      <div className="mt-5 flex gap-2">
        <button
          className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold uppercase py-2 px-3 rounded-md"
          onClick={() => onRealizarPedido(producto)}
        >
          Realizar Pedido
        </button>

        <button
          className="bg-yellow-600 hover:bg-yellow-800 text-white font-bold uppercase py-2 px-3 rounded-md"
          onClick={() => onEditar(producto)}
        >
          Editar
        </button>

        <button
          className="bg-red-600 hover:bg-red-800 text-white font-bold uppercase py-2 px-3 rounded-md"
          onClick={() => onEliminar(producto)}
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

const ModalPedido = ({ pedido, cerrarModal }: any) => {
  return (
    <div className="md:flex fixed inset-0 bg-slate-500/70 place-content-center">
      <div className="bg-white p-10 rounded-md">
        <div className="flex justify-end">
          <button onClick={cerrarModal}>X</button>
        </div>
        <h3 className="text-lg font-bold">Deseas realizar el pedido de {pedido.nombre}?</h3>
      </div>
    </div>
  )
}

const ModalEditar = ({ producto, cerrarModal }: any) => {
  return (
    <div className="md:flex fixed inset-0 bg-slate-500/70 place-content-center">
      <div className="bg-white p-10 rounded-md">
        <div className="flex justify-end">
          <button onClick={cerrarModal}>X</button>
        </div>
        <h3 className="text-lg font-bold">Deseas editar el producto {producto.nombre}?</h3>
      </div>
    </div>
  )
}
