import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { IRent } from '../../interfaces/IRent';
import { getRents, deleteRent } from '../../Services/RentService';
import type { IPaginate } from '../../interfaces/IPaginate';
import { PaginationPage } from '../Pagination/PaginationPage';

type RentFilterForm = {
  usuarioId: string;
  soloActivos: boolean;
};

const defaultFilters: RentFilterForm = {
  usuarioId: '',
  soloActivos: false,
};

/**
 * Dashboard de administración de alquileres.
 * Permite listar, filtrar y eliminar alquileres. El formulario de filtros
 * se implementa con react-hook-form.
 */
export const RentsAdminPage = () => {
  const [rents, setRents] = useState<IRent[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);

  const {
    register,
    watch,
    reset,
  } = useForm<RentFilterForm>({
    defaultValues: defaultFilters,
  });

  const filters = watch();

  /**
   * Construye una paginación a partir de una lista en memoria
   */
  function buildPaginate(all: IRent[], page: number, perPage: number): IPaginate<IRent> {
    const items = all.length;
    const pages = Math.max(1, Math.ceil(items / perPage));
    const safePage = Math.max(1, Math.min(page, pages));
    const start = (safePage - 1) * perPage;
    const data = all.slice(start, start + perPage);
    return {
      data,
      first: 1,
      prev: safePage > 1 ? safePage - 1 : null,
      next: Math.min(safePage + 1, pages),
      last: pages,
      pages,
      items,
    };
  }

  /**
   * Carga de alquileres (traemos un máximo razonable de registros)
   */
  const loadRents = async () => {
    try {
      setLoading(true);
      const res = await getRents(1, 100);
      setRents(res.data);
    } catch {
      setRents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRents();
  }, []);

  /**
   * Filtrado en memoria según el formulario.
   */
  const filteredRents = useMemo(() => {
    return rents.filter((rent) => {
      if (filters.usuarioId) {
        const uid = Number(filters.usuarioId);
        if (!Number.isNaN(uid) && rent.usuarioId !== uid) {
          return false;
        }
      }
      if (filters.soloActivos && !rent.estado) {
        return false;
      }
      return true;
    });
  }, [rents, filters]);

  /**
   * Si cambian filtros, volver a la primera página
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.usuarioId, filters.soloActivos]);

  /**
   * Paginación (reutiliza PaginationPage)
   */
  const paginateRents = useMemo(
    () => buildPaginate(filteredRents, currentPage, perPage),
    [filteredRents, currentPage, perPage]
  );

  const loadPage = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Mantener currentPage dentro de rango cuando cambia el total
   */
  useEffect(() => {
    if (currentPage > paginateRents.pages) {
      setCurrentPage(paginateRents.pages);
    }
  }, [currentPage, paginateRents.pages]);

  /**
   * Eliminar alquiler
   */
  const handleDelete = async (rent: IRent) => {
    if (
      !window.confirm(
        `¿Eliminar el alquiler #${rent.id} del usuario ${rent.usuarioId}? Esto también marcará sus libros como disponibles.`
      )
    ) {
      return;
    }
    setSubmitError(null);
    try {
      await deleteRent(rent.id, rent.librosIds);
      await loadRents();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar el alquiler.';
      setSubmitError(message);
    }
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    reset(defaultFilters);
  };

  return (
    <div className="container-lg py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">
          <i className="bi bi-journal-bookmark me-2" />
          Administración de alquileres
        </h1>
      </div>

      <div className="row g-4">
        {/* Filtros */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">Filtros</h2>
              <form>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    ID de usuario
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ej: 1"
                    {...register('usuarioId')}
                  />
                  <small className="text-muted">
                    Deja vacío para ver todos los usuarios.
                  </small>
                </div>

                <div className="mb-3 form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rents-solo-activos"
                    {...register('soloActivos')}
                  />
                  <label className="form-check-label" htmlFor="rents-solo-activos">
                    Solo alquileres activos
                  </label>
                </div>

                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleClearFilters}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Listado */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="h5 mb-0">Listado de alquileres</h2>
                  <small className="text-muted">
                    Página {currentPage} de {paginateRents.pages}
                  </small>
                </div>
                <small className="text-muted">
                  Mostrando {filteredRents.length} de {rents.length}
                </small>
              </div>

              {submitError && (
                <div className="alert alert-danger py-2" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {submitError}
                </div>
              )}

              {loading ? (
                <p>Cargando alquileres…</p>
              ) : filteredRents.length === 0 ? (
                <p className="text-muted mb-0">No hay alquileres que coincidan con los filtros.</p>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Usuario</th>
                          <th>Libros</th>
                          <th>Inicio</th>
                          <th>Fin</th>
                          <th>Estado</th>
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(paginateRents.data ?? []).map((rent) => (
                          <tr key={rent.id}>
                            <td>{rent.id}</td>
                            <td>{rent.usuarioId}</td>
                            <td>
                              {rent.librosIds.length
                                ? rent.librosIds.join(', ')
                                : '-'}
                            </td>
                            <td>{rent.fechaInicio || '-'}</td>
                            <td>{rent.fechaFin || '-'}</td>
                            <td>
                              {rent.estado ? (
                                <span className="badge bg-success">Activo</span>
                              ) : (
                                <span className="badge bg-secondary">Cerrado</span>
                              )}
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(rent)}
                              >
                                <i className="bi bi-trash" /> Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3">
                    <PaginationPage
                      first={paginateRents.first}
                      prev={paginateRents.prev}
                      next={paginateRents.next}
                      last={paginateRents.last}
                      pages={paginateRents.pages}
                      currentPage={currentPage}
                      onPageChange={loadPage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentsAdminPage;

