"use client"

import { useCodigoCliente } from "@/hooks/useCodigoCliente"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  codigo: z.string().min(2, {
    message: "El código debe tener al menos 2 caracteres.",
  }),
  nombre: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  cuit: z.string().min(2, {
    message: "El CUIT debe tener al menos 2 caracteres.",
  }),
})

export default function ClienteNuevoPage() {
  const { siguienteCodigo } = useCodigoCliente()
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    cuit: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      cuit: "",
    },
  })

  useEffect(() => {
    if (siguienteCodigo && !formData.codigo) {
      setFormData((prev) => ({ ...prev, codigo: siguienteCodigo }))
    }
  }, [siguienteCodigo, formData.codigo])

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        toast({
          title: "Cliente creado correctamente",
        })
        router.push("/clientes")
      })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Nuevo Cliente</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-1/2">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Código" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cuit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUIT</FormLabel>
                <FormControl>
                  <Input placeholder="CUIT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Crear Cliente</Button>
        </form>
      </Form>
    </div>
  )
}
