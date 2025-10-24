# 🕯️ ALUEN - Frontend

Frontend de la aplicación **ALUEN** para gestión de velas artesanales. Interfaz de usuario moderna y responsiva construida con React.

## 🚀 Tecnologías

- **React** (v18) - Librería de UI
- **React Router** (v6) - Navegación
- **Axios** - Cliente HTTP
- **React Bootstrap** - Componentes UI
- **Bootstrap** (v5.2) - Framework CSS
- **Context API** - Gestión de estado global

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Backend desplegado y funcionando

## 🔧 Instalación

### **1. Clonar el repositorio:**
```bash
git clone https://github.com/aluenvelas/Front_aluen.git
cd Front_aluen
```

### **2. Instalar dependencias:**
```bash
npm install
```

### **3. Configurar variables de entorno:**

El frontend ya está configurado para conectarse al backend en Render:
```javascript
// src/services/api.js
const API_URL = 'https://back-aluen.onrender.com/api';
```

Si necesitas cambiar la URL del backend, edita `src/services/api.js` línea 3.

### **4. Iniciar el servidor de desarrollo:**
```bash
npm start
```

La aplicación se abrirá en: http://localhost:3000

## 📁 Estructura del Proyecto

```
Front_aluen/
├── public/
│   ├── index.html
│   ├── logo-aluen.svg        # Logo principal
│   └── manifest.json
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Navbar.js
│   │   ├── Sidebar.js
│   │   ├── RutaProtegida.js
│   │   ├── MaterialForm.js
│   │   ├── MaterialTable.js
│   │   ├── RecetaForm.js
│   │   ├── RecetaTable.js
│   │   ├── RecetaDetalleModal.js
│   │   └── GenericTable.js
│   ├── context/              # Context API
│   │   └── AuthContext.js
│   ├── pages/                # Páginas principales
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── Materiales.js
│   │   ├── Recetas.js
│   │   ├── Frascos.js
│   │   ├── NombresVelas.js
│   │   ├── Activos.js
│   │   ├── Ventas.js
│   │   └── Reportes.js
│   ├── services/             # Servicios API
│   │   └── api.js
│   ├── App.js                # Componente principal
│   ├── index.js              # Punto de entrada
│   └── index.css             # Estilos globales
├── netlify.toml              # Configuración de Netlify
├── package.json
└── README.md
```

## 🎨 Características

### **Diseño ALUEN:**
- ✅ Tema oscuro elegante (negro/gris con dorado/bronce)
- ✅ Logo ALUEN animado
- ✅ Diseño 100% responsivo (móvil, tablet, desktop)
- ✅ Sidebar colapsable en móvil
- ✅ Navbar con botón hamburguesa
- ✅ Efectos visuales y animaciones suaves

### **Autenticación:**
- ✅ Login con JWT
- ✅ Protección de rutas
- ✅ Cierre de sesión automático (401)
- ✅ Almacenamiento seguro de tokens

### **Módulos:**
- ✅ **Dashboard** - Vista general del negocio
- ✅ **Materiales** - Gestión de ceras, esencias, aditivos
- ✅ **Frascos** - Gestión de frascos con imágenes
- ✅ **Nombres de Velas** - Nomenclatura de productos
- ✅ **Recetas** - Creación con descuento automático de inventario
- ✅ **Activos** - Gestión de equipos y herramientas
- ✅ **Ventas** - Registro con descuento de inventario de velas
- ✅ **Reportes** - Inventario, ventas, PDFs

### **Funcionalidades Especiales:**
- ✅ Cálculo automático de costos y precios
- ✅ Gestión de inventario en tiempo real
- ✅ Reportes con alertas de stock bajo
- ✅ Generación de PDFs
- ✅ Proxy para imágenes de Google Drive
- ✅ Modales detallados para recetas y ventas
- ✅ Secciones colapsables en reportes
- ✅ Filtros y búsquedas en tablas

## 📱 Responsive Design

### **Mobile (< 768px):**
- Sidebar oculto por defecto
- Botón hamburguesa (☰) en navbar
- Tablas con scroll horizontal
- Cards compactas
- Botones touch-friendly (≥44px)

### **Tablet (768px - 992px):**
- Sidebar visible
- Layout en 2 columnas
- Tamaños intermedios

### **Desktop (≥ 992px):**
- Sidebar siempre visible
- Layout en 3-4 columnas
- Todos los elementos a tamaño completo

## 🔐 Autenticación

El frontend usa JWT (JSON Web Tokens) para autenticación:

### **Flujo de Login:**
1. Usuario introduce email y contraseña
2. Se envía POST a `/api/auth/login`
3. Backend valida y devuelve token + datos de usuario
4. Frontend guarda en `localStorage`:
   - `token`: JWT token
   - `usuario`: Datos del usuario (nombre, email, rol)
5. Todas las peticiones siguientes incluyen:
   ```
   Authorization: Bearer <token>
   ```

### **Protección de Rutas:**
```javascript
<RutaProtegida>
  <Dashboard />
</RutaProtegida>
```

## 🌐 API Integration

### **Base URL:**
```javascript
const API_URL = 'https://back-aluen.onrender.com/api';
```

### **Endpoints:**
- `POST /auth/login` - Login
- `GET /materiales` - Listar materiales
- `GET /recetas` - Listar recetas
- `GET /frascos` - Listar frascos
- `GET /ventas` - Listar ventas
- `GET /reportes/inventario` - Reporte de inventario
- `GET /reportes-pdf/ventas` - PDF de ventas

Todos los endpoints (excepto login) requieren autenticación JWT.

## 🎨 Tema ALUEN

### **Paleta de Colores:**
```css
--aluen-dark: #2c2c2c           /* Fondo oscuro */
--aluen-darker: #1a1a1a         /* Fondo más oscuro */
--aluen-gold: #b8860b           /* Dorado */
--aluen-gold-light: #d4af37     /* Dorado claro */
--aluen-bronze: #cd7f32         /* Bronce */
--aluen-text-light: #e0e0e0     /* Texto claro */
```

### **Logo:**
- SVG animado con brillo pulsante
- Flor de loto estilizada
- Círculo con puntos decorativos
- Texto "ALUEN" con gradiente dorado

## 🚀 Scripts Disponibles

### **Desarrollo:**
```bash
npm start
```
Inicia el servidor de desarrollo en http://localhost:3000

### **Build de Producción:**
```bash
npm run build
```
Crea una versión optimizada en la carpeta `build/`

### **Tests:**
```bash
npm test
```
Ejecuta los tests

### **Eject (irreversible):**
```bash
npm run eject
```
⚠️ Expone la configuración de Create React App

## 📦 Despliegue en Netlify

### **Método 1: Desde GitHub (Recomendado)**

1. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **En Netlify:**
   - Ve a: https://app.netlify.com
   - Click "New site from Git"
   - Conecta con GitHub
   - Selecciona `aluenvelas/Front_aluen`
   - Configuración automática (lee `netlify.toml`)
   - Click "Deploy site"

3. **Configurar dominio (opcional):**
   - Site settings → Domain management
   - Add custom domain

### **Método 2: Drag & Drop**

1. **Build:**
   ```bash
   npm run build
   ```

2. **Deploy:**
   - Ve a: https://app.netlify.com/drop
   - Arrastra la carpeta `build/`
   - ¡Listo!

## 🔧 Configuración de Netlify

El archivo `netlify.toml` ya incluye:

```toml
[build]
  command = "npm run build"
  publish = "build"
  
[build.environment]
  NODE_VERSION = "18"
  REACT_APP_API_URL = "https://back-aluen.onrender.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🐛 Solución de Problemas

### **Error: "Network Error" al hacer login**
- Verifica que el backend esté online: https://back-aluen.onrender.com/health
- Verifica la URL en `src/services/api.js`

### **Error: "Cannot GET /" después del deploy**
- Netlify necesita redirects para SPA
- Verifica que `netlify.toml` esté en el repositorio

### **Build falla en Netlify**
- Verifica `package.json`
- Mira los logs de build en Netlify
- Verifica que todas las dependencias estén instaladas

### **Backend se duerme (Render Free Plan)**
- Primera petición puede tardar 30-60 segundos
- Las siguientes serán normales
- Considera upgrade a plan de pago

## 📊 Dependencias Principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.15.0",
  "react-bootstrap": "^2.8.0",
  "bootstrap": "^5.2.3",
  "axios": "^1.5.0"
}
```

## 🔒 Seguridad

- ✅ JWT tokens en localStorage
- ✅ Rutas protegidas con `RutaProtegida`
- ✅ Logout automático en 401
- ✅ Headers de seguridad en Netlify
- ✅ HTTPS obligatorio en producción

## 📝 Notas Importantes

### **Registro de Usuarios:**
El endpoint de registro está **deshabilitado** en el backend. Para crear usuarios, contacta al administrador.

### **Imágenes de Google Drive:**
El sistema usa un proxy para evitar problemas de CORS:
- Formato URL: `https://lh3.googleusercontent.com/d/FILE_ID`
- Proxy: `/api/proxy-image?url=...`

## 🌐 URLs

### **Desarrollo:**
```
Frontend: http://localhost:3000
Backend:  https://back-aluen.onrender.com
```

### **Producción:**
```
Frontend: https://tu-sitio.netlify.app
Backend:  https://back-aluen.onrender.com
```

## 📄 Licencia

Este proyecto es privado y pertenece a **ALUEN - Velas Artesanales**.

## 👥 Autor

**ALUEN Team**
- GitHub: [@aluenvelas](https://github.com/aluenvelas)
- Backend: [Back_aluen](https://github.com/aluenvelas/Back_aluen)
- Frontend: [Front_aluen](https://github.com/aluenvelas/Front_aluen)

## 📞 Soporte

Para soporte o consultas, contacta al equipo de desarrollo.

---

## 🚀 Quick Start

```bash
# 1. Clonar
git clone https://github.com/aluenvelas/Front_aluen.git
cd Front_aluen

# 2. Instalar
npm install

# 3. Iniciar
npm start

# 4. Abrir navegador
http://localhost:3000
```

---

**© 2025 ALUEN - Velas Artesanales. Todos los derechos reservados.**
