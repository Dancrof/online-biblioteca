import { api } from "../Config/constant";
import type { IPaginate } from "../interfaces/IPaginate";
import type { IRent } from "../interfaces/IRent";
import type { AxiosResponse } from "axios";
import { handleErrorService } from "./Segurity/Errors";
import { patchBookDisponible } from "./BookService";



/**
 * Construye IPaginate a partir del array y total que devuelve json-server.
 * json-server devuelve el array en el body y el total en el header X-Total-Count.
 */
function buildPaginateFromJsonServer(
  data: IRent[],
  page: number,
  perPage: number,
  totalItems: number
): IPaginate<IRent> {
  const pages = Math.max(1, Math.ceil(totalItems / perPage));
  const last = pages;
  const prev = page > 1 ? page - 1 : null;
  const next = page < last ? page + 1 : last;
  return {
    data: Array.isArray(data) ? data : [],
    first: 1,
    prev,
    next,
    last,
    pages,
    items: totalItems,
  };
}

/**
 * Obtiene los alquileres.
 * Compatible con json-server: usa _limit y normaliza la respuesta (array + X-Total-Count)
 * al formato IPaginate que espera la aplicación.
 */
export const getRents = async (paginaActual: number = 1, cantidadPorPagina: number = 8): Promise<IPaginate<IRent>> => {
  try {
      const response = await api.get("/alquileres", {
          params: {
              _page: paginaActual,
              _limit: cantidadPorPagina,
          }
      });
      const body = response.data as unknown;
      // Si el backend ya devuelve formato IPaginate (objeto con .data)
      if (body && typeof body === "object" && "data" in body && Array.isArray((body as IPaginate<IRent>).data)) {
          return body as IPaginate<IRent>;
      }
      // json-server: body es el array, total en header X-Total-Count
      const list = Array.isArray(body) ? (body as IRent[]) : [];
      const totalHeader = response.headers?.["x-total-count"];
      const totalItems = typeof totalHeader === "string" ? parseInt(totalHeader, 10) : list.length;
      const total = Number.isFinite(totalItems) ? totalItems : list.length;
      return buildPaginateFromJsonServer(list, paginaActual, cantidadPorPagina, total);
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
 * Crea un alquiler
 * @param rent - El alquiler a crear
 * @returns El alquiler creado
 */
export const postRent = async (rent: Omit<IRent, 'id'>): Promise<IRent> => {
  try {
    const response: AxiosResponse<IRent> = await api.post('/alquileres', rent);
    const createdRent = response.data;
    // Marcar los libros alquilados como no disponibles
    if (createdRent.librosIds?.length) {
      const updateResults = await Promise.all(
        createdRent.librosIds.map((bookId) => patchBookDisponible(bookId, false))
      );
      const anyFailed = updateResults.some((result) => result === null);
      if (anyFailed) {
        await deleteRent(createdRent.id, createdRent.librosIds);
        return handleErrorService(
          new Error('No se pudo actualizar la disponibilidad de uno o más libros. El alquiler ha sido cancelado.'),
          {
            id: 0,
            usuarioId: 0,
            librosIds: [],
            fechaInicio: '',
            fechaFin: '',
            estado: false
          }
        );
      }
    }
    return createdRent;
  } catch (error) {
    return handleErrorService(error, {
      id: 0,
      usuarioId: 0,
      librosIds: [],
      fechaInicio: '',
      fechaFin: '',
      estado: false
    });
  }
};

/**
 * Obtiene un alquiler por su ID
 * @param id - El ID del alquiler (número o string, p. ej. json-server puede usar "36d9")
 * @returns El alquiler
 */
export const getRentById = async (id: number | string): Promise<IRent | null> => {
  try {
    const response: AxiosResponse<IRent> = await api.get(`/alquileres/${id}`);
    return response.data;
  } catch (error) {
    return handleErrorService(error, null);
  }
};

/**
 * Elimina un alquiler por su ID. Si se pasan librosIds, primero marca esos libros como disponibles.
 * @param id - El ID del alquiler (número o string, p. ej. json-server puede usar "36d9")
 * @param librosIds - IDs de los libros del alquiler; se marcarán como disponibles antes de eliminar
 */
export const deleteRent = async (id: number | string, librosIds?: number[]): Promise<void> => {
  if (librosIds?.length) {
    await Promise.all(librosIds.map((bookId) => patchBookDisponible(bookId, true)));
  }
  await api.delete(`/alquileres/${id}`);
};
