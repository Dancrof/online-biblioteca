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
    return response.data;
  } catch (error) {
    return handleErrorService(error, null);
  }
}