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
 * Expresión regular para validar el correo electrónico
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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