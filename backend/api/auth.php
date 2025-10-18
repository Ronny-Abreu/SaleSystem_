<?php
require_once '../utils/cors.php';
require_once '../utils/response.php';
require_once '../config/database.php';
require_once '../models/Usuario.php';

setCorsHeaders();

// Configurar sesiones para que funcionen en producción
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_httponly', '1');

session_start();

$database = new Database();
$db = $database->getConnection();
$usuario = new Usuario($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'POST':
            // Login
            $data = json_decode(file_get_contents("php://input"));
            
            if (!$data || !isset($data->username) || !isset($data->password)) {
                ApiResponse::badRequest("Username y password son requeridos");
            }
            
            if ($usuario->authenticate($data->username, $data->password)) {
                // Guardar en sesión
                $_SESSION['user_id'] = $usuario->id;
                $_SESSION['username'] = $usuario->username;
                $_SESSION['nombre'] = $usuario->nombre;
                $_SESSION['rol'] = $usuario->rol;
                
                $user_data = array(
                    "id" => $usuario->id,
                    "username" => $usuario->username,
                    "nombre" => $usuario->nombre,
                    "rol" => $usuario->rol
                );
                
                ApiResponse::success($user_data, "Login exitoso");
            } else {
                ApiResponse::badRequest("Credenciales inválidas");
            }
            break;
            
        case 'GET':
            // Verificar sesión o auto-login con Demo
            if (isset($_SESSION['user_id'])) {
                $user_data = array(
                    "id" => $_SESSION['user_id'],
                    "username" => $_SESSION['username'],
                    "nombre" => $_SESSION['nombre'],
                    "rol" => $_SESSION['rol']
                );
                ApiResponse::success($user_data, "Sesión válida");
            } else {
                // Auto-login con usuario Demo
                if ($usuario->authenticate('Demo', 'tareafacil2025')) {
                    $_SESSION['user_id'] = $usuario->id;
                    $_SESSION['username'] = $usuario->username;
                    $_SESSION['nombre'] = $usuario->nombre;
                    $_SESSION['rol'] = $usuario->rol;
                    
                    $user_data = array(
                        "id" => $usuario->id,
                        "username" => $usuario->username,
                        "nombre" => $usuario->nombre,
                        "rol" => $usuario->rol
                    );
                    
                    ApiResponse::success($user_data, "Auto-login exitoso");
                } else {
                    ApiResponse::error("No hay sesión activa", 401);
                }
            }
            break;
            
        case 'DELETE':
            // Logout
            session_destroy();
            ApiResponse::success(null, "Logout exitoso");
            break;
            
        default:
            ApiResponse::error("Método no permitido", 405);
            break;
    }
    
} catch (Exception $e) {
    ApiResponse::badRequest($e->getMessage());
}
?>
