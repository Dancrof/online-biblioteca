import { api } from "../Config/constant";
import type { IPaginate } from "../interfaces/IPaginate";
import type { IRent } from "../interfaces/IRent";
import type { AxiosResponse } from "axios";
import { handleErrorService } from "./Segurity/Errors";



/**
 * Obtiene los alquileres
 * @param paginaActual - La página actual
 * @param cantidadPorPagina - La cantidad de alquileres por página
 * @returns Los alquileres
 */
export const getRents = async (paginaActual: number = 1, cantidadPorPagina: number = 8): Promise<IPaginate<IRent>> => {
  try {
      const response: AxiosResponse<IPaginate<IRent>> = await api.get("/alquileres", {
          params: {
              _page: paginaActual,
              _per_page: cantidadPorPagina,
          }
      });
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
 * Crea un alquiler
 * @param rent - El alquiler a crear
 * @returns El alquiler creado
 */
export const postRent = async (rent: IRent): Promise<IRent> => {
  try {
    const response: AxiosResponse<IRent> = await api.post('/alquileres', rent);
    return response.data;
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
 * @param id - El ID del alquiler
 * @returns El alquiler
 */
export const getRentById = async (id: number): Promise<IRent | null> => {
  try {
    const response: AxiosResponse<IRent> = await api.get(`/alquileres/${id}`);
    return response.data;
  } catch (error) {
    return handleErrorService(error, null);
  }
};
