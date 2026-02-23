import axios from "axios";

/**
 * API de la aplicación
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_URL_API,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Clave de almacenamiento del token
 */
const AUTH_STORAGE_KEY = "online-biblioteca-auth";

/**
 * Interceptor para enviar automáticamente el token JWT si existe
 */
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch {
    // ignorar errores de lectura
  }
  return config;
});

/**
 * Interceptor de respuesta para manejar sesiones expiradas (401).
 * Limpia autenticación local y redirige al login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url ?? "");
    const isAuthEndpoint = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // ignorar errores de storage
      }

      if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
        const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.href = `/auth?returnTo=${encodeURIComponent(returnTo)}`;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Expresión regular para validar el correo electrónico
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Expresión regular para permitir únicamente números
 */
export const ONLY_NUMBERS_REGEX = /^\d+$/;

/**
 * Expresión regular para cédula: exactamente 10 dígitos.
 * Permite ceros al inicio, por ejemplo: 0850054347
 */
export const CEDULA_REGEX = /^\d{10}$/;

/**
 * Longitud máxima para teléfono en formato internacional
 * Ejemplo válido: +593979979736
 */
export const PHONE_MAX_LENGTH = 13;

/**
 * Expresión regular para teléfono con formato internacional básico.
 * Permite opcional '+' al inicio y hasta 12 dígitos (13 caracteres totales con '+').
 */
export const PHONE_REGEX = /^\+?\d{1,12}$/;

/**
 * Items por página
 */
export const ITEMS_PER_PAGE = Number(import.meta.env.VITE_ITEMS_PER_PAGE);

/**
 * Año mínimo
 */
export const ANIO_MIN = Number(import.meta.env.VITE_ANIO_MIN);

/**
 * Año máximo
 */
export const ANIO_MAX = Number(import.meta.env.VITE_ANIO_MAX);

/**
 * Categorías de libros
 */
export const CATEGORIAS = ["Novela", "Distopia", "Fabula", "Romance", "Fantasia", "Misterio"];
  
  /**
   * Idiomas de libros
   */
  export const IDIOMAS = [
    { value: "", label: "Todos" },
    { value: "Espanol", label: "Español" },
    { value: "Ingles", label: "Inglés" },
    { value: "Frances", label: "Francés" },
    { value: "Ruso", label: "Ruso" },
    { value: "Indio", label: "Indio" }
  ];

/**
 * Cloudinary Configuration
 */
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/* Rol de administrador */
export const ROLE_ADMIN = 'admin'
