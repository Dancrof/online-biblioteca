import { api } from "../../Config/constant";
import type { IUser } from "../../interfaces/IUser";

/**
 * Maneja un error
 * @param err - El error
 * @param fallback - El valor por defecto
 * @returns El valor por defecto
 */
export const handleErrorService = <T>(err: unknown, fallback: T): T => {       
    console.error("Error en Service:", err);
    return fallback;
  };    

/**
 * Mensaje cuando la cédula ya está registrada
 */
export const MSG_DUPLICATE_CEDULA = "Ya existe un usuario con esta cédula.";

/**
 * Mensaje cuando el correo ya está registrado
 */
export const MSG_DUPLICATE_CORREO = "Ya existe un usuario con este correo electrónico.";

const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return "";
  return error.message || "";
};

/**
 * Traduce errores de actualización de rol/estado en administración de usuarios.
 */
export const getAdminUpdateUserErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);

  if (!message) return "No se pudo actualizar el rol/estado del usuario.";
  if (message.includes("No autorizado para este recurso")) {
    return "No tienes permisos para modificar este usuario.";
  }
  if (message.includes("Método no permitido para usuarios")) {
    return "La actualización fue rechazada por el servidor. Intenta nuevamente.";
  }
  if (message.includes("No hay campos válidos para actualizar")) {
    return "No se detectaron cambios válidos para guardar.";
  }

  return message;
};

/**
 * Traduce errores de creación de usuarios en administración.
 */
export const getAdminCreateUserErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);

  if (!message) return "No se pudo crear el usuario.";
  if (message.includes("cédula")) {
    return "La cédula ya está registrada.";
  }
  if (message.includes("correo")) {
    return "El correo ya está registrado.";
  }

  return message;
};

/**
 * Traduce errores de eliminación de usuarios en administración.
 */
export const getAdminDeleteUserErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);

  if (!message) return "No se pudo eliminar el usuario.";
  if (message.includes("No autorizado para este recurso")) {
    return "No tienes permisos para eliminar este usuario.";
  }

  return message;
};

/**
 * Traduce errores comunes de acciones de administración (crear/editar/eliminar).
 */
export const getAdminActionErrorMessage = (error: unknown, fallback: string): string => {
  const message = getErrorMessage(error);

  if (!message) return fallback;
  if (message.includes("No autorizado para este recurso")) {
    return "No tienes permisos para realizar esta acción.";
  }
  if (message.includes("Método no permitido")) {
    return "La acción fue rechazada por el servidor. Intenta nuevamente.";
  }

  return message;
};

/**
 * Traduce errores comunes para flujos de UI fuera de administración.
 */
export const getUiActionErrorMessage = (error: unknown, fallback: string): string => {
  const message = getErrorMessage(error);

  if (!message) return fallback;
  if (message.includes("No autorizado para este recurso")) {
    return "No tienes permisos para realizar esta acción.";
  }
  if (message.includes("Método no permitido")) {
    return "La acción fue rechazada por el servidor. Intenta nuevamente.";
  }

  return message;
};

/**
 * Traduce errores de creación de usuarios para flujos públicos.
 */
export const getCreateUserErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);

  if (!message) return "No se pudo crear el usuario.";
  if (message.includes("cédula")) {
    return "La cédula ya está registrada.";
  }
  if (message.includes("correo")) {
    return "El correo ya está registrado.";
  }

  return message;
};

/**
 * Comprueba si ya existe un usuario con la cédula o el correo indicados.
 * @param cedula - Cédula a validar
 * @param correo - Correo a validar
 * @throws Error con mensaje específico si hay duplicado
 */
export const validateUniqueCedulaAndCorreo = async (
  cedula: string,
  correo: string
): Promise<void> => {
  const [byCedula, byCorreo] = await Promise.all([
    api.get<IUser[]>(`/usuarios?cedula=${encodeURIComponent(cedula)}`),
    api.get<IUser[]>(`/usuarios?correo=${encodeURIComponent(correo)}`),
  ]);

  const hasCedula = Array.isArray(byCedula.data) && byCedula.data.length > 0;
  const hasCorreo = Array.isArray(byCorreo.data) && byCorreo.data.length > 0;

  if (hasCedula && hasCorreo) {
    throw new Error(`${MSG_DUPLICATE_CEDULA} ${MSG_DUPLICATE_CORREO}`);
  }
  if (hasCedula) {
    throw new Error(MSG_DUPLICATE_CEDULA);
  }
  if (hasCorreo) {
    throw new Error(MSG_DUPLICATE_CORREO);
  }
};