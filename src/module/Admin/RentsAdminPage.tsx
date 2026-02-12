import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { IRent } from '../../interfaces/IRent';
import type { IUser } from '../../interfaces/IUser';
import { getRents, deleteRent, extendRentDate } from '../../Services/RentService';
import { getUsers } from '../../Services/UserService';
import type { IPaginate } from '../../interfaces/IPaginate';
import { PaginationPage } from '../Pagination/PaginationPage';

type RentFilterForm = {
  cedula: string;
  soloActivos: boolean;
};

const defaultFilters: RentFilterForm = {
  cedula: '',
  soloActivos: false,
};

/**
 * Dashboard de administración de alquileres.
 * Permite listar, filtrar y eliminar alquileres. El formulario de filtros
 * se implementa con react-hook-form.
 */
export const RentsAdminPage = () => {
  const [rents, setRents] = useState<IRent[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedRent, setSelectedRent] = useState<IRent | null>(null);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extending, setExtending] = useState(false);

  const {
    register,
    watch,
    reset,
  } = useForm<RentFilterForm>({
    defaultValues: defaultFilters,
  });

  const filters = watch();

  /**
   * Obtener información del usuario por ID
   */
  const getUserInfo = (usuarioId: number): { cedula: string; nombre: string } => {
    // Intentar encontrar por ID (considerando posibles inconsistencias de tipo)
    const user = users.find((u) => {
      const userId = typeof u.id === 'string' ? parseInt(u.id, 10) : u.id;
      return userId === usuarioId;
    });
    
    if (user) {
      return {
        cedula: user.cedula || '-',
        nombre: `${user.nombreCompleo || ''} ${user.apellidoCompleto || ''}`.trim() || '-',
      };
    }
    return { cedula: `Usuario ${usuarioId}`, nombre: '-' };
  };

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

  /**
   * Carga de usuarios para el mapeo de cédula
   */
  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    void loadRents();
    void loadUsers();
  }, []);

  /**
   * Filtrado en memoria según el formulario.
   */
  const filteredRents = useMemo(() => {
    return rents.filter((rent) => {
      if (filters.cedula) {
        // Buscar el usuario por cédula
        const user = users.find((u) => u.cedula === filters.cedula);
        if (!user || rent.usuarioId !== user.id) {
          return false;
        }
      }
      if (filters.soloActivos && !rent.estado) {
        return false;
      }
      return true;
    });
  }, [rents, users, filters]);

  /**
   * Si cambian filtros, volver a la primera página
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.cedula, filters.soloActivos]);

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
    setSubmitSuccess(null);
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
   * Abrir modal para extender fecha
   */
  const handleOpenExtendModal = (rent: IRent) => {
    setSelectedRent(rent);
    setExtensionDays(7);
    setShowExtendModal(true);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  /**
   * Extender fecha de vencimiento
   */
  const handleExtendDate = async () => {
    if (!selectedRent) return;
    setExtending(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const updatedRent = await extendRentDate(selectedRent.id, extensionDays);
      if (updatedRent) {
        setSubmitSuccess(`Fecha del alquiler #${selectedRent.id} extendida ${extensionDays} días exitosamente.`);
        setShowExtendModal(false);
        setSelectedRent(null);
        await loadRents();
        setTimeout(() => setSubmitSuccess(null), 5000);
      } else {
        setSubmitError('No se pudo extender la fecha del alquiler.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al extender la fecha.';
      setSubmitError(message);
    } finally {
      setExtending(false);
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
                    Cédula del usuario
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: 1234567890"
                    maxLength={10}
                    {...register('cedula', {
                      maxLength: {
                        value: 10,
                        message: 'Máximo 10 caracteres'
                      }
                    })}
                  />
                  <small className="text-muted">
                    Deja vacío para ver todos los usuarios. Máximo 10 caracteres.
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

              {submitSuccess && (
                <div className="alert alert-success py-2" role="alert">
                  <i className="bi bi-check-circle-fill me-2" />
                  {submitSuccess}
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
                          <th>Cédula</th>
                          <th>Libros</th>
                          <th>Inicio</th>
                          <th>Fin</th>
                          <th>Estado</th>
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(paginateRents.data ?? []).map((rent) => {
                          const userInfo = getUserInfo(rent.usuarioId);
                          return (
                            <tr key={rent.id}>
                              <td>{rent.id}</td>
                              <td>{userInfo.cedula}</td>
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
                                <div className="btn-group btn-group-sm" role="group">
                                  {rent.estado && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary"
                                      onClick={() => handleOpenExtendModal(rent)}
                                      title="Extender fecha"
                                    >
                                      <i className="bi bi-calendar-plus" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDelete(rent)}
                                  >
                                    <i className="bi bi-trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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
      
      {/* Modal para extender fecha */}
      {showExtendModal && selectedRent && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Extender fecha de vencimiento</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowExtendModal(false);
                    setSelectedRent(null);
                  }}
                  disabled={extending}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3">
                  Alquiler #<strong>{selectedRent.id}</strong> - {getUserInfo(selectedRent.usuarioId).nombre}
                </p>
                <p className="text-muted mb-3">
                  Fecha actual de vencimiento: <strong>
                    {new Date(selectedRent.fechaFin).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </strong>
                </p>
                <div className="mb-3">
                  <label htmlFor="extensionDays" className="form-label">
                    Días a extender:
                  </label>
                  <select
                    id="extensionDays"
                    className="form-select"
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(Number(e.target.value))}
                    disabled={extending}
                  >
                    <option value={7}>7 días</option>
                    <option value={14}>14 días</option>
                    <option value={21}>21 días</option>
                    <option value={30}>30 días</option>
                  </select>
                </div>
                <p className="text-info small">
                  <i className="bi bi-info-circle me-2" />
                  La nueva fecha será: <strong>
                    {new Date(new Date(selectedRent.fechaFin).getTime() + extensionDays * 24 * 60 * 60 * 1000)
                      .toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </strong>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowExtendModal(false);
                    setSelectedRent(null);
                  }}
                  disabled={extending}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExtendDate}
                  disabled={extending}
                >
                  {extending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Extendiendo...
                    </>
                  ) : (
                    'Confirmar extensión'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentsAdminPage;

