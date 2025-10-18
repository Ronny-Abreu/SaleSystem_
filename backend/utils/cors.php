<?php
// Configuración CORS mejorada
function setCorsHeaders() {
    // Lista de orígenes permitidos específicos
    $allowed_origins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',

        //Rama main
        'https://sale-system-liard.vercel.app',

        // Desarrollo en rama fixLogin producción pruebas antes de producción rama main
        'https://sale-system-ronny-de-leons-projects.vercel.app'
    ];
    
    // Obtener el origen de la request
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Verificar si el origen está permitido
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Para desarrollo local, permitir localhost
        if (strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false) {
            header("Access-Control-Allow-Origin: $origin");
        }
    }
    
    // Headers CORS esenciales
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // Cache preflight por 24 horas
    
    // Headers de respuesta
    header("Content-Type: application/json; charset=UTF-8");
    header("Vary: Origin");
    
    // Manejar preflight requests (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
?>
