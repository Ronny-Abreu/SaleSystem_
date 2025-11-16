<?php

$isLocal = !isset($_ENV['RAILWAY_ENVIRONMENT']) && 
           !isset($_ENV['MYSQL_URL']) && 
           !getenv('RAILWAY_ENVIRONMENT') && 
           !getenv('MYSQL_URL');

if ($isLocal) {
    $dotenvPath = __DIR__ . '/../.env';
    
    if (file_exists($dotenvPath)) {
        require_once __DIR__ . '/../vendor/autoload.php';
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
        $dotenv->load();
    }
}
?>

