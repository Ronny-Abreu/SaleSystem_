<?php
if (!ob_get_level()) {
    ob_start();
}
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once '../config/env.php';
require_once '../auth/middleware.php';

if (ob_get_level()) {
    ob_clean();
}
authorizeRequest();

require_once '../utils/response.php';
require_once '../utils/serializers.php';
require_once '../config/database.php';
require_once '../models/Producto.php';

$database = new Database();
$db = $database->getConnection();
$producto = new Producto($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if(isset($_GET['id'])) {
                $id = $_GET['id'];
                if($producto->findById($id)) {
                    $producto_data = Serializers::serializeProductoCompleto($producto);
                    ApiResponse::success($producto_data, "Producto encontrado");
                } else {
                    ApiResponse::notFound("Producto no encontrado");
                }
            } else {
                // Obtener productos con filtros
                $filtro_activos = null;
                
                if(isset($_GET['activos'])) {
                    if($_GET['activos'] === 'true') {
                        $filtro_activos = true;
                    } elseif($_GET['activos'] === 'false') {
                        $filtro_activos = false;
                    }
                }
                
                $stmt = $producto->read($filtro_activos);
                $productos_raw = array();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $productos_raw[] = $row;
                }
                
                $productos = Serializers::serializeProductosLista($productos_raw);
                
                $mensaje = "Productos obtenidos exitosamente";
                if($filtro_activos === true) {
                    $mensaje = "Productos activos obtenidos exitosamente";
                } elseif($filtro_activos === false) {
                    $mensaje = "Productos inactivos obtenidos exitosamente";
                }
                
                ApiResponse::success($productos, $mensaje);
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if(!$data) {
                ApiResponse::badRequest("Datos JSON inválidos");
            }
            
            $producto->nombre = $data->nombre ?? '';
            $producto->precio = $data->precio ?? 0;
            $producto->descripcion = $data->descripcion ?? '';
            $producto->stock = $data->stock ?? 0;
            $producto->activo = $data->activo ?? true;
            $producto->categoria_id = $data->categoria_id ?? null;
            
            $producto->validate();
            
            if($producto->create()) {
                $producto_data = Serializers::serializeProductoCompleto($producto);
                ApiResponse::success($producto_data, "Producto creado exitosamente", 201);
            } else {
                ApiResponse::error("Error al crear el producto");
            }
            break;
            
        case 'PUT':
            if(!isset($_GET['id'])) {
                ApiResponse::badRequest("ID del producto requerido");
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if(!$data) {
                ApiResponse::badRequest("Datos JSON inválidos");
            }
            
            $producto->id = $_GET['id'];
            
            if(!$producto->findById($producto->id)) {
                ApiResponse::notFound("Producto no encontrado");
            }
            
            // Actualizar solo los campos especificos
            $producto->nombre = $data->nombre ?? $producto->nombre;
            $producto->precio = $data->precio ?? $producto->precio;
            $producto->descripcion = $data->descripcion ?? $producto->descripcion;
            $producto->stock = $data->stock ?? $producto->stock;
            $producto->activo = isset($data->activo) ? $data->activo : $producto->activo;
            $producto->categoria_id = isset($data->categoria_id) ? $data->categoria_id : $producto->categoria_id;
            
            $producto->validate();
            
            if($producto->update()) {
                $producto_data = Serializers::serializeProductoCompleto($producto);
                ApiResponse::success($producto_data, "Producto actualizado exitosamente");
            } else {
                ApiResponse::error("Error al actualizar el producto");
            }
            break;
            
        case 'DELETE':
            if(!isset($_GET['id'])) {
                ApiResponse::badRequest("ID del producto requerido");
            }
            
            $producto->id = $_GET['id'];
            
            if(!$producto->findById($producto->id)) {
                ApiResponse::notFound("Producto no encontrado");
            }
            
            if($producto->delete()) {
                ApiResponse::success(null, "Producto desactivado exitosamente");
            } else {
                ApiResponse::error("Error al desactivar el producto");
            }
            break;
            
        default:
            ApiResponse::error("Método no permitido", 405);
            break;
    }
    
} catch (Exception $e) {
    ApiResponse::badRequest($e->getMessage());
}