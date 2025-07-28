<?php

require_once __DIR__ . '/../vendor/autoload.php'; // Autoload de Composer
require_once '../utils/cors.php';

setCorsHeaders();

error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once '../utils/response.php';
require_once '../config/database.php';
require_once '../models/Cliente.php';

$database = new Database();
$db = $database->getConnection();
$cliente = new Cliente($db);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

try {
    switch($method) {
        case 'GET':
            if(isset($_GET['codigo'])) {
                // Buscar cliente por código
                $codigo = $_GET['codigo'];
                if($cliente->findByCodigo($codigo)) {
                    $cliente_data = array(
                        "id" => $cliente->id,
                        "codigo" => $cliente->codigo,
                        "nombre" => $cliente->nombre,
                        "telefono" => $cliente->telefono,
                        "email" => $cliente->email,
                        "direccion" => $cliente->direccion,
                        "created_at" => $cliente->created_at,
                        "updated_at" => $cliente->updated_at
                    );
                    ApiResponse::success($cliente_data, "Cliente encontrado");
                } else {
                    ApiResponse::notFound("Cliente no encontrado");
                }
            } elseif(isset($_GET['id'])) {
                // Buscar cliente por ID
                $id = $_GET['id'];
                if($cliente->findById($id)) {
                    $cliente_data = array(
                        "id" => $cliente->id,
                        "codigo" => $cliente->codigo,
                        "nombre" => $cliente->nombre,
                        "telefono" => $cliente->telefono,
                        "email" => $cliente->email,
                        "direccion" => $cliente->direccion,
                        "created_at" => $cliente->created_at,
                        "updated_at" => $cliente->updated_at
                    );
                    ApiResponse::success($cliente_data, "Cliente encontrado");
                } else {
                    ApiResponse::notFound("Cliente no encontrado");
                }
            } else {
                // Obtener todos los clientes
                $stmt = $cliente->read();
                $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                ApiResponse::success($clientes, "Clientes obtenidos exitosamente");
            }
            break;
            
        case 'POST':
            // Crear nuevo cliente
            $data = json_decode(file_get_contents("php://input"));
            
            if(!$data) {
                ApiResponse::badRequest("Datos JSON inválidos");
            }
            
            $cliente->codigo = $data->codigo ?? '';
            $cliente->nombre = $data->nombre ?? '';
            $cliente->telefono = $data->telefono ?? '';
            $cliente->email = $data->email ?? '';
            $cliente->direccion = $data->direccion ?? '';
            
            // Validar datos
            $cliente->validate();
            
            // Verificar si el código del cliente ya existe para no repetirlo
            $cliente_existente = new Cliente($db);
            if($cliente_existente->findByCodigo($cliente->codigo)) {
                ApiResponse::badRequest("Ya existe un cliente con ese código");
            }
            
            if($cliente->create()) {
                $cliente_data = array(
                    "id" => $cliente->id,
                    "codigo" => $cliente->codigo,
                    "nombre" => $cliente->nombre,
                    "telefono" => $cliente->telefono,
                    "email" => $cliente->email,
                    "direccion" => $cliente->direccion
                );
                ApiResponse::success($cliente_data, "Cliente creado exitosamente", 201);
            } else {
                ApiResponse::error("Error al crear el cliente");
            }
            break;
            
        case 'PUT':
            // Actualizar cliente
            if(!isset($_GET['id'])) {
                ApiResponse::badRequest("ID del cliente requerido");
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if(!$data) {
                ApiResponse::badRequest("Datos JSON inválidos");
            }
            
            $cliente->id = $_GET['id'];
            
            // Verificar que el cliente existe
            if(!$cliente->findById($cliente->id)) {
                ApiResponse::notFound("Cliente no encontrado");
            }
            
            // Actualizar solo los campos especificos
            $cliente->nombre = $data->nombre ?? $cliente->nombre;
            $cliente->telefono = $data->telefono ?? $cliente->telefono;
            $cliente->email = $data->email ?? $cliente->email;
            $cliente->direccion = $data->direccion ?? $cliente->direccion;
            
            // Validar datos
            $cliente->validate();
            
            if($cliente->update()) {
                $cliente_data = array(
                    "id" => $cliente->id,
                    "codigo" => $cliente->codigo,
                    "nombre" => $cliente->nombre,
                    "telefono" => $cliente->telefono,
                    "email" => $cliente->email,
                    "direccion" => $cliente->direccion
                );
                ApiResponse::success($cliente_data, "Cliente actualizado exitosamente");
            } else {
                ApiResponse::error("Error al actualizar el cliente");
            }
            break;
            
        case 'DELETE':
            // Eliminar cliente
            if(!isset($_GET['id'])) {
                ApiResponse::badRequest("ID del cliente requerido");
            }
            
            $cliente->id = $_GET['id'];
            
            // Verificar que el cliente exista
            if(!$cliente->findById($cliente->id)) {
                ApiResponse::notFound("Cliente no encontrado");
            }
            
            try {
                if($cliente->delete()) {
                    ApiResponse::success(null, "Cliente eliminado exitosamente");
                } else {
                    ApiResponse::error("Error al eliminar el cliente");
                }
            } catch (Exception $e) {
                ApiResponse::badRequest($e->getMessage());
            }
            break;
            
        default:
            ApiResponse::error("Método no permitido", 405);
            break;
    }
    
} catch (Exception $e) {
    ApiResponse::badRequest("Error: " . $e->getMessage() . " en " . $e->getFile() . " línea " . $e->getLine());
}
?>
