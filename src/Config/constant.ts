import axios from "axios";


export const api = axios.create({
    baseURL: import.meta.env.VITE_URL_API,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Expresión regular para validar el correo electrónico
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ITEMS_PER_PAGE = 4;