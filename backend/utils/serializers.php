<?php

/**
 * Clase de serialización para controlar qué datos se exponen en las respuestas de la API
 */
class Serializers {

    public static function serializeFacturaLista($factura) {
        $is_array = is_array($factura);
        
        return array(
            "id" => intval($is_array ? ($factura['id'] ?? 0) : ($factura->id ?? 0)),
            "numero_factura" => $is_array ? ($factura['numero_factura'] ?? '') : ($factura->numero_factura ?? ''),
            "fecha" => $is_array ? ($factura['fecha'] ?? '') : ($factura->fecha ?? ''),
            "total" => floatval($is_array ? ($factura['total'] ?? 0) : ($factura->total ?? 0)),
            "estado" => $is_array ? ($factura['estado'] ?? 'pendiente') : ($factura->estado ?? 'pendiente'),
            "cliente" => array(
                "codigo" => $is_array 
                    ? ($factura['cliente']['codigo'] ?? $factura['cliente_codigo'] ?? '')
                    : ($factura->cliente['codigo'] ?? ''),
                "nombre" => $is_array 
                    ? ($factura['cliente']['nombre'] ?? $factura['cliente_nombre'] ?? '')
                    : ($factura->cliente['nombre'] ?? '')
            )
        );
    }
    

    public static function serializeFacturaCompleta($factura) {
        $factura_data = array(
            "id" => intval($factura->id ?? 0),
            "numero_factura" => $factura->numero_factura ?? '',
            "cliente_id" => intval($factura->cliente_id ?? 0),
            "fecha" => $factura->fecha ?? '',
            "subtotal" => floatval($factura->subtotal ?? 0),
            "total" => floatval($factura->total ?? 0),
            "comentario" => $factura->comentario ?? '',
            "estado" => $factura->estado ?? 'pendiente',
            "created_at" => $factura->created_at ?? '',
            "cliente" => self::serializeClienteBasico($factura->cliente ?? array())
        );
        
        if (isset($factura->detalles) && is_array($factura->detalles)) {
            $factura_data["detalles"] = array_map(function($detalle) {
                return self::serializeFacturaDetalle($detalle);
            }, $factura->detalles);
        }
        
        return $factura_data;
    }
    
    public static function serializeFacturaDetalle($detalle) {
        return array(
            "id" => intval($detalle['id'] ?? $detalle->id ?? 0),
            "factura_id" => intval($detalle['factura_id'] ?? $detalle->factura_id ?? 0),
            "producto_id" => intval($detalle['producto_id'] ?? $detalle->producto_id ?? 0),
            "nombre_producto" => $detalle['nombre_producto'] ?? $detalle->nombre_producto ?? '',
            "cantidad" => intval($detalle['cantidad'] ?? $detalle->cantidad ?? 0),
            "precio_unitario" => floatval($detalle['precio_unitario'] ?? $detalle->precio_unitario ?? 0),
            "total_linea" => floatval($detalle['total_linea'] ?? $detalle->total_linea ?? 0)
        );
    }
    

    public static function serializeClienteBasico($cliente) {
        if (empty($cliente)) {
            return array(
                "codigo" => '',
                "nombre" => ''
            );
        }
        
        return array(
            "codigo" => $cliente['codigo'] ?? $cliente->codigo ?? '',
            "nombre" => $cliente['nombre'] ?? $cliente->nombre ?? ''
        );
    }
    

    public static function serializeClienteCompleto($cliente) {
        return array(
            "id" => intval($cliente->id ?? 0),
            "codigo" => $cliente->codigo ?? '',
            "nombre" => $cliente->nombre ?? '',
            "telefono" => $cliente->telefono ?? '',
            "email" => $cliente->email ?? '',
            "direccion" => $cliente->direccion ?? '',
            "created_at" => $cliente->created_at ?? ''
        );
    }
    

    public static function serializeClienteLista($cliente) {
        return array(
            "id" => intval($cliente['id'] ?? 0),
            "codigo" => $cliente['codigo'] ?? '',
            "nombre" => $cliente['nombre'] ?? ''
        );
    }
    

    public static function serializeProductoLista($producto) {
        return array(
            "id" => intval($producto['id'] ?? 0),
            "nombre" => $producto['nombre'] ?? '',
            "precio" => floatval($producto['precio'] ?? 0),
            "stock" => intval($producto['stock'] ?? 0),
            "activo" => boolval($producto['activo'] ?? false),
            "categoria_nombre" => $producto['categoria_nombre'] ?? null
        );
    }
    

    public static function serializeProductoCompleto($producto) {
        return array(
            "id" => intval($producto->id ?? 0),
            "nombre" => $producto->nombre ?? '',
            "precio" => floatval($producto->precio ?? 0),
            "descripcion" => $producto->descripcion ?? '',
            "stock" => intval($producto->stock ?? 0),
            "activo" => boolval($producto->activo ?? false),
            "categoria_id" => $producto->categoria_id ? intval($producto->categoria_id) : null
        );
    }
    

    public static function serializeFacturasLista($facturas) {
        return array_map(function($factura) {
            return self::serializeFacturaLista($factura);
        }, $facturas);
    }
    

    public static function serializeClientesLista($clientes) {
        return array_map(function($cliente) {
            return self::serializeClienteLista($cliente);
        }, $clientes);
    }
    

    public static function serializeProductosLista($productos) {
        return array_map(function($producto) {
            return self::serializeProductoLista($producto);
        }, $productos);
    }
}

