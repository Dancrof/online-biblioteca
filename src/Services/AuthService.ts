import { api } from "../Config/constant";
import type { IUser } from "../interfaces/IUser";

export type AuthUser = Omit<IUser, "contrasena">;

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  correo: string;
  contrasena: string;
}

export interface RegisterPayload {
  cedula: string;
  nombreCompleo: string;
  apellidoCompleto: string;
  telefono: string;
  dirreccion: string;
  correo: string;
  contrasena: string;
}

/**
 * Realiza el login de un usuario
 * @param payload Datos de login
 * @returns Respuesta de autenticación con token y datos del usuario
 */
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

/**
  *Realiza el registro de un nuevo usuario
 * @param payload Datos de registro
 * @returns Respuesta de autenticación con token y datos del usuario registrado
 */
export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

