# SaleSystem

**Nota Importante:** Estás viendo la rama `features_howrk`. Esta rama contiene las instrucciones detalladas para la instalación y puesta en marcha del sistema en un entorno local.

Este es un sistema de ventas desarrollado con Next.js para el frontend y PHP para el backend, utilizando MySQL como base de datos.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente:

*   **XAMPP (o WAMP/MAMP)**: Para el servidor web Apache y la base de datos MySQL.
    *   Descarga XAMPP desde [https://www.apachefriends.org/es/index.html](https://www.apachefriends.org/es/index.html).
*   **Node.js y npm**: Para ejecutar la aplicación Next.js.
    *   Descarga Node.js (que incluye npm) desde [https://nodejs.org/es/](https://nodejs.org/es/).

## Configuración del Proyecto

Sigue estos pasos para poner el sistema en marcha:

### 1. Clonar el Repositorio

Clona este repositorio en tu máquina local:

```bash
git clone <https://github.com/Ronny-Abreu/SaleSystem_.git>
cd SaleSystem
```

### 2. Configuración del Backend (PHP y Base de Datos)

1.  **Mover el Proyecto a `htdocs`:**
    *   Copia la carpeta `SaleSystem` (la raíz de este repositorio) dentro del directorio `htdocs` de tu instalación de XAMPP (por ejemplo, `C:\xampp\htdocs\SaleSystem`).

2.  **Iniciar XAMPP:**
    *   Abre el Panel de Control de XAMPP e inicia los módulos **Apache** y **MySQL**.

3.  **Instalar la Base de Datos:**
    *   Abre tu navegador web y navega a la siguiente URL:
        ```
        http://localhost/SaleSystem/install.php
        ```
    *   Este script creará automáticamente la base de datos `salesystemprueba` (si no existe), eliminará la base de datos si ya existe, y luego creará todas las tablas necesarias e insertará los datos semilla para(usuarios, clientes, productos, etc y categorias_productos).
    *   Verás una interfaz amigable que te indicará el estado de la instalación.

    *   **Nota Importante:** La aplicación Next.js está configurada para conectarse a la base de datos `salesystemprueba` en un entorno local. Si necesitas cambiar esto, edita `backend/config/database.php`.

### 3. Configuración del Frontend (Next.js)

1.  **Navegar a la Raíz del Proyecto:**
    *   Abre tu terminal o línea de comandos y navega a la raíz del proyecto `SaleSystem`:
        ```bash
        cd C:\xampp\htdocs\SaleSystem
        ```

2.  **Instalar Dependencias:**
    *   Instala todas las dependencias de Node.js:
        ```bash
        npm install
        ```

3.  **Iniciar el Servidor de Desarrollo:**
    *   Inicia la aplicación Next.js:
        ```bash
        npm run dev
        ```
    *   La terminal te indicará la URL en la que se está ejecutando la aplicación (generalmente `http://localhost:3000` o `http://localhost:3001` si el puerto 3000 ya está en uso).

## Acceder a la Aplicación

Una vez que el backend (Apache/MySQL) y el frontend (Next.js) estén en ejecución:

*   Si la instalación de la base de datos fue exitosa a través de `install.php`, puedes hacer clic en el botón "Ir al Sistema" para navegar directamente.
*   Alternativamente, abre tu navegador web y ve a la URL que te proporcionó `npm run dev` (por ejemplo, `http://localhost:3001`).

## Credenciales por Defecto

Para iniciar sesión en el sistema:

*   **Usuario Vendedor (Demo):**
    *   **Username:** `Demo`
    *   **Password:** `tareafacil25`

---

¡Listo! Ahora deberías tener el sistema de ventas funcionando en tu entorno local.
Si deseas visitar el entorno listo ya en producción visita la pagina web: https://sale-system-liard.vercel.app/