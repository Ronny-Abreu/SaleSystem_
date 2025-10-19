# 🧩 SaleSystem - Sistema de Facturación y Gestión de Ventas

**SaleSystem** es una aplicación web completa para la gestión de facturas, clientes y productos, diseñada para pequeñas y medianas empresas que necesitan un sistema de facturación moderno y eficiente.

---

## 🚀 Descripción General

SaleSystem resuelve el problema de la gestión manual de facturas y el control de inventario que enfrentan muchas empresas. La aplicación permite:

- **Gestión completa de clientes** con información detallada y códigos únicos
- **Control de inventario** con productos categorizados y seguimiento de stock
- **Sistema de facturación** con generación automática de PDFs profesionales
- **Reportes y estadísticas** en tiempo real para análisis de ventas
- **Interfaz moderna y responsiva** que funciona en cualquier dispositivo

El proyecto fue desarrollado para demostrar habilidades en desarrollo full-stack, utilizando tecnologías modernas tanto en frontend como backend, con un enfoque en la experiencia del usuario y la eficiencia operativa.

---

## ⚙️ Tecnologías Utilizadas

### 🎨 **Frontend**
- **Next.js 15** - Framework React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **Lucide React** - Iconografía moderna y consistente
- **TSParticles** - Efectos visuales interactivos

### 🔧 **Backend**
- **PHP 8.3** - Lenguaje de programación del servidor
- **MySQL** - Base de datos relacional
- **PDO** - Interfaz de acceso a datos
- **Dompdf** - Generación de PDFs
- **Composer** - Gestión de dependencias PHP

### 🚀 **Despliegue y Hosting**
- **Vercel** - Frontend (Next.js)
- **Railway** - Backend (PHP)
- **MySQL** - Base de datos en la nube

### 🛠️ **Herramientas de Desarrollo**
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad de CSS

---

## 🧠 Características Principales

### 👥 **Gestión de Clientes**
- ✅ Registro y edición de clientes
- ✅ Códigos únicos automáticos
- ✅ Información completa (teléfono, email, dirección)
- ✅ Búsqueda y filtrado avanzado

### 📦 **Control de Productos**
- ✅ Catálogo de productos con categorías
- ✅ Control de stock en tiempo real
- ✅ Precios y descripciones detalladas
- ✅ Estados activo/inactivo

### 🧾 **Sistema de Facturación**
- ✅ Creación de facturas con múltiples productos
- ✅ Numeración automática de facturas
- ✅ Generación de PDFs profesionales
- ✅ Estados de factura (pagada, pendiente, anulada)
- ✅ Comentarios y observaciones

### 📊 **Reportes y Estadísticas**
- ✅ Dashboard con métricas clave
- ✅ Reportes de ventas por período
- ✅ Estadísticas de productos más vendidos
- ✅ Análisis de clientes frecuentes

### 🎨 **Interfaz de Usuario**
- ✅ Diseño responsivo y moderno
- ✅ Navegación intuitiva
- ✅ Modales y confirmaciones
- ✅ Notificaciones en tiempo real
- ✅ Efectos visuales con TSParticles

---

## 🧾 Estructura del Proyecto

```
SaleSystem/
├── 📁 app/                    # Frontend Next.js (App Router)
│   ├── 📁 clientes/           # Páginas de gestión de clientes
│   ├── 📁 facturas/           # Páginas de facturación
│   ├── 📁 productos/          # Páginas de productos
│   ├── 📁 reportes/           # Páginas de reportes
│   └── 📄 layout.tsx          # Layout principal
│ 
├── 📁 backend/                # Backend PHP
│   ├── 📁 api/                # Endpoints de la API
│   ├── 📁 models/             # Modelos de datos
│   ├── 📁 config/             # Configuración
│   ├── 📁 utils/              # Utilidades y helpers
│   └── 📁 database/           # Migraciones y scripts SQL
│ 
├── 📁 components/             # Componentes React reutilizables
│   ├── 📁 auth/               # Componentes de autenticación
│   ├── 📁 layout/             # Componentes de layout
│   ├── 📁 modals/             # Modales y diálogos
│   └── 📁 ui/                 # Componentes de interfaz
│ 
├── 📁 hooks/                  # Custom React hooks
├── 📁 contexts/               # Contextos de React
├── 📁 lib/                    # Librerías y configuraciones
└── 📄 package.json            # Dependencias del frontend
```

### 🗂️ **Arquitectura del Backend**
```
backend/
├── 📁 api/                    # Endpoints REST
│   ├── 📄 auth.php            # Autenticación
│   ├── 📄 clientes.php        # CRUD clientes
│   ├── 📄 facturas.php        # CRUD facturas
│   └── 📄 productos.php       # CRUD productos
├── 📁 models/                 # Modelos de datos
├── 📁 config/                 # Configuración de BD
├── 📁 utils/                  # Utilidades (CORS, respuestas)
└── 📁 database/               # Scripts SQL
```

---

## 📸 Capturas de Pantalla

> - Dashboard principal con estadísticas diarias e historial
<img width="1902" height="878" alt="image" src="https://github.com/user-attachments/assets/5e83d530-59a6-462d-8a91-6cb0a413e38e" />
<img width="1897" height="880" alt="image" src="https://github.com/user-attachments/assets/66e78eb5-24e0-47d6-929f-881cac5bf18f" />

---

> - Creación de facturas
<img width="1909" height="928" alt="image" src="https://github.com/user-attachments/assets/8e42ec39-5873-4ddb-8f0e-746ca184f164" />
<img width="1904" height="882" alt="image" src="https://github.com/user-attachments/assets/1554c168-cb8c-457e-bc3a-79bb26bcdcb8" />
<img width="1886" height="878" alt="image" src="https://github.com/user-attachments/assets/9b5c25bc-71bc-4250-b8de-5861981154cb" />
<img width="1584" height="880" alt="image" src="https://github.com/user-attachments/assets/271f920c-bc86-4b34-bc6e-98730b1ec815" />
<img width="1874" height="883" alt="image" src="https://github.com/user-attachments/assets/1f5bc6b3-c005-4fc1-91bc-f7a1e9024062" />
<img width="1919" height="880" alt="image" src="https://github.com/user-attachments/assets/e47184c3-664c-4c1b-a482-f60151b1947a" />

---

> - Lista de clientes con búsqueda 
<img width="1771" height="880" alt="image" src="https://github.com/user-attachments/assets/e3730b7f-bba2-4056-8486-e6f9616a9777" />

---
> - Vista de productos con categorías
<img width="1887" height="883" alt="image" src="https://github.com/user-attachments/assets/3ae93c34-3b07-4b56-9b2f-31d4c6bcf560" />
<img width="1639" height="876" alt="image" src="https://github.com/user-attachments/assets/9ab700d3-60b6-4703-9a78-d04f257c0099" />
<img width="1898" height="881" alt="image" src="https://github.com/user-attachments/assets/e0626701-9f17-41c9-8d62-9e1b774821b1" />


> - Generación de PDFs (imprime la pantalla completa, simulación) - Está en desarrollo el generador de pdf automático 
<img width="1884" height="958" alt="image" src="https://github.com/user-attachments/assets/8525da75-0652-4a4c-9f3e-6e2781ad40cd" />

## 💻 Instalación y Uso

### 📋 **Prerrequisitos**
- Node.js 18+ 
- PHP 8.3+
- MySQL 8.0+
- Composer

### 🔧 **Instalación del Frontend**

```bash
# Clonar el repositorio
git https://github.com/Ronny-Abreu/SaleSystem_.git
cd SaleSystem

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración

# Ejecutar en modo desarrollo
npm run dev
```

### 🗄️ **Instalación del Backend**

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias PHP
composer install

# Configurar base de datos
# Editar backend/config/database.php con tus credenciales

# Ejecutar migraciones
mysql -u tu_usuario -p tu_base_de_datos < database/create_database.sql
```

### 🚀 **Ejecutar la Aplicación**

```bash
# Frontend (puerto 3000)
npm run dev

# Backend (puerto 8000)
cd backend
php -S localhost:8000
```

---


## 🧑‍💻 Autor

**Ronny De León** - Desarrollador Full Stack

- 📧 **Email:** [dleonabreuronny@gmail.com](mailto:dleonabreuronny@gmail.com)
- 💼 **LinkedIn:** [Ronny Abreu](https://www.linkedin.com/in/ronny-abreu-0a02b6336/)

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Ronny De León

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar el proyecto:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NewFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

<div align="center">

**⭐ Si este proyecto te gusta, ¡dale una estrella en GitHub! ⭐**

</div>
