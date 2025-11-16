<?php
class ApiResponse {
    public static function success($data = null, $message = "Operación exitosa", $code = 200) {
        http_response_code($code);
        echo json_encode([
            "success" => true,
            "message" => $message,
            "data" => $data
        ]);
        exit();
    }
    
    public static function error($message = "Error interno del servidor", $code = 500, $details = null) {
        http_response_code($code);
        echo json_encode([
            "success" => false,
            "message" => $message,
            "details" => $details
        ]);
        exit();
    }
    
    public static function notFound($message = "Recurso no encontrado") {
        self::error($message, 404);
    }
    
    public static function badRequest($message = "Solicitud inválida") {
        self::error($message, 400);
    }
    
    public static function unauthorized($message = "No autorizado") {
        self::error($message, 401);
    }
}
