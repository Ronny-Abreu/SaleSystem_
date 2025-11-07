<?php
// Script de diagnóstico específico para Railway
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Diagnóstico Railway</h2>";

echo "<h3>1. Variables de entorno:</h3>";
$env_vars = [
    'MYSQL_URL' => $_ENV['MYSQL_URL'] ?? getenv('MYSQL_URL') ?? 'NO DEFINIDA',
    'MYSQL_PRIVATE_URL' => $_ENV['MYSQL_PRIVATE_URL'] ?? getenv('MYSQL_PRIVATE_URL') ?? 'NO DEFINIDA',
    'RAILWAY_ENVIRONMENT' => $_ENV['RAILWAY_ENVIRONMENT'] ?? getenv('RAILWAY_ENVIRONMENT') ?? 'NO DEFINIDA',
    'DB_HOST' => $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'NO DEFINIDA',
    'DB_PORT' => $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? 'NO DEFINIDA',
];

foreach ($env_vars as $key => $value) {
    $display_value = (strpos($key, 'URL') !== false && $value !== 'NO DEFINIDA') 
        ? 'mysql://[OCULTO]' 
        : $value;
    echo "$key: $display_value<br>";
}

echo "<h3>2. Información del servidor:</h3>";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'NO DEFINIDO') . "<br>";
echo "SERVER_NAME: " . ($_SERVER['SERVER_NAME'] ?? 'NO DEFINIDO') . "<br>";
echo "PHP_OS: " . PHP_OS . "<br>";

echo "<h3>3. Prueba de conexión:</h3>";
$mysql_url = $_ENV['MYSQL_URL'] ?? getenv('MYSQL_URL') ?? null;

if ($mysql_url) {
    try {
        $url_parts = parse_url($mysql_url);
        $host = $url_parts['host'];
        $port = $url_parts['port'] ?? 3306;
        $dbname = ltrim($url_parts['path'], '/');
        $username = $url_parts['user'];
        $password = $url_parts['pass'] ?? '';
        
        echo "Intentando conectar a: $host:$port/$dbname<br>";
        
        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 10
        ]);
        
        echo "✅ Conexión exitosa a Railway MySQL<br>";
        
        // Probar una consulta simple
        $stmt = $pdo->query("SELECT 1 as test");
        $result = $stmt->fetch();
        echo "✅ Consulta de prueba exitosa: " . $result['test'] . "<br>";
        
    } catch (PDOException $e) {
        $errorMessage = $e->getMessage();
        $errorCode = $e->getCode();
        
        // Detectar si MySQL está apagado
        $isMySQLOffline = (
            strpos($errorMessage, 'SQLSTATE[HY000] [2002]') !== false &&
            strpos($errorMessage, 'No connection could be made because the target machine actively refused it') !== false
        ) || (
            $errorCode == 2002 &&
            strpos($errorMessage, 'actively refused it') !== false
        );
        
        if ($isMySQLOffline) {
            echo "❌ <strong>Error: El servidor está apagado o no está disponible. Recarga la página para intentar nuevamente.</strong><br>";
            echo "Por favor, verifica que el servicio de base de datos esté en ejecución.<br>";
            echo "<small>Error original: " . htmlspecialchars($errorMessage) . "</small><br>";
        } else {
            echo "❌ Error: " . htmlspecialchars($errorMessage) . "<br>";
        }
    } catch (Exception $e) {
        echo "❌ Error: " . htmlspecialchars($e->getMessage()) . "<br>";
    }
} else {
    echo "❌ No se encontró MYSQL_URL<br>";
}
?>
