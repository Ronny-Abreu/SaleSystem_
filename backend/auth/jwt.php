<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuth {
    private static $algorithm = 'HS256';
    private static $access_token_exp = 86400;
    private static $refresh_token_exp = 604800;
    
    private static function getSecretKey() {
        $secret = $_ENV['JWT_SECRET_KEY'] ?? getenv('JWT_SECRET_KEY') ?? null;
        
        if (!$secret) {
            throw new Exception('JWT_SECRET_KEY no está configurada. Configúrala como variable de entorno.');
        }
        
        return $secret;
    }
    

    public static function generateAccessToken($payload) {
        $issued_at = time();
        $expiration = $issued_at + self::$access_token_exp;
        
        $token_data = [
            'iat' => $issued_at,
            'exp' => $expiration,
            'data' => [
                'id' => $payload['id'],
                'username' => $payload['username'],
                'nombre' => $payload['nombre'],
                'rol' => $payload['rol']
            ]
        ];
        
        return JWT::encode($token_data, self::getSecretKey(), self::$algorithm);
    }
    

    public static function generateRefreshToken($payload) {
        $issued_at = time();
        $expiration = $issued_at + self::$refresh_token_exp;
        
        $token_data = [
            'iat' => $issued_at,
            'exp' => $expiration,
            'type' => 'refresh',
            'data' => [
                'id' => $payload['id'],
                'username' => $payload['username']
            ]
        ];
        
        return JWT::encode($token_data, self::getSecretKey(), self::$algorithm);
    }
    

    public static function verifyToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(self::getSecretKey(), self::$algorithm));
            return (array) $decoded;
        } catch (Exception $e) {
            return false;
        }
    }
    
    public static function getTokenFromHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } else if (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        if ($headers) {
            if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
                return $matches[1];
            }
        }
        
        return false;
    }
    
    public static function generateTokens($payload) {
        return [
            'access_token' => self::generateAccessToken($payload),
            'refresh_token' => self::generateRefreshToken($payload),
            'expires_in' => self::$access_token_exp
        ];
    }
}