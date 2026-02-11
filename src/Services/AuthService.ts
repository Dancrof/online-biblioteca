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

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
};

