import bcrypt from "bcryptjs";

/**
 * Encripta una contraseña
 * @param password - La contraseña a encriptar
 * @returns El hash de la contraseña encriptada
 */
export const encoderPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10);
};

/**
 * Compara una contraseña con un hash
 * @param password - La contraseña a comparar
 * @param hash - El hash a comparar
 * @returns true si la contraseña es correcta, false en caso contrario
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};