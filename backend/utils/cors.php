<?php
// Configuración CORS para permitir requests desde múltiples orígenes
function setCorsHeaders() {
    // Lista de orígenes permitidos
    $allowed_origins = [
        'http://localhost:3000', // Para desarrollo local
    ];
    
    // La URL del frontend desde variable de entorno
    $frontend_url = getenv('FRONTEND_URL');
    if ($frontend_url) {
        $allowed_origins[] = $frontend_url;
    }
    
    // tu chave, por si acaso y curarme en salud
    $allowed_origins[] = 'https://sale-system-liard.vercel.app';
    
    // Obtener el origen de la request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Debug: Log para ver qué origen está llegando
    error_log("Origin recibido: " . $origin);
    error_log("Orígenes permitidos: " . implode(', ', $allowed_origins));
    
    // Verificar si el origen está en la lista permitida
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Fallback para desarrollo - puedes quitar esto en producción
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");
    
    // Manejar preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
?>
