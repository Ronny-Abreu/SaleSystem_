<?php
// Para Reporte de errores para desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 0); //

require_once '../utils/cors.php';
require_once '../utils/response.php';
require_once '../config/database.php';
require_once '../models/Factura.php';
require_once '../models/Cliente.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    ApiResponse::error("Error de conexión a la base de datos");
}

$factura = new Factura($db);
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            if(isset($_GET['id'])) {
                // Buscar factura por ID
                $id = $_GET['id'];
                if($factura->findById($id)) {
                    $factura_data = array(
                        "id" => $factura->id,
                        "numero_factura" => $factura->numero_factura,
                        "cliente_id" => $factura->cliente_id,
                        "fecha" => $factura->fecha,
                        "subtotal" => floatval($factura->subtotal),
                        "total" => floatval($factura->total),
                        "comentario" => $factura->comentario,
                        "estado" => $factura->estado,
                        "created_at" => $factura->created_at,
                        "updated_at" => $factura->updated_at,
                        "cliente" => $factura->cliente,
                        "detalles" => $factura->detalles
                    );
                    ApiResponse::success($factura_data, "Factura encontrada");
                } else {
                    ApiResponse::notFound("Factura no encontrada");
                }
            } elseif(isset($_GET['numero'])) {
                // Buscar factura por número
                $numero = $_GET['numero'];
                if($factura->findByNumero($numero)) {
                    $factura_data = array(
                        "id" => $factura->id,
                        "numero_factura" => $factura->numero_factura,
                        "cliente_id" => $factura->cliente_id,
                        "fecha" => $factura->fecha,
                        "subtotal" => floatval($factura->subtotal),
                        "total" => floatval($factura->total),
                        "comentario" => $factura->comentario,
                        "estado" => $factura->estado,
                        "created_at" => $factura->created_at,
                        "updated_at" => $factura->updated_at,
                        "cliente" => $factura->cliente,
                        "detalles" => $factura->detalles
                    );
                    ApiResponse::success($factura_data, "Factura encontrada");
                } else {
                    ApiResponse::notFound("Factura no encontrada");
                }
            } elseif(isset($_GET['estadisticas'])) {
                // Obtener estadísticas del día
                $fecha = $_GET['fecha'] ?? null;
                $estadisticas = $factura->getEstadisticasDelDia($fecha);
                ApiResponse::success($estadisticas, "Estadísticas obtenidas");
            } else {
                // Obtener todas las facturas con filtros
                $fecha_desde = $_GET['fecha_desde'] ?? null;
                $fecha_hasta = $_GET['fecha_hasta'] ?? null;
                $estado = $_GET['estado'] ?? null;
                
                $stmt = $factura->read($fecha_desde, $fecha_hasta, $estado);
                $facturas = array();
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $facturas[] = array(
                        "id" => $row['id'],
                        "numero_factura" => $row['numero_factura'],
                        "cliente_id" => $row['cliente_id'],
                        "fecha" => $row['fecha'],
                        "subtotal" => floatval($row['subtotal']),
                        "total" => floatval($row['total']),
                        "comentario" => $row['comentario'],
                        "estado" => $row['estado'],
                        "created_at" => $row['created_at'],
                        "updated_at" => $row['updated_at'],
                        "cliente" => array(
                            "codigo" => $row['cliente_codigo'],
                            "nombre" => $row['cliente_nombre']
                        )
                    );
                }
                
                ApiResponse::success($facturas, "Facturas obtenidas exitosamente");
            }
            break;
            
        case 'POST':
            // Crear nueva factura
            $input = file_get_contents("php://input");
            $data = json_decode($input);
            
            if(!$data) {
                ApiResponse::badRequest("Datos JSON inválidos. Input recibido: " . substr($input, 0, 100));
            }
            
            // Verificar que el cliente existe
            $cliente = new Cliente($db);
            if(!$cliente->findById($data->cliente_id)) {
                ApiResponse::badRequest("Cliente con ID {$data->cliente_id} no encontrado");
            }
            
            $factura->cliente_id = $data->cliente_id;
            $factura->fecha = $data->fecha ?? date('Y-m-d');
            $factura->subtotal = $data->subtotal ?? 0;
            $factura->total = $data->total ?? 0;
            $factura->comentario = $data->comentario ?? '';
            $factura->estado = $data->estado ?? 'pagada';
            
            $detalles_data = $data->detalles ?? array();
            
            // Convertir detalles a array si es necesario
            if (is_object($detalles_data)) {
                $detalles_data = (array) $detalles_data;
            }
            
            // Convertir cada detalle a array
            $detalles_array = array();
            foreach ($detalles_data as $detalle) {
                if (is_object($detalle)) {
                    $detalles_array[] = (array) $detalle;
                } else {
                    $detalles_array[] = $detalle;
                }
            }
            
            // Validar datos
            $factura->validate($detalles_array);
            
            if($factura->create($detalles_array)) {
                // Obtener la factura completa creada
                $factura->findById($factura->id);
                
                $factura_data = array(
                    "id" => $factura->id,
                    "numero_factura" => $factura->numero_factura,
                    "cliente_id" => $factura->cliente_id,
                    "fecha" => $factura->fecha,
                    "subtotal" => floatval($factura->subtotal),
                    "total" => floatval($factura->total),
                    "comentario" => $factura->comentario,
                    "estado" => $factura->estado,
                    "cliente" => $factura->cliente,
                    "detalles" => $factura->detalles
                );
                
                ApiResponse::success($factura_data, "Factura creada exitosamente", 201);
            } else {
                ApiResponse::error("Error al crear la factura");
            }
            break;
            
        case 'PUT':
            // Actualizar estado de factura
            if(!isset($_GET['id'])) {
                ApiResponse::badRequest("ID de la factura requerido");
            }
            
            $data = json_decode(file_get_contents("php://input"));
            
            if(!$data) {
                ApiResponse::badRequest("Datos JSON inválidos");
            }
            
            $factura->id = $_GET['id'];
            
            // Verificar que la factura existe
            if(!$factura->findById($factura->id)) {
                ApiResponse::notFound("Factura no encontrada");
            }
            
            if(isset($data->estado)) {
                if($factura->updateEstado($data->estado)) {
                    ApiResponse::success(null, "Estado de factura actualizado exitosamente");
                } else {
                    ApiResponse::error("Error al actualizar el estado de la factura");
                }
            } else {
                ApiResponse::badRequest("Estado requerido para actualizar");
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
