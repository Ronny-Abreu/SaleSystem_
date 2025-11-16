<?php
require_once '../config/env.php';
require_once '../utils/cors.php';
require_once '../utils/response.php';
require_once '../config/database.php';
require_once '../models/Usuario.php';
require_once '../auth/jwt.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();
$usuario = new Usuario($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!$data || !isset($data->username) || !isset($data->password)) {
                ApiResponse::badRequest("Username y password son requeridos");
            }
            
            if ($usuario->authenticate($data->username, $data->password)) {
                $payload = array(
                    "id" => $usuario->id,
                    "username" => $usuario->username,
                    "nombre" => $usuario->nombre,
                    "rol" => $usuario->rol
                );
                
                $tokens = JwtAuth::generateTokens($payload);
                
                $user_data = array(
                    "id" => $usuario->id,
                    "username" => $usuario->username,
                    "nombre" => $usuario->nombre,
                    "rol" => $usuario->rol,
                    "access_token" => $tokens['access_token'],
                    "refresh_token" => $tokens['refresh_token'],
                    "expires_in" => $tokens['expires_in']
                );
                
                ApiResponse::success($user_data, "Login exitoso");
            } else {
                ApiResponse::badRequest("Credenciales inválidas");
            }
            break;
            
        case 'GET':
            $token = JwtAuth::getTokenFromHeader();
            
            if ($token) {
                $decoded = JwtAuth::verifyToken($token);
                
                if ($decoded && isset($decoded['data'])) {
                    $user_data = (array) $decoded['data'];
                    ApiResponse::success($user_data, "Token válido");
                } else {
                    ApiResponse::error("Token inválido", 401);
                }
            } else {
                if ($usuario->authenticate('Demo', 'tareafacil2025')) {
                    $payload = array(
                        "id" => $usuario->id,
                        "username" => $usuario->username,
                        "nombre" => $usuario->nombre,
                        "rol" => $usuario->rol
                    );
                    
                    $tokens = JwtAuth::generateTokens($payload);
                    
                    $user_data = array(
                        "id" => $usuario->id,
                        "username" => $usuario->username,
                        "nombre" => $usuario->nombre,
                        "rol" => $usuario->rol,
                        "access_token" => $tokens['access_token'],
                        "refresh_token" => $tokens['refresh_token'],
                        "expires_in" => $tokens['expires_in']
                    );
                    
                    ApiResponse::success($user_data, "Auto-login exitoso");
                } else {
                    ApiResponse::error("No autorizado", 401);
                }
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            
            if (!$data || !isset($data->refresh_token)) {
                ApiResponse::badRequest("Refresh token requerido");
            }
            
            $decoded = JwtAuth::verifyToken($data->refresh_token);
            
            if (!$decoded || !isset($decoded['type']) || $decoded['type'] !== 'refresh') {
                ApiResponse::error("Refresh token inválido", 401);
            }
            
            if (isset($decoded['data']->id)) {
                if ($usuario->findById($decoded['data']->id)) {
                    $payload = array(
                        "id" => $usuario->id,
                        "username" => $usuario->username,
                        "nombre" => $usuario->nombre,
                        "rol" => $usuario->rol
                    );
                    
                    $tokens = JwtAuth::generateTokens($payload);
                    
                    $response_data = array(
                        "access_token" => $tokens['access_token'],
                        "refresh_token" => $tokens['refresh_token'],
                        "expires_in" => $tokens['expires_in']
                    );
                    
                    ApiResponse::success($response_data, "Token refrescado exitosamente");
                } else {
                    ApiResponse::error("Usuario no encontrado", 401);
                }
            } else {
                ApiResponse::error("Refresh token inválido", 401);
            }
            break;
            
        case 'DELETE':
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
