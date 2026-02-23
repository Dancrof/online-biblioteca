import type { AxiosResponse } from "axios";
import { api } from "../Config/constant";
import type { IUser } from "../interfaces/IUser";
import { handleErrorService, MSG_DUPLICATE_CEDULA, MSG_DUPLICATE_CORREO, validateUniqueCedulaAndCorreo } from "./Segurity/Errors";



/**
 * Crea un usuario
 * @param user - El usuario a crear
 * @returns El usuario creado
 * @throws Error si la cédula o el correo ya están registrados
 */
export const postUser = async (user: Omit<IUser, "id">): Promise<IUser> => {
  try {
    await validateUniqueCedulaAndCorreo(user.cedula, user.correo);

    const response: AxiosResponse<IUser> = await api.post("/usuarios", user);
    return response.data;
  } catch (error) {
    if (error instanceof Error && (error.message === MSG_DUPLICATE_CEDULA || error.message === MSG_DUPLICATE_CORREO || error.message.startsWith(MSG_DUPLICATE_CEDULA))) {
      throw error;
    }
    return handleErrorService(error, {
      id: 0,
      cedula: "",
      nombreCompleo: "",
      apellidoCompleto: "",
      telefono: "",
      dirreccion: "",
      correo: "",
      contrasena: "",
      estado: false,
    });
  }
};

/**
 * Obtiene los usuarios
 * @returns Los usuarios
 */
export const getUsers = async (): Promise<IUser[] | null> => {
  try {
    const response: AxiosResponse<IUser[]> = await api.get(`/usuarios`);
    // Ensure response is always an array
    const data = response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return handleErrorService(error, null);
  }
};

/**
 * Obtiene un usuario por id (solo el propio usuario autenticado).
 */
export const getUsuarioById = async (id: number | string): Promise<IUser | null> => {
  try {
    const response = await api.get<IUser>(`/usuarios/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

/**
 * Campos permitidos para actualizar el perfil del usuario.
 */
export type ProfileUpdatePayload = Partial<Pick<
  IUser,
  "nombreCompleo" | "apellidoCompleto" | "telefono" | "dirreccion" | "correo"
>> & { contrasena?: string };

/**
 * Actualiza el perfil del usuario (solo el propio usuario autenticado).
 */
export const patchUsuario = async (
  id: number | string,
  payload: ProfileUpdatePayload
): Promise<IUser | null> => {
  try {
    const response = await api.patch<IUser>(`/usuarios/${id}`, payload);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const ax = error as { response?: { data?: { message?: string } } };
      if (ax.response?.data?.message) throw new Error(ax.response.data.message);
    }
    throw error;
  }
};

/**
 * Elimina un usuario (solo para administradores)
 */
export const deleteUser = async (id: number | string): Promise<boolean> => {
  try {
    await api.delete(`/usuarios/${id}`);
    return true;
  } catch (error) {
    return handleErrorService(error, false);
  }
};

/**
 * Actualiza el rol y estado de un usuario (solo para administradores)
 */
export type AdminUpdatePayload = Partial<Pick<
  IUser,
  "rol" | "estado"
>>;

export const putUsuarioAdmin = async (
  id: number | string,
  payload: AdminUpdatePayload
): Promise<IUser | null> => {
  try {
    const response = await api.patch<IUser>(`/usuarios/${id}`, payload);
    return response.data;
  } catch (error) {
    if (error && typeof error === "object" && "response" in error) {
      const ax = error as { response?: { data?: { message?: string } } };
      if (ax.response?.data?.message) throw new Error(ax.response.data.message);
    }
    throw error;
  }
};