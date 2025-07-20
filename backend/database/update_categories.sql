--  tabla de categorías de productos
CREATE TABLE IF NOT EXISTS categorias_productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Columna categoria_id a productos
ALTER TABLE productos ADD COLUMN categoria_id INT DEFAULT NULL;
ALTER TABLE productos ADD FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id);

-- Insertar categorías de ejemplo
INSERT INTO categorias_productos (nombre, descripcion, color) VALUES
('Bebidas', 'Refrescos, jugos y bebidas en general', '#3B82F6'),
('Comidas', 'Sandwiches, platos principales y comidas', '#10B981'),
('Snacks', 'Aperitivos y bocadillos', '#F59E0B'),
('Postres', 'Dulces y postres', '#EC4899'),
('Otros', 'Productos varios', '#6B7280');

-- Actualizar productos existentes con categorías
UPDATE productos SET categoria_id = 1 WHERE nombre LIKE '%Refresco%' OR nombre LIKE '%Agua%';
UPDATE productos SET categoria_id = 2 WHERE nombre LIKE '%Sandwich%';
UPDATE productos SET categoria_id = 1 WHERE nombre LIKE '%Café%';
