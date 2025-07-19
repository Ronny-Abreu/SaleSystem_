//File for test connection database
<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "✅ Conexión exitosa a la base de datos<br>";
    
    // Probar una consulta simple
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM clientes");
        $result = $stmt->fetch();
        echo "📊 Total de clientes en la base de datos: " . $result['total'];
    } catch(Exception $e) {
        echo "⚠️ Base de datos conectada pero faltan tablas. Ejecuta el script SQL primero.";
    }
} else {
    echo "❌ Error de conexión";
}
?>
