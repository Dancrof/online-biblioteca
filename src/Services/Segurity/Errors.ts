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