import type { AxiosResponse } from "axios";
import { api } from "../Config/constant";
import type { IUser } from "../interfaces/IUser";
import { handleErrorService } from "./Segurity/Errors";


/**
 * Crea un usuario
 * @param user - El usuario a crear
 * @returns El usuario creado
 */
export const postUser = async (user: IUser): Promise<IUser> => {
    try {
      const response: AxiosResponse<IUser> = await api.post('/usuarios', user);
      return response.data;
    } catch (error) {
      return handleErrorService(error, {           
        id: 0,
        cedula: '',
        nombreCompleo: '',
        apellidoCompleto: '',
        telefono: '',
        dirreccion: '',
        correo: '',
        contrasena: '',
        estado: false
      });
    }
  };    