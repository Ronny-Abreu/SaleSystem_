<?php
class Validator {
    public static function required($value, $fieldName) {
        if (empty($value) && $value !== '0') {
            throw new Exception("El campo {$fieldName} es requerido");
        }
        return true;
    }
    
    public static function email($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("El email no tiene un formato válido");
        }
        return true;
    }
    
    public static function numeric($value, $fieldName) {
        if (!is_numeric($value)) {
            throw new Exception("El campo {$fieldName} debe ser numérico");
        }
        return true;
    }
    
    public static function minLength($value, $min, $fieldName) {
        if (strlen($value) < $min) {
            throw new Exception("El campo {$fieldName} debe tener al menos {$min} caracteres");
        }
        return true;
    }
    
    public static function maxLength($value, $max, $fieldName) {
        if (strlen($value) > $max) {
            throw new Exception("El campo {$fieldName} no puede tener más de {$max} caracteres");
        }
        return true;
    }
}
