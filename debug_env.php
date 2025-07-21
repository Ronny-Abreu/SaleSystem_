<?php
// Archivo temporal para debug
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'MYSQL_HOST' => $_ENV['MYSQL_HOST'] ?? 'NOT_SET',
    'MYSQL_PORT' => $_ENV['MYSQL_PORT'] ?? 'NOT_SET', 
    'MYSQL_DATABASE' => $_ENV['MYSQL_DATABASE'] ?? 'NOT_SET',
    'MYSQL_USER' => $_ENV['MYSQL_USER'] ?? 'NOT_SET',
    'MYSQL_PASSWORD' => isset($_ENV['MYSQL_PASSWORD']) ? 'SET' : 'NOT_SET',
    'DB_HOST' => $_ENV['DB_HOST'] ?? 'NOT_SET',
    'DB_PORT' => $_ENV['DB_PORT'] ?? 'NOT_SET',
    'all_env' => array_keys($_ENV)
], JSON_PRETTY_PRINT);
?>