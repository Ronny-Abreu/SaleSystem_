<?php
date_default_timezone_set('America/Santo_Domingo');

require_once __DIR__ . '/utils/cors.php';
setCorsHeaders();


// Enrutar las requests a la carpeta api
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);


$api_path_prefix = '/backend/api/';
if (strpos($path, $api_path_prefix) === 0) {
    // Si la request es por ejemplo /backend/api/facturas.php
    $relative_api_path = substr($path, strlen($api_path_prefix));
    $file = __DIR__ . '/api/' . $relative_api_path;
} elseif (strpos($path, '/api/') === 0) {
    // Si la request es directamente /api/facturas.php (sin /backend/)
    $file = __DIR__ . $path;
} else {
    $file = '';
}


if ($file && file_exists($file . '.php')) { 
    include $file . '.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint no encontrado']);
}