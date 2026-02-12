import { api } from "../Config/constant";
import type { Book, BookQueryParams, BookFiltersState } from "../interfaces/IBook";
import type { AxiosResponse } from "axios";
import type { IPaginate } from "../interfaces/IPaginate";
import { handleErrorService } from "./Segurity/Errors";

/**
 * Obtiene los libros con paginación y filtros opcionales
 * @param paginaActual - La página actual
 * @param cantidadPorPagina - La cantidad de libros por página
 * @param queryParams - Filtros opcionales (categoría, idioma, disponible, año, etc.)
 * @returns Los libros paginados
 */
export const getBooks = async (
    paginaActual: number = 1,
    cantidadPorPagina: number = 4,
    queryParams?: BookQueryParams
): Promise<IPaginate<Book>> => {
    try {
        const params: Record<string, string | number | boolean> = {
            _page: paginaActual,
            _per_page: cantidadPorPagina,
        };

        if (queryParams) {
            if (queryParams.titulo) params["titulo_like"] = queryParams.titulo;
            if (queryParams.autor) params["autor_like"] = queryParams.autor;
            if (queryParams.categoria) params["categoria"] = queryParams.categoria;
            if (queryParams.idioma) params["idioma"] = queryParams.idioma;
            if (queryParams.disponible !== undefined) params["disponible"] = queryParams.disponible;
            if (queryParams.anioMin != null) params["anioPublicacion_gte"] = queryParams.anioMin;
            if (queryParams.anioMax != null) params["anioPublicacion_lte"] = queryParams.anioMax;
            if (queryParams.sort) params["_sort"] = queryParams.sort;
            if (queryParams.order) params["_order"] = queryParams.order;
        }

        const response: AxiosResponse<IPaginate<Book>> = await api.get("/libros", { params });
        return response.data;
    } catch (error) {
        return handleErrorService(error, {
            data: [],
            first: 1,
            prev: null,
            next: 1,
            last: 1,
            pages: 1,
            items: 0
        });
    }
};

/**
 * Obtiene un libro por su ID
 * @param id - El ID del libro
 * @returns El libro
 */
export const getBookById = async (id: number): Promise<Book | null> => {
    try {
        const res: AxiosResponse<Book> = await api.get(`/libros/${id}`);
        console.log("Respuesta de getBookById:", res);
        return res.data;
    } catch (err) {
        return handleErrorService(err, null);
    }
};

/**
 * Filtra los libros
 * @param params - Los parámetros de filtrado
 * @returns Los libros filtrados
 */
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
        if (params.anioMin != null) queryParams["anioPublicacion_gte"] = params.anioMin;
        if (params.anioMax != null) queryParams["anioPublicacion_lte"] = params.anioMax;

        if (params.sort) queryParams["_sort"] = params.sort;
        if (params.order) queryParams["_order"] = params.order;

        const response: AxiosResponse<Book[]> = await api.get("/libros", {
            params: queryParams,
        });

        return response.data;
    } catch (error) {
        return handleErrorService(error, []);
    }
};

/**
 * Actualiza la disponibilidad de un libro
 * @param id - El ID del libro
 * @param disponible - Nuevo estado de disponibilidad
 * @returns El libro actualizado o null en caso de error
 */
export const patchBookDisponible = async (id: number, disponible: boolean): Promise<Book | null> => {
    try {
        // Validar que el ID es válido
        if (!id || isNaN(id) || id <= 0) {
            console.error(`ID de libro inválido: ${id}`);
            return null;
        }
        const res: AxiosResponse<Book> = await api.patch(`/libros/${id}`, { disponible });
        return res.data;
    } catch (err) {
        return handleErrorService(err, null);
    }
};

/**
 * Convierte el estado de filtros del listado (BookFiltersState) a parámetros de consulta (BookQueryParams).
 * Útil para usar con filterBooks o getBooks.
 */
export function filtersToQueryParams(filters: BookFiltersState): BookQueryParams {
    const params: BookQueryParams = {};
    if (filters.categoria) params.categoria = filters.categoria;
    if (filters.idioma) params.idioma = filters.idioma;
    if (filters.anioMax != null) params.anioMax = filters.anioMax;
    if (filters.soloDisponibles) params.disponible = true;
    return params;
}

/**
 * Crea un nuevo libro.
 * @param book - Datos del libro sin el id.
 * @returns El libro creado.
 */
export const postBook = async (book: Omit<Book, "id">): Promise<Book | null> => {
    try {
        const res: AxiosResponse<Book> = await api.post("/libros", book);
        return res.data;
    } catch (error) {
        return handleErrorService(error, null);
    }
};

/**
 * Actualiza un libro existente.
 * @param id - ID del libro a actualizar.
 * @param book - Datos del libro sin el id.
 * @returns El libro actualizado o null si ocurre un error.
 */
export const putBook = async (id: number, book: Omit<Book, "id">): Promise<Book | null> => {
    try {
        const res: AxiosResponse<Book> = await api.put(`/libros/${id}`, book);
        return res.data;
    } catch (error) {
        return handleErrorService(error, null);
    }
};

/**
 * Elimina un libro por su ID.
 * @param id - ID del libro a eliminar.
 */
export const deleteBook = async (id: number): Promise<boolean> => {
    try {
        await api.delete(`/libros/${id}`);
        return true;
    } catch (error) {
        handleErrorService(error, null);
        return false;
    }
};
