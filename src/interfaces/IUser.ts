/**
 * Roles de usuario para control de acceso
 */
export type UserRole = "user" | "admin";

export interface IUser {
  id: number;
  cedula: string;
  nombreCompleo: string;
  apellidoCompleto: string;
  telefono: string;
  dirreccion: string;
  correo: string;
  contrasena: string;
  estado: boolean;
  rol?: UserRole;
}