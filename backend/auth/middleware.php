<?php
if (!ob_get_level()) {
    ob_start();
}

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/cors.php';

/**
 * Middleware de autorización
 * Verifica que la petición tenga un token JWT válido
 * Si no es válido, detiene la ejecución y devuelve error 401
 */

function authorizeRequest() {
    if (ob_get_level()) {
        ob_clean();
    }
    
    setCorsHeaders();
    
    $token = JwtAuth::getTokenFromHeader();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "error" => "No autorizado"
        ]);
        exit();
    }
    
    $decoded = JwtAuth::verifyToken($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "error" => "No autorizado"
        ]);
        exit();
    }
    
    if (isset($decoded['type']) && $decoded['type'] === 'refresh') {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "error" => "No autorizado"
        ]);
        exit();
    }
    
    if (isset($decoded['data'])) {
        $GLOBALS['current_user'] = (array) $decoded['data'];
    }
    
    return true;
}