<?php
if (!ob_get_level()) {
    ob_start();
}
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once '../config/env.php';
require_once '../auth/middleware.php';

if (ob_get_level()) {
    ob_clean();
}
authorizeRequest();

require_once '../utils/response.php';
require_once '../config/database.php';
require_once '../models/Factura.php';
require_once '../models/Cliente.php';


$database = new Database();
$db = $database->getConnection();

if (!$db) {
    ApiResponse::error("Error de conexión a la base de datos");
}

$factura = new Factura($db);
$method = $_SERVER['REQUEST_METHOD'];

error_log("DEBUG: Request Method: " . $method);
error_log("DEBUG: GET Parameters: " . json_encode($_GET));

try {
    switch($method) {
        case 'GET':
            error_log("DEBUG: Inside GET case.");

            // Manejar la acción de generar PDF primero y de forma exclusiva
            if(isset($_GET['action']) && $_GET['action'] === 'generate_pdf') {
                error_log("DEBUG: Hitting generate_pdf block.");
                if(!isset($_GET['id'])) {
                    error_log("DEBUG: ID missing for PDF generation.");
                    ApiResponse::badRequest("ID de la factura requerido para generar PDF");
                }
                $id = $_GET['id'];
                error_log("DEBUG: PDF ID: " . $id);
                
                $factura_pdf = new Factura($db);
                if(!$factura_pdf->findById($id)) {
                    error_log("DEBUG: Factura not found for PDF generation. ID: " . $id);
                    ApiResponse::notFound("Factura no encontrada para generar PDF");
                }
                error_log("DEBUG: Factura found for PDF (nombre): " . $factura_pdf->cliente['nombre']);

                $possiblePaths = [
                    __DIR__ . '/../public/SaleSystemLOGO.png',
                    '/app/public/SaleSystemLOGO.png',
                    '/app/backend/public/SaleSystemLOGO.png',
                    isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] . '/public/SaleSystemLOGO.png' : null,
                ];
                
                $possiblePaths = array_filter($possiblePaths, function($path) {
                    return $path !== null;
                });
                
                $imageData = false;
                $imagePath = null;
                
                foreach ($possiblePaths as $path) {
                    if (file_exists($path)) {
                        $imageData = file_get_contents($path);
                        if ($imageData !== FALSE) {
                            $imagePath = $path;
                            error_log("DEBUG LOGO: Imagen encontrada en: " . $path);
                            break;
                        }
                    }
                }
                
                if ($imageData === FALSE || !$imagePath) {
                    error_log("DEBUG LOGO: Error - No se pudo encontrar la imagen en ninguna ruta. Rutas intentadas:");
                    foreach ($possiblePaths as $path) {
                        error_log("  - " . $path . " (existe: " . (file_exists($path) ? 'SI' : 'NO') . ")");
                    }
                    $imageSrc = '';
                } else {
                    $imageData = base64_encode($imageData);
                    $imageSrc = 'data:image/png;base64,' . $imageData;
                }

                // Generar HTML para el PDF
                $html = '
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Factura #' . htmlspecialchars($factura_pdf->numero_factura) . '</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 10pt; }
                        .container { width: 100%; max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05); } /* Estilo de tarjeta */
                        .header { text-align: center; margin-bottom: 30px; } /* Centrar el encabezado */
                        .header img { max-width: 150px; margin-bottom: 10px; } /* Estilo del logo */
                        .header h1 { margin: 0; font-size: 24pt; color: #333; } /* Título principal */
                        .header p { margin: 0; font-size: 11pt; color: #777; } /* Subtítulo */
                        
                        .info-section { margin-bottom: 20px; overflow: auto; } /* Contenedor de información, con clearfix */
                        .client-info { float: left; width: 48%; text-align: left; vertical-align: top; } /* Información del cliente a la izquierda */
                        .invoice-info { float: right; width: 48%; text-align: right; vertical-align: top; } /* Información de la factura a la derecha */
                        
                        .info-section h2 { font-size: 14pt; color: #555; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; } /* Títulos de sección */
                        .info-section p { margin: 2px 0; color: #666; } /* Párrafos de información */

                        .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; } /* Tabla de artículos */
                        .items-table th, .items-table td { border: 1px solid #eee; padding: 8px; text-align: left; } /* Celdas de la tabla */
                        .items-table th { background-color: #f8f8f8; color: #333; font-size: 10pt; } /* Encabezado de tabla */
                        .items-table td { font-size: 9pt; } /* Celdas de datos */

                        .totals { width: 100%; margin-top: 20px; } /* Tabla de totales */
                        .totals tr td { padding: 5px 0; } /* Celdas de totales */
                        .totals .label { text-align: right; padding-right: 15px; color: #555; } /* Etiquetas de totales */
                        .totals .amount { text-align: right; font-weight: bold; color: #333; font-size: 12pt; } /* Montos de totales */

                        .footer { text-align: center; margin-top: 50px; font-size: 9pt; color: #999; } /* Pie de página */

                        /* Estilos para el estado de la factura */
                        .status { display: inline-block; padding: 4px 8px; border-radius: 5px; font-size: 9pt; font-weight: bold; margin-left: 10px; }
                        .status-pagada { background-color: #d4edda; color: #155724; }
                        .status-pendiente { background-color: #fff3cd; color: #856404; }
                        .status-anulada { background-color: #f8d7da; color: #721c24; }

                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="' . $imageSrc . '" alt="Logo SaleSystem">
                            <h1>SaleSystem</h1>
                            <p>Factura de Venta a ' . htmlspecialchars($factura_pdf->cliente['nombre']) . '</p>
                        </div>

                        <div class="info-section">
                            <div class="client-info">
                                <h2>Cliente</h2>
                                <p><strong>Código:</strong> ' . htmlspecialchars($factura_pdf->cliente['codigo']) . '</p>
                                <p><strong>Nombre:</strong> ' . htmlspecialchars($factura_pdf->cliente['nombre']) . '</p>';
                                if (!empty($factura_pdf->cliente['telefono'])) {
                                    $html .= '<p><strong>Teléfono:</strong> ' . htmlspecialchars($factura_pdf->cliente['telefono']) . '</p>';
                                }
                                if (!empty($factura_pdf->cliente['email'])) {
                                    $html .= '<p><strong>Email:</strong> ' . htmlspecialchars($factura_pdf->cliente['email']) . '</p>';
                                }
                                if (!empty($factura_pdf->cliente['direccion'])) {
                                    $html .= '<p><strong>Dirección:</strong> ' . htmlspecialchars($factura_pdf->cliente['direccion']) . '</p>';
                                }
                $html .= '
                            </div>
                            <div class="invoice-info">
                                <h2>Factura</h2>
                                <p><strong>Número:</strong> ' . htmlspecialchars($factura_pdf->numero_factura) . '</p>
                                <p><strong>Fecha:</strong> ' . htmlspecialchars(date('d/m/Y', strtotime($factura_pdf->fecha))) . '</p>
                                <p><strong>Estado = </strong> <strong>' . htmlspecialchars(ucfirst($factura_pdf->estado)) . '</strong></p>
                            </div>
                        </div>

                        <h2>Detalles del Pedido</h2>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th style="text-align:center;">Cantidad</th>
                                    <th style="text-align:right;">Precio Unitario</th>
                                    <th style="text-align:right;">Total Línea</th>
                                </tr>
                            </thead>
                            <tbody>';
                            foreach ($factura_pdf->detalles as $detalle) {
                                $html .= '
                                <tr>
                                    <td>' . htmlspecialchars($detalle['nombre_producto']) . '</td>
                                    <td style="text-align:center;">' . htmlspecialchars($detalle['cantidad']) . '</td>
                                    <td style="text-align:right;">RD$' . number_format($detalle['precio_unitario'], 2) . '</td>
                                    <td style="text-align:right;">RD$' . number_format($detalle['total_linea'], 2) . '</td>
                                </tr>';
                            }
                $html .= '
                            </tbody>
                        </table>

                        <table class="totals">
                            <tr>
                                <td class="label">Subtotal:</td>
                                <td class="amount">RD$' . number_format($factura_pdf->subtotal, 2) . '</td>
                            </tr>
                            <tr>
                                <td class="label">Total a Pagar:</td>
                                <td class="amount">RD$' . number_format($factura_pdf->total, 2) . '</td>
                            </tr>
                        </table>';

                        if (!empty($factura_pdf->comentario)) {
                            $html .= '
                            <h2>Comentarios</h2>
                            <p>' . htmlspecialchars($factura_pdf->comentario) . '</p>';
                        }

                $html .= '
                        <div class="footer">
                            <p>¡Gracias por su compra!</p>
                            <p>SaleSystem - Sistema de Facturación</p>
                            <p>Fecha de creación: ' . htmlspecialchars(date('d/m/Y H:i:s', strtotime($factura_pdf->created_at))) . '</p>
                        </div>
                    </div>
                </body>
                </html>';

                $dompdf = new Dompdf\Dompdf();
                $dompdf->loadHtml($html);
                $dompdf->setPaper('A4', 'portrait');
                $dompdf->render();
                ob_clean(); // Limpiar cualquier salida antes de enviar el PDF
                $dompdf->stream("factura_" . $factura_pdf->numero_factura . ".pdf", array("Attachment" => false));
                exit;

            } elseif(isset($_GET['id'])) {
                error_log("DEBUG: Hitting get by ID block.");
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
                $fecha_desde = isset($_GET['fecha_desde']) ? trim($_GET['fecha_desde']) : null;
                $fecha_hasta = isset($_GET['fecha_hasta']) ? trim($_GET['fecha_hasta']) : null;
                $estado = $_GET['estado'] ?? null;
                $cliente_id = isset($_GET['cliente_id']) ? intval($_GET['cliente_id']) : null;
                $incluir_detalles = isset($_GET['incluir_detalles']) && $_GET['incluir_detalles'] === 'true';
                
                if ($fecha_desde && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_desde)) {
                    $fecha_desde = null;
                }
                if ($fecha_hasta && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_hasta)) {
                    $fecha_hasta = null;
                }
                
                if ($incluir_detalles) {
                    $facturas = $factura->readWithDetails($fecha_desde, $fecha_hasta, $estado, $cliente_id);
                } else {
                    $stmt = $factura->read($fecha_desde, $fecha_hasta, $estado, $cliente_id);
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
                $estado_anterior = $factura->estado;
                $nuevo_estado = $data->estado;
                
                if($factura->updateEstado($nuevo_estado)) {
                    $cambio_pendiente_a_pagada = ($estado_anterior === 'pendiente' && $nuevo_estado === 'pagada');
                    
                    $response_data = array(
                        'cambio_pendiente_a_pagada' => $cambio_pendiente_a_pagada,
                        'factura_id' => $factura->id
                    );
                    
                    ApiResponse::success($response_data, "Estado de factura actualizado exitosamente");
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