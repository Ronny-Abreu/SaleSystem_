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
                // Buscar producto por ID
                $id = $_GET['id'];
                if($producto->findById($id)) {
                    $producto_data = array(
                        "id" => $producto->id,
                        "nombre" => $producto->nombre,
                        "precio" => floatval($producto->precio),
                        "descripcion" => $producto->descripcion,
                        "stock" => intval($producto->stock),
                        "activo" => boolval($producto->activo),
                        "categoria_id" => $producto->categoria_id ? intval($producto->categoria_id) : null,
                        "created_at" => $producto->created_at,
                        "updated_at" => $producto->updated_at
                    );
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
                $productos = array();

                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $productos[] = array(
                        "id" => intval($row['id']),
                        "nombre" => $row['nombre'],
                        "precio" => floatval($row['precio']),
                        "descripcion" => $row['descripcion'],
                        "stock" => intval($row['stock']),
                        "activo" => boolval($row['activo']),
                        "categoria_id" => $row['categoria_id'] ? intval($row['categoria_id']) : null,
                        "categoria_nombre" => $row['categoria_nombre'],
                        "categoria_color" => $row['categoria_color'],
                        "categoria_descripcion" => $row['categoria_descripcion'],
                        "created_at" => $row['created_at'],
                        "updated_at" => $row['updated_at']
                    );
                }
                
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
            // Crear nuevo producto
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
            
            // Validar datos
            $producto->validate();
            
            if($producto->create()) {
                $producto_data = array(
                    "id" => $producto->id,
                    "nombre" => $producto->nombre,
                    "precio" => floatval($producto->precio),
                    "descripcion" => $producto->descripcion,
                    "stock" => intval($producto->stock),
                    "activo" => boolval($producto->activo),
                    "categoria_id" => $producto->categoria_id ? intval($producto->categoria_id) : null
                );
                ApiResponse::success($producto_data, "Producto creado exitosamente", 201);
            } else {
                ApiResponse::error("Error al crear el producto");
            }
            break;
            
        case 'PUT':
            // Actualizar producto
            if(!isset($_GET['id'])) {
                ApiResponse::badRequest("ID del producto requerido");
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if(!$data) {
                ApiResponse::badRequest("Datos JSON inválidos");
            }
            
            $producto->id = $_GET['id'];
            
            // Verificar que el producto existe
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
            
            // Validar datos
            $producto->validate();
            
            if($producto->update()) {
                $producto_data = array(
                    "id" => $producto->id,
                    "nombre" => $producto->nombre,
                    "precio" => floatval($producto->precio),
                    "descripcion" => $producto->descripcion,
                    "stock" => intval($producto->stock),
                    "activo" => boolval($producto->activo),
                    "categoria_id" => $producto->categoria_id ? intval($producto->categoria_id) : null
                );
                ApiResponse::success($producto_data, "Producto actualizado exitosamente");
            } else {
                ApiResponse::error("Error al actualizar el producto");
            }
            break;
            
        case 'DELETE':
            // Eliminar producto
            if(!isset($_GET['id'])) {
                ApiResponse::badRequest("ID del producto requerido");
            }
            
            $producto->id = $_GET['id'];
            
            // Verificar que el producto exista
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