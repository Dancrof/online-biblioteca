# 📚 Documentación del Proyecto - Online Biblioteca

Documentación completa de métodos, funciones y constantes del sistema de gestión de biblioteca en línea.

---

## 📋 Tabla de Contenidos

1. [Constantes](#constantes)
2. [Interfaces](#interfaces)
3. [Services](#services)
4. [Contexts](#contexts)
5. [Componentes Principales](#componentes-principales)

---

## 🔧 Constantes

### Ubicación: `src/Config/constant.ts`

#### `api`
- **Descripción**: Instancia de Axios configurada como cliente HTTP global
- **Configuración**:
  - `baseURL`: URL base de la API (desde `VITE_URL_API`)
  - `headers`: Content-Type application/json
- **Interceptores**: Automáticamente añade el token JWT en el header `Authorization: Bearer {token}` si existe en localStorage
- **Uso**: Se importa en todos los Services para hacer peticiones HTTP

```typescript
import { api } from "../Config/constant";
api.get('/libros') // Ejemplo de uso
```

#### `AUTH_STORAGE_KEY`
- **Valor**: `"online-biblioteca-auth"`
- **Descripción**: Clave de almacenamiento en localStorage para guardar datos de autenticación (token y usuario)

#### `EMAIL_REGEX`
- **Valor**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Descripción**: Expresión regular para validar direcciones de correo electrónico
- **Uso**: Validación de campos de email en formularios

#### `ITEMS_PER_PAGE`
- **Tipo**: `number`
- **Descripción**: Cantidad de items a mostrar por página en listados (paginación)
- **Valor por defecto**: Se configura desde `VITE_ITEMS_PER_PAGE`

#### `ANIO_MIN`
- **Tipo**: `number`
- **Descripción**: Año mínimo permitido para los libros
- **Valor por defecto**: Se configura desde `VITE_ANIO_MIN`

#### `ANIO_MAX`
- **Tipo**: `number`
- **Descripción**: Año máximo permitido para los libros
- **Valor por defecto**: Se configura desde `VITE_ANIO_MAX`

#### `CATEGORIAS`
- **Tipo**: `string[]`
- **Valor**: `["Novela", "Distopia", "Fabula", "Romance", "Fantasia", "Misterio"]`
- **Descripción**: Lista de categorías disponibles para clasificar libros

#### `IDIOMAS`
- **Tipo**: `Array<{value: string, label: string}>`
- **Descripción**: Lista de idiomas disponibles para los libros
- **Items**:
  - `{value: "", label: "Todos"}` - Opción para mostrar todos
  - `{value: "Espanol", label: "Español"}`
  - `{value: "Ingles", label: "Inglés"}`
  - `{value: "Frances", label: "Francés"}`
  - `{value: "Ruso", label: "Ruso"}`
  - `{value: "Indio", label: "Indio"}`

#### `CLOUDINARY_CLOUD_NAME`
- **Tipo**: `string`
- **Descripción**: Nombre de la nube de Cloudinary para almacenar imágenes
- **Valor**: Se configura desde `VITE_CLOUDINARY_CLOUD_NAME` (actual: `dfagxcqpy`)

#### `CLOUDINARY_UPLOAD_PRESET`
- **Tipo**: `string`
- **Descripción**: Preset de carga sin autenticar para Cloudinary
- **Valor**: Se configura desde `VITE_CLOUDINARY_UPLOAD_PRESET` (actual: `librosImages`)

**Nota**: `ROLE_ADMIN` ahora se define directamente en `AppRouter.tsx` con el valor `"admin"` para evitar importaciones circulares

---

## 📦 Interfaces

### Ubicación: `src/interfaces/`

#### `IUser.ts`

```typescript
export type UserRole = "user" | "admin";

export interface IUser {
  id: number;                  // ID único del usuario
  cedula: string;              // Cédula de identidad
  nombreCompleo: string;       // Primer nombre o nombre completo
  apellidoCompleto: string;    // Apellidos del usuario
  telefono: string;            // Número de teléfono
  dirreccion: string;          // Dirección física
  correo: string;              // Email del usuario
  contrasena: string;          // Contraseña (nunca se expone en cliente)
  estado: boolean;             // ¿Usuario activo?
  rol?: UserRole;              // Rol: "user" o "admin"
}
```

#### `IBook.ts`

```typescript
export interface Book {
  id: number;              // ID único del libro
  titulo: string;          // Título del libro
  autor: string;           // Autor del libro
  anioPublicacion: number; // Año de publicación
  isbn: string;            // ISBN del libro
  categoria: string;       // Categoría (Novela, Distopia, etc.)
  idioma: string;          // Idioma del libro
  portada: string;         // URL de la imagen de portada
  sinopsis: string;        // Resumen del libro
  criticas: string;        // Opiniones/críticas
  disponible: boolean;     // ¿Está disponible para alquilar?
}

export interface BookFiltersState {
  categoria: string | null;    // Filtro por categoría
  idioma: string | null;       // Filtro por idioma
  anioMax: number | null;      // Filtro año máximo
  soloDisponibles: boolean;    // Solo mostrar disponibles
  searchText?: string;         // Búsqueda libre (título, autor, ISBN)
}

export interface BookQueryParams {
  titulo?: string;             // Búsqueda por título (like)
  autor?: string;              // Búsqueda por autor (like)
  categoria?: string;          // Filtro exacto por categoría
  idioma?: string;             // Filtro exacto por idioma
  disponible?: boolean;        // Filtro de disponibilidad
  anioPublicacion?: number;    // Año exacto
  anioMin?: number;            // Año mínimo (anioPublicacion_gte)
  anioMax?: number;            // Año máximo (anioPublicacion_lte)
  sort?: keyof Book;           // Campo para ordenar
  order?: "asc" | "desc";      // Dirección del ordenamiento
}
```

#### `IRent.ts`

```typescript
export interface IRent {
  id: number;           // ID único del alquiler
  usuarioId: number;    // ID del usuario que alquila
  librosIds: number[];  // Array de IDs de libros alquilados
  fechaInicio: string;  // Fecha de inicio (formato: YYYY-MM-DD)
  fechaFin: string;     // Fecha de fin (formato: YYYY-MM-DD)
  estado: boolean;      // ¿Alquiler activo?
}
```

#### `IPaginate.ts`

```typescript
export interface IPaginate<T> {
  data: T[];          // Array de items de la página actual
  first: number;      // Número de primera página
  prev: number | null; // Número de página anterior (null si es primera)
  next: number;       // Número de siguiente página
  last: number;       // Número de última página
  pages: number;      // Total de páginas
  items: number;      // Total de items en todas las páginas
}
```

---

## 🔌 Services

### Ubicación: `src/Services/`

---

### BookService.ts

#### `getBooks(paginaActual, cantidadPorPagina, queryParams)`

- **Descripción**: Obtiene una página de libros con paginación y filtros opcionales
- **Parámetros**:
  - `paginaActual` (number, default: 1): Número de página
  - `cantidadPorPagina` (number, default: 4): Cantidad de libros por página
  - `queryParams` (BookQueryParams, optional): Filtros adicionales
- **Retorna**: `Promise<IPaginate<Book>>`
- **Ejemplo**:
  ```typescript
  const result = await getBooks(1, 10, {
    categoria: "Novela",
    soloDisponibles: true
  });
  ```

#### `getBookById(id)`

- **Descripción**: Obtiene un libro específico por su ID
- **Parámetros**:
  - `id` (number): ID del libro
- **Retorna**: `Promise<Book | null>`
- **Ejemplo**:
  ```typescript
  const book = await getBookById(5);
  ```

#### `filterBooks(params)`

- **Descripción**: Filtra libros sin paginación (retorna todos los resultados)
- **Parámetros**:
  - `params` (BookQueryParams): Criterios de filtrado
- **Retorna**: `Promise<Book[]>`
- **Ejemplo**:
  ```typescript
  const availableBooks = await filterBooks({ disponible: true });
  ```

#### `patchBookDisponible(id, disponible)`

- **Descripción**: Actualiza el estado de disponibilidad de un libro
- **Parámetros**:
  - `id` (number): ID del libro
  - `disponible` (boolean): Nuevo estado de disponibilidad
- **Retorna**: `Promise<Book | null>`
- **Validaciones**: Verifica que el ID sea válido (no nulo, no NaN, > 0)
- **Ejemplo**:
  ```typescript
  await patchBookDisponible(5, false); // Marcar como no disponible
  ```

#### `filtersToQueryParams(filters)`

- **Descripción**: Convierte BookFiltersState a BookQueryParams
- **Parámetros**:
  - `filters` (BookFiltersState): Estado de filtros del sidebar
- **Retorna**: `BookQueryParams`
- **Ejemplo**:
  ```typescript
  const queryParams = filtersToQueryParams({
    categoria: "Novela",
    soloDisponibles: true
  });
  ```

#### `postBook(book)`

- **Descripción**: Crea un nuevo libro (solo admin)
- **Parámetros**:
  - `book` (Omit<Book, "id">): Datos del libro sin ID
- **Retorna**: `Promise<Book | null>`
- **Ejemplo**:
  ```typescript
  const newBook = await postBook({
    titulo: "1984",
    autor: "George Orwell",
    // ... resto de propiedades
  });
  ```

#### `putBook(id, book)`

- **Descripción**: Actualiza un libro existente (solo admin)
- **Parámetros**:
  - `id` (number): ID del libro
  - `book` (Omit<Book, "id">): Nuevos datos del libro
- **Retorna**: `Promise<Book | null>`
- **Ejemplo**:
  ```typescript
  const updated = await putBook(5, { titulo: "Nuevo Título" });
  ```

#### `deleteBook(id)`

- **Descripción**: Elimina un libro (solo admin)
- **Parámetros**:
  - `id` (number): ID del libro a eliminar
- **Retorna**: `Promise<boolean>` (true si se eliminó, false si fallo)
- **Ejemplo**:
  ```typescript
  const deleted = await deleteBook(5);
  ```

---

### AuthService.ts

#### `login(payload)`

- **Descripción**: Autentica un usuario con email y contraseña
- **Parámetros**:
  - `payload` (LoginPayload):
    - `correo`: Email del usuario
    - `contrasena`: Contraseña
- **Retorna**: `Promise<AuthResponse>` con token y usuario
- **Ejemplo**:
  ```typescript
  const response = await login({
    correo: "user@example.com",
    contrasena: "password123"
  });
  // response.token se guarda en localStorage automáticamente
  ```

#### `register(payload)`

- **Descripción**: Registra un nuevo usuario
- **Parámetros**:
  - `payload` (RegisterPayload):
    - `cedula`, `nombreCompleo`, `apellidoCompleto`, `telefono`, `dirreccion`, `correo`, `contrasena`
- **Retorna**: `Promise<AuthResponse>`
- **Ejemplo**:
  ```typescript
  const response = await register({
    cedula: "12345678",
    nombreCompleo: "Juan",
    apellidoCompleto: "Pérez",
    // ... resto de propiedades
  });
  ```

---

### RentService.ts

#### `getRents(paginaActual, cantidadPorPagina)`

- **Descripción**: Obtiene una página de alquileres
- **Parámetros**:
  - `paginaActual` (number, default: 1): Número de página
  - `cantidadPorPagina` (number, default: 8): Alquileres por página
- **Retorna**: `Promise<IPaginate<IRent>>`
- **Compatibilidad**: Funciona con json-server (interpreta X-Total-Count)
- **Ejemplo**:
  ```typescript
  const rents = await getRents(1, 10);
  ```

#### `postRent(rent)`

- **Descripción**: Crea un nuevo alquiler y marca los libros como no disponibles
- **Parámetros**:
  - `rent` (Omit<IRent, "id">): Datos del alquiler
- **Retorna**: `Promise<IRent>`
- **Lógica especial**:
  1. Crea el alquiler en la BD
  2. Filtra IDs de libros válidos
  3. Marca cada libro como no disponible
  4. Si algo falla, elimina el alquiler (rollback)
- **Validaciones**: Verifica que haya libros válidos
- **Ejemplo**:
  ```typescript
  const rent = await postRent({
    usuarioId: 1,
    librosIds: [5, 7],
    fechaInicio: "2025-02-12",
    fechaFin: "2025-02-26",
    estado: true
  });
  ```

#### `getRentById(id)`

- **Descripción**: Obtiene un alquiler específico por ID
- **Parámetros**:
  - `id` (number | string): ID del alquiler
- **Retorna**: `Promise<IRent | null>`
- **Ejemplo**:
  ```typescript
  const rent = await getRentById(1);
  ```

#### `deleteRent(id, librosIds)`

- **Descripción**: Elimina un alquiler y marca sus libros como disponibles
- **Parámetros**:
  - `id` (number | string): ID del alquiler
  - `librosIds` (number[], optional): IDs de libros a marcar como disponibles
- **Retorna**: `Promise<void>`
- **Lógica**:
  1. Si se pasan librosIds, marca cada uno como disponible
  2. Elimina el alquiler
- **Ejemplo**:
  ```typescript
  await deleteRent(1, [5, 7]); // Elimina alquiler 1 y libera libros 5 y 7
  ```

#### `extendRentDate(id, dias)`

- **Descripción**: Extiende la fecha de fin de un alquiler
- **Parámetros**:
  - `id` (number | string): ID del alquiler
  - `dias` (number): Número de días a extender
- **Retorna**: `Promise<IRent | null>`
- **Lógica**:
  1. Obtiene el alquiler actual
  2. Suma los días a la fecha de fin
  3. Actualiza el alquiler
- **Validaciones**: Verifica que el alquiler exista
- **Ejemplo**:
  ```typescript
  const extended = await extendRentDate(1, 7); // Extiende 7 días
  ```

---

### UserService.ts

#### `postUser(user)`

- **Descripción**: Crea un nuevo usuario
- **Parámetros**:
  - `user` (Omit<IUser, "id">): Datos del usuario sin ID
- **Retorna**: `Promise<IUser>`
- **Validaciones**:
  - Verifica que la cédula no esté registrada
  - Verifica que el correo no esté registrado
- **Lanza excepciones**: Mensajes específicos para duplicados
- **Ejemplo**:
  ```typescript
  const user = await postUser({
    cedula: "12345678",
    nombreCompleo: "Juan",
    // ... resto de propiedades
  });
  ```

#### `getUsers()`

- **Descripción**: Obtiene la lista de todos los usuarios
- **Retorna**: `Promise<IUser[] | null>`
- **Uso**: Admin panel para gestión de usuarios
- **Ejemplo**:
  ```typescript
  const users = await getUsers();
  ```

#### `getUsuarioById(id)`

- **Descripción**: Obtiene un usuario específico por ID
- **Parámetros**:
  - `id` (number | string): ID del usuario
- **Retorna**: `Promise<IUser | null>`
- **Ejemplo**:
  ```typescript
  const user = await getUsuarioById(1);
  ```

#### `patchUsuario(id, payload)`

- **Descripción**: Actualiza el perfil del usuario autenticado
- **Parámetros**:
  - `id` (number | string): ID del usuario
  - `payload` (ProfileUpdatePayload): Datos a actualizar
    - `nombreCompleo`, `apellidoCompleto`, `telefono`, `dirreccion`, `correo`, `contrasena`
- **Retorna**: `Promise<IUser | null>`
- **Ejemplo**:
  ```typescript
  const updated = await patchUsuario(1, {
    telefono: "555-1234",
    dirreccion: "Nueva dirección"
  });
  ```

#### `deleteUser(id)`

- **Descripción**: Elimina un usuario (solo admin)
- **Parámetros**:
  - `id` (number | string): ID del usuario
- **Retorna**: `Promise<boolean>` (true si se eliminó)
- **Ejemplo**:
  ```typescript
  const deleted = await deleteUser(1);
  ```

#### `putUsuarioAdmin(id, payload)`

- **Descripción**: Actualiza el rol y estado de un usuario (solo admin)
- **Parámetros**:
  - `id` (number | string): ID del usuario
  - `payload` (AdminUpdatePayload): 
    - `rol`: "user" o "admin"
    - `estado`: true/false (activo/inactivo)
- **Retorna**: `Promise<IUser | null>`
- **Ejemplo**:
  ```typescript
  const updated = await putUsuarioAdmin(1, {
    rol: "admin",
    estado: true
  });
  ```

---

### Segurity/Errors.ts

#### `handleErrorService(err, fallback)`

- **Descripción**: Maneja errores genéricos en Services y retorna valor por defecto
- **Parámetros**:
  - `err` (unknown): Error a manejar
  - `fallback` (T): Valor por defecto si hay error
- **Retorna**: `T` (el fallback)
- **Efecto**: Registra el error en la consola
- **Uso**: En todos los catch de Services
- **Ejemplo**:
  ```typescript
  return handleErrorService(error, []);
  ```

#### `validateUniqueCedulaAndCorreo(cedula, correo)`

- **Descripción**: Valida que la cédula y correo no estén registrados
- **Parámetros**:
  - `cedula` (string): Cédula a validar
  - `correo` (string): Email a validar
- **Retorna**: `Promise<void>`
- **Lanza excepciones**:
  - `MSG_DUPLICATE_CEDULA`: Si la cédula ya existe
  - `MSG_DUPLICATE_CORREO`: Si el correo ya existe
  - Ambos mensajes si ambos existen
- **Ejemplo**:
  ```typescript
  try {
    await validateUniqueCedulaAndCorreo("12345678", "user@example.com");
  } catch (error) {
    console.error(error.message);
  }
  ```

#### Constantes de Error

- **`MSG_DUPLICATE_CEDULA`**: "Ya existe un usuario con esta cédula."
- **`MSG_DUPLICATE_CORREO`**: "Ya existe un usuario con este correo electrónico."

---

## 🔄 Contexts

### Ubicación: `src/context/`

---

### AuthContext.tsx

#### `AuthProvider`

- **Descripción**: Proveedor de contexto de autenticación
- **Props**:
  - `children` (React.ReactNode): Componentes hijos
- **Responsabilidades**:
  - Carga el token y usuario de localStorage al montar
  - Proporciona funciones de login/logout
  - Sincroniza el estado con localStorage
- **Ejemplo**:
  ```typescript
  <AuthProvider>
    <App />
  </AuthProvider>
  ```

#### `useAuth()`

- **Descripción**: Hook para acceder al contexto de autenticación
- **Retorna**: `AuthContextValue`
  - `user`: Usuario autenticado o null
  - `token`: Token JWT o null
  - `isAuthenticated`: Boolean indicando si hay sesión activa
  - `login(payload)`: Función para autenticarse
  - `logout()`: Función para cerrar sesión
  - `updateUser(partial)`: Función para actualizar datos del usuario
- **Lanza excepto**: Si se usa fuera de AuthProvider
- **Ejemplo**:
  ```typescript
  const { user, isAuthenticated, login } = useAuth();
  ```

#### Almacenamiento

- **Clave**: `"online-biblioteca-auth"`
- **Formato**: `{user: AuthUser, token: string}`
- **Persistencia**: Se guarda/carga automáticamente en localStorage

#### Componentes de Protección de Rutas

**`RequireAuth`**
- Protege rutas que requieren autenticación
- Redirige a `/auth` si no está autenticado

**`RedirectIfAuthenticated`**
- Redirige usuarios ya autenticados a `/books`
- Previene que usuarios logueados vean la pantalla de login

**`RequireAdmin`**
- Protege rutas exclusivas para administradores
- Requiere token Y rol "admin"
- Redirige a `/books` si no cumple los requisitos

---

### RentCartContext.tsx

#### `RentCartProvider`

- **Descripción**: Proveedor del carrito de alquileres global
- **Props**:
  - `children` (React.ReactNode): Componentes hijos
- **Responsabilidades**:
  - Mantiene una lista global de IDs de libros en el carrito
  - Proporciona funciones para añadir/quitar libros
- **Ejemplo**:
  ```typescript
  <RentCartProvider>
    <App />
  </RentCartProvider>
  ```

#### `useRentCart()`

- **Descripción**: Hook para acceder al carrito de alquileres
- **Retorna**: `RentCartContextValue`
  - `bookIds`: Array de IDs de libros en el carrito
  - `count`: Cantidad de libros en el carrito
  - `addToRentCart(bookId)`: Añade un libro al carrito (si no está)
  - `removeFromRentCart(bookId)`: Quita un libro del carrito
  - `setRentCartIds(ids)`: Reemplaza todos los IDs en el carrito
  - `clearRentCart()`: Vacía el carrito
- **Lanza excepto**: Si se usa fuera de RentCartProvider
- **Ejemplo**:
  ```typescript
  const { bookIds, addToRentCart, count } = useRentCart();
  ```

#### Características

- **No persistente**: El carrito NO se guarda en localStorage (se vacía al recargar)
- **Global**: Compartido entre todos los componentes dentro del Provider
- **Deduplicación**: `addToRentCart` no añade IDs duplicados

---

## 📱 Componentes Principales

### Ubicación: `src/module/`

#### **Admin Panel** (`Admin/`)

##### `AdminLayout.tsx`
- Navigation para ramas: Libros, Alquileres, Usuarios
- Restringe acceso solo a usuarios con rol "admin"

##### `BooksAdminPage.tsx`
- CRUD completo para libros
- Integración con Cloudinary para cargas de portadas
- Tabla con paginación, búsqueda y filtrado

##### `RentsAdminPage.tsx`
- Listado de alquileres con paginación
- Filtrado por cédula del usuario
- Opción de extender fechas de vencimiento
- Borrado de alquileres

##### `UsersAdminPage.tsx`
- Gestión de usuarios (CRUD)
- Edición de rol y estado
- Paginación (8 usuarios por página)

#### **Libros** (`Books/`)

##### `BookListPage.tsx`
- Catálogo de libros con paginación
- Filtros: categoría, idioma, años, disponibilidad
- Búsqueda por título, autor, ISBN
- Botón "Agregar al carrito" (sin redirección)

##### `BookDetailPage.tsx`
- Vista detallada de un libro
- Información completa: sinopsis, críticas, ISBN, etc.
- Botón para agregar al carrito
- Imágenes de portada

#### **Alquileres** (`Rents/`)

##### `CreateRent.tsx`
- Formulario de creación de alquileres
- Sincronización con carrito global
- Validación de fechas (fin ≥ inicio)
- Listado de libros seleccionados

##### `RentListPage.tsx`
- Listado de alquileres del usuario
- Paginación
- Acceso a detalles de cada alquiler

##### `RentDetailPage.tsx`
- Detalles completo del alquiler
- Modal para extender fecha
- Opciones: 7, 14, 21, 30 días

#### **Autenticación** (`Auth/`)

##### `LoginPage.tsx`
- Formulario de login
- Validación de email y contraseña

##### `RegisterPage.tsx`
- Formulario de registro
- Validación de cédula única
- Validación de email único

#### **Otros**

##### `Header.tsx` / `HeaderPage.tsx`
- Barra superior con navegación
- Información del usuario autenticado
- Botón de logout

##### `SidebarPage.tsx`
- Filtros de búsqueda en el catálogo
- Filtros por categoría, idioma, años

##### `Footer.tsx` / `FooterPage.tsx`
- Pie de página con información

##### `LoadingPage.tsx`
- Componente de carga (spinner)

##### `PaginationPage.tsx`
- Controles de paginación
- Botones primera, anterior, siguiente, última

---

## 🔐 Seguridad y Autenticación

### Flujo de Autenticación

1. Usuario se registra/login
2. Backend retorna `{token, user}`
3. Token se guarda en localStorage
4. Interceptor de Axios añade `Authorization: Bearer {token}` a cada petición
5. En logout, se limpia localStorage

### Protección de Rutas

Todos estos componentes se encuentran en [AppRouter.tsx](src/Router/AppRouter.tsx):

- **`RequireAuth`**: Redirige a `/auth` si no está autenticado
- **`RequireAdmin`**: Redirige a `/books` si no es admin
- **`RedirectIfAuthenticated`**: Redirige a `/books` si ya está autenticado

### Roles

- **`user`**: Usuario normal, puede alquilar libros
- **`admin`**: Acceso a panel de administración

---

## 🌍 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_URL_API=http://localhost:4000
VITE_ITEMS_PER_PAGE=10
VITE_ANIO_MIN=1900
VITE_ANIO_MAX=2025
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
```

---

## 📋 Resumen de Funcionalidades

### Usuarios
✅ Registro e login  
✅ Perfil de usuario  
✅ Gestión de usuarios (admin)  

### Libros
✅ Catálogo con paginación  
✅ Filtrado y búsqueda  
✅ Detalle del libro  
✅ Gestión de libros (admin)  

### Alquileres
✅ Crear alquiler  
✅ Listado de alquileres  
✅ Detalle del alquiler  
✅ Extender fecha  
✅ Gestión de alquileres (admin)  

### Integración
✅ Cloudinary para portadas  
✅ Validación de datos  
✅ Manejo de errores  
✅ Persistencia de sesión  

---

## 📚 Fuentes de Datos

- **Libros**: `/libros` (GET, POST, PUT, PATCH, DELETE)
- **Alquileres**: `/alquileres` (GET, POST, DELETE, PATCH)
- **Usuarios**: `/usuarios` (GET, POST, PUT, DELETE, PATCH)
- **Autenticación**: `/auth/login`, `/auth/register`

---

_Documentación actualizada: 12 de febrero de 2025_
