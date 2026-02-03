import { api } from "../Config/constant";
import type { Book, BookQueryParams } from "../interfaces/IBook";
import type { AxiosResponse } from "axios";


const handleError = <T,>(err: unknown, fallback: T): T => {
    console.error("Error en BookService:", err);
    return fallback;
}

export const getBooks = async (): Promise<Book[]> => {
    try {
        const response: AxiosResponse<Book[]> = await api.get("/libros");
        console.log("Respuesta de getBooks:", response);
        return response.data;
    } catch (error) {
        return handleError(error, []);
    }


};

export const getBookById = async (id: number): Promise<Book | null> => {
    try {
        const res: AxiosResponse<Book> = await api.get(`/libros/${id}`);
        console.log("Respuesta de getBookById:", res);
        return res.data;
    } catch (err) {
        return handleError(err, null);
    }
};

export const filterBooks = async (
    params: BookQueryParams
): Promise<Book[]> => {
    try {
        const queryParams: Record<string, string | number | boolean> = {};

        if (params.titulo) queryParams["titulo_like"] = params.titulo;
        if (params.autor) queryParams["autor_like"] = params.autor;
        if (params.categoria) queryParams["categoria"] = params.categoria;
        if (params.idioma) queryParams["idioma"] = params.idioma;
        if (params.disponible !== undefined)
            queryParams["disponible"] = params.disponible;

        if (params.sort) queryParams["_sort"] = params.sort;
        if (params.order) queryParams["_order"] = params.order;

        const response: AxiosResponse<Book[]> = await api.get("/libros", {
            params: queryParams,
        });

        return response.data;
    } catch (error) {
        return handleError(error, []);
    }
};
