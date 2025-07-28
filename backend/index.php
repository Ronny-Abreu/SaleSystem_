<?php
// Enrutar las requests a la carpeta api
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

if (strpos($path, '/api/') === 0) {
    $file = __DIR__ . $path . '.php';
    if (file_exists($file)) {
        include $file;
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint no encontrado']);
    }
} else {
    echo json_encode(['message' => 'SaleSystem API funcionando correctamente']);
}
?>