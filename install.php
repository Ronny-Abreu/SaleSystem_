<?php

require_once __DIR__ . '/backend/config/database.php';

header('Content-Type: text/html; charset=utf-8'); // Cambiar a HTML

$response = [
    'success' => false,
    'message' => 'Error desconocido.',
    'messages' => [] // Para almacenar los mensajes de proceso
];

try {
    // Configuración base de datos para instalarla en local
    $host = 'localhost';
    $port = '3308';
    $username = 'root';
    $password = '';
    $db_name_to_create = 'salesystemprueba'; 

    // If environment variables are set (likely production)
    if (!empty($_ENV['MYSQL_URL']) || !empty(getenv('MYSQL_URL')) ||
        !empty($_ENV['MYSQL_PRIVATE_URL']) || !empty(getenv('MYSQL_PRIVATE_URL')) ||
        !empty($_ENV['RAILWAY_ENVIRONMENT']) || !empty(getenv('RAILWAY_ENVIRONMENT'))) {

        $mysql_url = $_ENV['MYSQL_URL'] ?? $_ENV['MYSQL_PRIVATE_URL'] ??
                     getenv('MYSQL_URL') ?? getenv('MYSQL_PRIVATE_URL') ?? null;

        if ($mysql_url) {
            $url_parts = parse_url($mysql_url);
            $host = $url_parts['host'];
            $port = $url_parts['port'] ?? 3306;
            $db_name_to_create = ltrim($url_parts['path'], '/');
            $username = $url_parts['user'];
            $password = $url_parts['pass'] ?? '';
        } else {
            $host = $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?? 'localhost';
            $port = $_ENV['DB_PORT'] ?? getenv('DB_PORT') ?? '3306';
            $db_name_to_create = $_ENV['DB_NAME'] ?? getenv('DB_NAME') ?? 'railway';
            $username = $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?? 'root';
            $password = $_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?? '';
        }
    }

    // Connect to the MySQL server without a specific database
    $dsn_no_db = "mysql:host={$host};port={$port};charset=utf8mb4";
    $pdo_no_db = new PDO(
        $dsn_no_db,
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
            PDO::ATTR_TIMEOUT => 30,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
        ]
    );

    // Add DROP DATABASE statement for local testing convenience
    $drop_db_sql = "DROP DATABASE IF EXISTS `{$db_name_to_create}`;";
    $pdo_no_db->exec($drop_db_sql);
    $response['messages'][] = "Base de datos '{$db_name_to_create}' eliminada si existía.";

    // 1. Crea la base de datos sino existe
    $create_db_sql = "CREATE DATABASE IF NOT EXISTS `{$db_name_to_create}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;";
    $pdo_no_db->exec($create_db_sql);
    $response['messages'][] = "Base de datos '{$db_name_to_create}' creada o ya existente.";

    // Ahora se crea la conexión con la clase Database.
    $db = new Database();
    $conn = $db->getConnection();
    
    // Leer y ejecutar create_database.sql
    $create_sql = file_get_contents(__DIR__ . '/backend/database/create_database.sql');
    if ($create_sql === false) {
        throw new Exception("No se pudo leer el archivo create_database.sql");
    }
    // Remove CREATE DATABASE and USE commands as they are handled
    $create_sql = preg_replace('/CREATE DATABASE IF NOT EXISTS salesystem[^;]*;/i', '', $create_sql);
    $create_sql = preg_replace('/USE salesystem;/i', '', $create_sql);

    // Execute SQL queries from create_database.sql
    $statements = array_filter(array_map('trim', explode(';', $create_sql)));
    foreach ($statements as $stmt) {
        if (!empty($stmt)) {
            $conn->exec($stmt);
        }
    }
    $response['messages'][] = "Estructura inicial de tablas y datos semilla aplicada.";

    // Lee y ejecuta update_categories.sql (Este query agreaga la tabla de categorias con datos semillas)
    $update_sql = file_get_contents(__DIR__ . '/backend/database/update_categories.sql');
    if ($update_sql === false) {
        throw new Exception("No se pudo leer el archivo update_categories.sql");
    }

    $statements_update = array_filter(array_map('trim', explode(';', $update_sql)));
    foreach ($statements_update as $stmt) {
        if (!empty($stmt)) {
            $conn->exec($stmt);
        }
    }
    $response['messages'][] = "Actualizaciones de categorías de productos aplicadas.";

    $response['success'] = true;
    $response['message'] = "Base de datos y tablas creadas/actualizadas exitosamente.";

} catch (PDOException $e) {
    $response['message'] = "Error de base de datos: " . $e->getMessage();
    error_log("Error en install.php (PDOException): " . $e->getMessage());
} catch (Exception $e) {
    $response['message'] = "Error: " . $e->getMessage();
    error_log("Error en install.php (Exception): " . $e->getMessage());
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instalador de SaleSystem</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            color: #333;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 600px;
            text-align: center;
            box-sizing: border-box;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 2.2em;
            font-weight: 600;
        }
        .status-message {
            padding: 15px 20px;
            margin-bottom: 25px;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .status-message.success {
            background-color: #e6ffe6;
            color: #28a745;
            border: 1px solid #28a745;
        }
        .status-message.error {
            background-color: #ffe6e6;
            color: #dc3545;
            border: 1px solid #dc3545;
        }
        .status-message svg {
            margin-right: 10px;
        }
        .messages-list {
            text-align: left;
            margin-bottom: 30px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 8px;
            background-color: #fdfdfd;
        }
        .messages-list p {
            margin: 8px 0;
            line-height: 1.5;
            color: #555;
            font-size: 0.95em;
        }
        .messages-list p:last-child {
            margin-bottom: 0;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 25px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 1.1em;
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.2s ease;
            border: none;
            cursor: pointer;
        }
        .button:hover {
            background-color: #0056b3;
            transform: translateY(-2px);
        }
        .button:active {
            transform: translateY(0);
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Instalador de SaleSystem</h1>

        <?php if ($response['success']): ?>
            <div class="status-message success">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.81"/><path d="M22 4L12 14.01l-3-3"/></svg>
                <?php echo htmlspecialchars($response['message']); ?>
            </div>
        <?php else: ?>
            <div class="status-message error">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                <?php echo htmlspecialchars($response['message']); ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($response['messages'])): ?>
            <div class="messages-list">
                <?php foreach ($response['messages'] as $msg): ?>
                    <p>- <?php echo htmlspecialchars($msg); ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <?php if ($response['success']): ?>
            <a href="http://localhost:3001" class="button">Ir al Sistema</a>
        <?php else: ?>
            <p class="footer">Por favor, revisa los errores anteriores y asegúrate de que tu servidor de base de datos esté funcionando correctamente.</p>
        <?php endif; ?>
    </div>
</body>
</html> 