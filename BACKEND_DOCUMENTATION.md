# 🔧 Documentación Backend - Online Biblioteca

Documentación completa del servidor API REST Node.js con autenticación JWT y gestión de biblioteca.

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Configuración](#configuración)
3. [Autenticación y Autorización](#autenticación-y-autorización)
4. [Endpoints](#endpoints)
5. [Middleware](#middleware)
6. [Estructura de Base de Datos](#estructura-de-base-de-datos)
7. [Funciones Utilitarias](#funciones-utilitarias)
8. [Manejo de Errores](#manejo-de-errores)

---

## 🏗️ Arquitectura General

### Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: LowDB (JSON almacenado en `database/db.json`)
- **Autenticación**: JWT (JSON Web Tokens)
- **Hashing**: bcryptjs para contraseñas
- **CORS**: Habilitado para solicitudes desde frontend
- **Servicio**: json-server Service para CRUD automatizado

### Archivos Principales

```
api/
├── server.js           # Servidor principal
├── package.json        # Dependencies
└── .env               # Variables de entorno

database/
└── db.json            # Base de datos JSON
```

### Puertos y URLs

- **Puerto**: 4000 (configurable con `PORT`)
- **URL Base**: `http://localhost:4000`
- **Endpoints Públicos**: Solo `/auth/*` sin token
- **Endpoints Protegidos**: Requieren Bearer token

---

## ⚙️ Configuración

### Variables de Entorno (`.env`)

```env
# Puerto del servidor (default: 4000)
PORT=4000

# Clave para firmar JWT (usar algo seguro en producción!)
JWT_SECRET=dev_secret_change_me

# Tiempo de expiración del JWT
JWT_EXPIRES_IN=2h
```

### Constantes del Servidor

```javascript
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = "2h";
```

**Important**: En producción, cambiar `JWT_SECRET` a algo más seguro.

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

1. **Registro** (`POST /auth/register`)
   - Usuario envía cedula, nombres, email, contraseña
   - Backend valida duplicados y campos obligatorios
   - Hash de contraseña con bcryptjs
   - Se genera JWT y se retorna con el usuario

2. **Login** (`POST /auth/login`)
   - Usuario envía email y contraseña
   - Backend verifica credenciales con bcrypt
   - Se genera JWT válido por 2 horas
   - Token se guarda en localStorage del front

3. **Verificación** (`GET /auth/me`)
   - Frontend verifica el token enviando `Authorization: Bearer {token}`
   - Devuelve datos del usuario decodificados

### Roles y Permisos

#### Roles Disponibles

```javascript
const ROLE_ADMIN = "admin";   // Valor: "admin"
const ROLE_USER = "user";     // Valor: "user"
```

- **`ROLE_USER`** (por defecto, asignado en registro)
  - Puede ver/editar su propio perfil
  - Puede crear y gestionar sus alquileres
  - **No puede**: acceder a datos de otros usuarios

- **`ROLE_ADMIN`**
  - Acceso total a todas las colecciones
  - Puede crear/editar/eliminar libros, usuarios, alquileres
  - Puede asignar roles a otros usuarios

### Payload del JWT

```javascript
{
  id: "1",                    // ID del usuario
  correo: "user@email.com",   // Email del usuario
  estado: true,               // ¿Usuario activo?
  rol: "user" | "admin"       // Rol del usuario
  // expirado en 2 horas
}
```

### Header de Autorización

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔌 Endpoints

### Autenticación

#### `POST /auth/register` - Registrar usuario

Crea un nuevo usuario en el sistema

**Request Body**:
```json
{
  "cedula": "0999999999",
  "nombreCompleo": "Juan",
  "apellidoCompleto": "Pérez",
  "telefono": "0999999999",
  "dirreccion": "Calle Principal 123",
  "correo": "juan@example.com",
  "contrasena": "password123"
}
```

**Response (201)** - Éxito:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "cedula": "0999999999",
    "nombreCompleo": "Juan",
    "apellidoCompleto": "Pérez",
    "telefono": "0999999999",
    "dirreccion": "Calle Principal 123",
    "correo": "juan@example.com",
    "estado": true,
    "rol": "user"
  }
}
```

**Response (400)** - Error:
- Falta como campos obligatorios
- Cédula duplicada: "Ya existe un usuario con esta cédula."
- Email duplicado: "Ya existe un usuario con este correo electrónico."

**Validaciones**:
- `cedula`, `correo`, `contrasena`, `nombreCompleo`, `apellidoCompleto` son obligatorios
- `telefono` y `dirreccion` son opcionales
- La contraseña se hashea con bcryptjs antes de guardar (nunca se almacena en plano)

---

#### `POST /auth/login` - Iniciar sesión

Autentica un usuario existente

**Request Body**:
```json
{
  "correo": "juan@example.com",
  "contrasena": "password123"
}
```

**Response (200)** - Éxito:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "cedula": "0999999999",
    "nombreCompleo": "Juan",
    "apellidoCompleto": "Pérez",
    "correo": "juan@example.com",
    "estado": true,
    "rol": "user"
  }
}
```

**Response (401)** - Error:
- Email/contraseña incorrectos: "Credenciales inválidas."
- Usuario desactivado (`estado: false`): "Credenciales inválidas."
- Falta email o contraseña: "Correo y contraseña son obligatorios."

---

#### `GET /auth/me` - Verificar token

Valida el token JWT y retorna los datos decodificados

**Headers**:
```
Authorization: Bearer {token}
```

**Response (200)** - Éxito:
```json
{
  "user": {
    "id": "1",
    "correo": "juan@example.com",
    "estado": true,
    "rol": "user"
  }
}
```

**Response (401)** - Error:
- Token no proporcionado: "Token no proporcionado"
- Token inválido/expirado: "Token inválido o expirado"

---

### Usuarios - Perfil Personal

#### `GET /usuarios/:id` - Obtener propio perfil

Solo el usuario autenticado puede ver su propio perfil

**Headers**:
```
Authorization: Bearer {token}
```

**Parámetros**:
- `id` (path): ID del usuario (debe coincidir con `req.user.id`)

**Response (200)** - Éxito (sin contraseña):
```json
{
  "id": "1",
  "cedula": "0999999999",
  "nombreCompleo": "Juan",
  "apellidoCompleto": "Pérez",
  "telefono": "0999999999",
  "dirreccion": "Calle Principal 123",
  "correo": "juan@example.com",
  "estado": true,
  "rol": "user"
}
```

**Response (403)** - Acceso denegado:
- Intentar acceder a perfil de otro usuario: "No autorizado para este recurso"

**Response (404)** - No encontrado:
- El usuario no existe: `{}`

---

#### `PATCH /usuarios/:id` - Actualizar perfil

Solo el usuario autenticado puede actualizar su propio perfil

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parámetros**:
- `id` (path): ID del usuario (debe coincidir con `req.user.id`)

**Request Body** - Campos permitidos:
```json
{
  "nombreCompleo": "Juan Carlos",        // Nombre (opcional)
  "apellidoCompleto": "Pérez González", // Apellido (opcional)
  "telefono": "0988888888",              // Teléfono (opcional)
  "dirreccion": "Calle Nueva 456",       // Dirección (opcional)
  "correo": "nuevoemail@example.com",    // Email (opcional, único)
  "contrasena": "newpassword123"         // Contraseña (opcional, se hashea)
}
```

**Response (200)** - Éxito (sin contraseña):
```json
{
  "id": "1",
  "cedula": "0999999999",
  "nombreCompleo": "Juan Carlos",
  "apellidoCompleto": "Pérez González",
  "telefono": "0988888888",
  "dirreccion": "Calle Nueva 456",
  "correo": "nuevoemail@example.com",
  "estado": true,
  "rol": "user"
}
```

**Response (400)** - Error:
- Email duplicado: "Ya existe un usuario con este correo electrónico."

**Response (403)** - Acceso denegado:
- Intentar actualizar perfil de otro usuario: "No autorizado para este recurso"

**Response (404)** - No encontrado:
- El usuario no existe: `{}`

**Validaciones**:
- Solo se aceptan dos campos permitidos: `nombreCompleo`, `apellidoCompleto`, `telefono`, `dirreccion`, `correo`, `contrasena`
- El correo debe ser único
- La contraseña se hashea automáticamente

---

### Libros (CRUD)

Endpoints RESTful para gestión de libros. **Requieren token** para POST/PUT/PATCH/DELETE.

#### `GET /libros` - Listar libros con filtros

Obtiene una lista de libros con soporte para filtrado y búsqueda

**Query Parameters**:
```
?titulo_like=1984              // Búsqueda parcial en título
&autor_like=George             // Búsqueda parcial en autor
&categoria=Distopia            // Filtro exacto por categoría
&idioma=Ingles                 // Filtro exacto por idioma
&disponible=true               // Filtro por disponibilidad
&anioPublicacion_gte=1950      // Año mínimo
&anioPublicacion_lte=2000      // Año máximo
&_sort=anioPublicacion         // Campo para ordenar
&_order=asc                    // Dirección: asc|desc
&_page=1                       // Número de página (json-server)
&_per_page=10                  // Libros por página (json-server)
```

**Response (200)**:
```json
[
  {
    "id": "2",
    "titulo": "1984",
    "autor": "George Orwell",
    "anioPublicacion": 1949,
    "isbn": "9780451524935",
    "categoria": "Distopia",
    "idioma": "Ingles",
    "portada": "https://covers.openlibrary.org/b/id/7222246-L.jpg",
    "sinopsis": "Un mundo vigilado por el Gran Hermano.",
    "criticas": "Impactante y vigente.",
    "disponible": false
  }
]
```

---

#### `GET /libros/:id` - Obtener libro por ID

Obtiene un libro específico

**Parámetros**:
- `id` (path): ID del libro

**Response (200)** - Éxito:
```json
{
  "id": "2",
  "titulo": "1984",
  "autor": "George Orwell",
  "anioPublicacion": 1949,
  "isbn": "9780451524935",
  "categoria": "Distopia",
  "idioma": "Ingles",
  "portada": "https://covers.openlibrary.org/b/id/7222246-L.jpg",
  "sinopsis": "Un mundo vigilado por el Gran Hermano.",
  "criticas": "Impactante y vigente.",
  "disponible": false
}
```

**Response (404)** - No encontrado:
```json
{}
```

---

#### `POST /libros` - Crear libro

Crea un nuevo libro (requiere token)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "titulo": "Nuevo Libro",
  "autor": "Autor Famoso",
  "anioPublicacion": 2024,
  "isbn": "9999999999999",
  "categoria": "Novela",
  "idioma": "Espanol",
  "portada": "https://example.com/portada.jpg",
  "sinopsis": "Una sinopsis del libro",
  "criticas": "Críticas y reseñas",
  "disponible": true
}
```

**Response (201)** - Éxito:
```json
{
  "id": "20",
  "titulo": "Nuevo Libro",
  "autor": "Autor Famoso",
  ...resto de campos...
}
```

**Response (400)** - Validación:
- Body no es un objeto válido: `{}`

---

#### `PUT /libros/:id` - Reemplazar libro

Reemplaza completamente un libro (requiere token)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Parámetros**:
- `id` (path): ID del libro

**Request Body**: Todos los campos (reemplazo completo)
```json
{
  "titulo": "1984 - Versión Actualizada",
  "autor": "George Orwell",
  ...
}
```

**Response (200)** - Éxito:
```json
{
  "id": "2",
  "titulo": "1984 - Versión Actualizada",
  "autor": "George Orwell",
  ...
}
```

---

#### `PATCH /libros/:id` - Actualizar parcialmente

Actualiza solo los campos proporcionados (requiere token)

**Parámetros**:
- `id` (path): ID del libro

**Request Body**: Solo campos a actualizar
```json
{
  "disponible": false,
  "criticas": "Actualizado con nuevas críticas"
}
```

**Response (200)** - Éxito:
```json
{
  "id": "2",
  "titulo": "1984",
  ...resto de campos sin cambios...
  "disponible": false,
  "criticas": "Actualizado con nuevas críticas"
}
```

---

#### `DELETE /libros/:id` - Eliminar libro

Elimina un libro (requiere token)

**Parámetros**:
- `id` (path): ID del libro

**Response (200)** - Éxito:
```json
{
  "id": "2",
  "titulo": "1984",
  ...
}
```

---

### Alquileres (CRUD)

Endpoints para gestión de alquileres. Requieren token para modificaciones.

#### `GET /alquileres` - Listar alquileres

- **Con token**: Devuelve solo los alquileres del usuario autenticado
- **Sin token**: Devuelve todos los alquileres (no debería ocurrir si RequireAuth está activo)

**Headers** (recomendado):
```
Authorization: Bearer {token}
```

**Query Parameters**:
```
?_page=1                 // Número de página
&_limit=10               // Alquileres por página
```

**Response (200)**:
```json
[
  {
    "id": "1",
    "usuarioId": 1,
    "librosIds": [2, 5],
    "fechaInicio": "2024-02-12",
    "fechaFin": "2024-02-26",
    "estado": true
  }
]
```

**Headers en respuesta**:
```
X-Total-Count: 5   # Total de alquileres del usuario
```

---

#### `GET /alquileres/:id` - Obtener alquiler

Obtiene un alquiler específico

**Parámetros**:
- `id` (path): ID del alquiler

**Response (200)** - Éxito:
```json
{
  "id": "1",
  "usuarioId": 1,
  "librosIds": [2, 5],
  "fechaInicio": "2024-02-12",
  "fechaFin": "2024-02-26",
  "estado": true
}
```

---

#### `POST /alquileres` - Crear alquiler

Crea un nuevo alquiler (requiere token, fuerza `usuarioId`)

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "librosIds": [2, 5],
  "fechaInicio": "2024-02-12",
  "fechaFin": "2024-02-26",
  "estado": true
}
```

**Nota importante**: 
- `usuarioId` se establece automáticamente del token
- No se puede crear alquiler para otro usuario
- El frontend debe enviar `librosIds` (array de IDs de libros)

**Response (201)** - Éxito:
```json
{
  "id": "10",
  "usuarioId": 1,
  "librosIds": [2, 5],
  "fechaInicio": "2024-02-12",
  "fechaFin": "2024-02-26",
  "estado": true
}
```

---

#### `PUT /alquileres/:id` - Reemplazar alquiler

Reemplaza un alquiler completo (requiere token)

**Parámetros**:
- `id` (path): ID del alquiler

**Response (200)** - Éxito:
```json
{
  "id": "1",
  "usuarioId": 1,
  "librosIds": [2, 5, 7],
  "fechaInicio": "2024-02-12",
  "fechaFin": "2024-03-12",
  "estado": true
}
```

---

#### `PATCH /alquileres/:id` - Actualizar parcialmente

Actualiza solo campos específicos (un uso común es actualizar `fechaFin`)

**Request Body**:
```json
{
  "fechaFin": "2024-03-15"
}
```

**Response (200)** - Éxito:
```json
{
  "id": "1",
  "usuarioId": 1,
  "librosIds": [2, 5],
  "fechaInicio": "2024-02-12",
  "fechaFin": "2024-03-15",
  "estado": true
}
```

---

#### `DELETE /alquileres/:id` - Eliminar alquiler

Elimina un alquiler (requiere token)

**Parámetros**:
- `id` (path): ID del alquiler

**Response (200)** - Éxito:
```json
{
  "id": "1",
  "usuarioId": 1,
  "librosIds": [2, 5],
  ...
}
```

---

## 🔧 Middleware

### `authMiddleware`

**Ubicación**: Línea 62

**Descripción**: Protege rutas que hacen cambios con POST, PUT, PATCH, DELETE

**Lógica**:
- Verifica que el método sea POST, PUT, PATCH o DELETE
- Ignora rutas `/auth/*`
- Extrae el token del header `Authorization: Bearer {token}`
- Valida y decodifica el JWT
- Establece `req.user` con los datos del token

**Respuestas de Error**:
- `401` sin token: "Token no proporcionado"
- `401` token inválido: "Token inválido o expirado"

```javascript
// Se aplica a: POST/PUT/PATCH/DELETE (excepto /auth/*)
app.use(authMiddleware);
```

---

### `requireAuthForProfile`

**Ubicación**: Línea 160

**Descripción**: Requiere token explícitamente

**Uso**: Endpoints de perfil y alquileres personalizados

**Parámetros**: Ninguno

```javascript
app.get("/usuarios/:id", requireAuthForProfile, requireOwnUser, ...);
app.post("/alquileres", requireAuthForProfile, ...);
```

---

### `requireOwnUser`

**Ubicación**: Línea 172

**Descripción**: Valida que `req.user.id` coincida con `req.params.id`

**Uso**: Proteger endpoints de perfil personal

```javascript
app.patch("/usuarios/:id", requireAuthForProfile, requireOwnUser, ...);
```

---

### `optionalAuth`

**Ubicación**: Línea 238

**Descripción**: Decodifica el token si existe, pero permite continuar sin él

**Uso**: Endpoints que pueden funcionar autenticados o no

**Lógica**:
- Si hay token válido, establece `req.user`
- Si no hay token o es inválido, continúa sin `req.user`

```javascript
app.get("/alquileres", optionalAuth, ...);
```

---

### `apiMiddleware`

**Ubicación**: Línea 329

**Descripción**: Valida que la colección solicitada sea válida

**Validaciones**:
- No permite acceso directo a `/auth` (ya tiene rutas específicas)
- Verifica que la colección exista en el Service

```javascript
app.get("/:name", apiMiddleware, ...);
app.post("/:name", apiMiddleware, ...);
```

---

## 📦 Estructura de Base de Datos

Archivo: `database/db.json`

### Colección: `usuarios`

```json
{
  "id": "1",
  "cedula": "0999999999",
  "nombreCompleo": "Juan",
  "apellidoCompleto": "Pérez",
  "telefono": "0999999999",
  "dirreccion": "Calle Principal 123",
  "correo": "juan@example.com",
  "contrasena": "$2b$10$...",  // Hasheada con bcryptjs
  "estado": true,               // ¿Usuario activo?
  "rol": "user"                 // "user" o "admin"
}
```

**Índices naturales**:
- `id` - Identificador único
- `cedula` - Debe ser única
- `correo` - Debe ser única

---

### Colección: `libros`

```json
{
  "id": "1",
  "titulo": "Cien años de soledad",
  "autor": "Gabriel García Márquez",
  "anioPublicacion": 1967,
  "isbn": "9788432225072",
  "categoria": "Novela",         // Ver CATEGORIAS en constant.ts
  "idioma": "Espanol",           // Ver IDIOMAS en constant.ts
  "portada": "https://...",      // URL de imagen (Cloudinary)
  "sinopsis": "La historia...",
  "criticas": "Obra maestra...",
  "disponible": true             // ¿Disponible para alquilar?
}
```

**Campos**:
- `portada` - URL de imagen almacenada en Cloudinary
- `disponible` - Se actualiza cuando se crea/borra un alquiler

---

### Colección: `alquileres`

```json
{
  "id": "1",
  "usuarioId": 1,               // ID del usuario que alquila
  "librosIds": [2, 5],          // Array de IDs de libros
  "fechaInicio": "2024-02-12",  // Formato YYYY-MM-DD
  "fechaFin": "2024-02-26",     // Formato YYYY-MM-DD
  "estado": true                // ¿Alquiler activo?
}
```

**Relaciones**:
- `usuarioId` referencia a `usuarios.id`
- Cada ID en `librosIds` referencia a `libros.id`

---

## 🛠️ Funciones Utilitarias

### `generateId(collectionName)`

**Ubicación**: Línea 27

**Descripción**: Genera un nuevo ID incremental (string) para una colección

**Parámetros**:
- `collectionName` (string): Nombre de la colección ("usuarios", "libros", "alquileres")

**Retorna**: `string` - ID numérico como string (ej: "5")

**Lógica**:
1. Obtiene el máximo ID actual convertido a número
2. Suma 1 y retorna como string
3. Si la colección está vacía, retorna "1"

**Ejemplo**:
```javascript
const newId = generateId("libros"); // "8" (si max era 7)
```

---

### `generateToken(user)`

**Ubicación**: Línea 44

**Descripción**: Genera un JWT firmado para un usuario

**Parámetros**:
- `user` (IUser): Objeto del usuario

**Retorna**: `string` - Token JWT

**Payload del token**:
```javascript
{
  id: user.id,
  correo: user.correo,
  estado: user.estado,
  rol: user.rol === ROLE_ADMIN ? ROLE_ADMIN : ROLE_USER
}
```

**Opciones**:
- Firmado con `JWT_SECRET`
- Expira en `JWT_EXPIRES_IN` (2 horas)

**Ejemplo**:
```javascript
const token = generateToken(newUser);
// Retorna: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Ejemplo |
|--------|------------|---------|
| **200** | OK - Operación exitosa | GET, PATCH, DELETE |
| **201** | Creado - Nuevo recurso creado | POST |
| **400** | Bad Request - Datos inválidos | Campos duplicados, body vacío |
| **401** | No autorizado - Token faltante/inválido | Sin Bearer token, token expirado |
| **403** | Prohibido - No tiene permiso | Acceder a datos de otro usuario |
| **404** | No encontrado - Recurso no existe | ID inexistente |
| **500** | Error interno del servidor | Exceptions no controladas |

---

### Respuestas de Error Comunes

#### Falta de Autenticación
```json
{
  "message": "Token no proporcionado"
}
```
**Estatus**: 401

#### Token Inválido
```json
{
  "message": "Token inválido o expirado"
}
```
**Estatus**: 401

#### Email/Cédula Duplicada
```json
{
  "message": "Ya existe un usuario con este correo electrónico."
}
```
**Estatus**: 400

#### No Autorizado
```json
{
  "message": "No autorizado para este recurso"
}
```
**Estatus**: 403

#### Recurso No Encontrado
```json
{}
```
**Estatus**: 404

---

## 🔄 Flujos Típicos de la Aplicación

### Registro e Inicio de Sesión

```
1. POST /auth/register
   ├─ Validar campos obligatorios
   ├─ Verificar cédula única
   ├─ Verificar email único
   ├─ Hash de contraseña con bcryptjs
   ├─ Guardar usuario en BD
   └─ Retornar {token, user}

2. POST /auth/login
   ├─ Validar email + contraseña proporcionados
   ├─ Buscar usuario por email
   ├─ Verificar si está activo (estado: true)
   ├─ Comparar contraseña con bcryptjs
   ├─ Generar JWT
   └─ Retornar {token, user}

3. Frontend guarda token en localStorage

4. GET /auth/me (opcional, para verificar)
   ├─ Extrae token del header
   ├─ Verifica JWT
   └─ Retorna datos del usuario
```

---

### Crear Alquiler

```
1. POST /alquileres (con Bearer token)
   ├─ authMiddleware valida token
   ├─ requireAuthForProfile verifica token
   ├─ usuarioId se fuerza del token (req.user.id)
   ├─ Body contiene: librosIds, fechaInicio, fechaFin, estado
   ├─ Service.create() genera ID y guardar
   ├─ Frontend DESPUÉS actualiza disponibilidad de libros:
   │  └─ Para cada libro en librosIds:
   │     ├─ PATCH /libros/:id {disponible: false}
   │     └─ Si una falla, DELETE /alquileres/:id (rollback)
   └─ Retornar {id, usuarioId, librosIds, ...}
```

---

### Obtener Alquileres Personales

```
1. GET /alquileres (con Bearer token)
   ├─ optionalAuth decodifica token (req.user.id existe)
   ├─ Filtra alquileres por usuarioId === req.user.id
   ├─ Aplica paginación (_page, _limit)
   └─ Retorna array filtrado + header X-Total-Count
```

---

## 🔍 Ejemplo de Sesión Completa

### 1. Registro
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "0999999999",
    "nombreCompleo": "Juan",
    "apellidoCompleto": "Pérez",
    "telefono": "555-1234",
    "dirreccion": "Calle 1",
    "correo": "juan@example.com",
    "contrasena": "password123"
  }'
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "3",
    "cedula": "0999999999",
    "nombreCompleo": "Juan",
    ...
    "rol": "user"
  }
}
```

### 2. Guardar Token
```javascript
const token = response.token;
localStorage.setItem("online-biblioteca-auth", 
  JSON.stringify({ token, user: response.user })
);
```

### 3. Usar Token en Siguiente Petición
```bash
curl -X GET http://localhost:4000/usuarios/3 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Crear Alquiler
```bash
curl -X POST http://localhost:4000/alquileres \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "librosIds": [1, 2],
    "fechaInicio": "2024-02-12",
    "fechaFin": "2024-02-26",
    "estado": true
  }'
```

---

## 📤 Deployment

### Variables de Entorno en Producción

```env
PORT=4000
NODE_ENV=production
JWT_SECRET=<cambiar a algo seguro>
```

**Importante**: 
- Cambiar `JWT_SECRET` a un valor aleatorio y seguro
- Usar HTTPS en producción
- Validar variables de entorno antes de iniciar

### Iniciar el Servidor

```bash
npm install
npm start        # o node api/server.js
```

El servidor escuchará en `http://localhost:4000`

---

## 🐛 Troubleshooting

### "Token inválido o expirado"
- El JWT expira en 2 horas. El usuario debe hacer login nuevamente
- Verificar que `JWT_SECRET` sea el mismo en el servidor

### "Credenciales inválidas"
- Email no existe: verificar que el usuario esté registrado
- Contraseña incorrecta: verificar mayúsculas/minúsculas
- Usuario desactivado: verificar `estado` en BD

### "No autorizado para este recurso"
- Intentando acceder al perfil de otro usuario
- Cada usuario solo puede ver/modificar su propio perfil

### "Ya existe un usuario con esta cédula"
- Cédula ya registrada en la BD
- No se pueden registrar dos usuarios con la misma cédula

---

_Documentación Backend actualizada: 12 de febrero de 2025_
