import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { filterBooks } from '../../Services/BookService';
import { postRent } from '../../Services/RentService';
import type { IRent } from '../../interfaces/IRent';
import type { Book } from '../../interfaces/IBook';
import { api } from '../../Config/constant';
import './Styles/CreateRent.css';
import { Link } from 'react-router';

/**
 * Opciones de usuario
 */
type UserOption = { id: number; nombreCompleo: string };



/**
 * Valores por defecto del formulario de creación de alquiler
 */
const defaultValues: IRent = {
  id: 0,
  usuarioId: 0,
  librosIds: [],
  fechaInicio: '',
  fechaFin: '',
  estado: false,
};

/**
 * Estado de la creación de alquiler
 */
type CreateRentLocationState = { bookId?: number } | null;

/**
 * Componente para crear un alquiler
 * @returns El componente de creación de alquiler
 */
export const CreateRent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Hooks de formularios
   */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<IRent>({ defaultValues });

  const fechaInicio = watch('fechaInicio');
  const librosIds = watch('librosIds');

  /**
   * Efecto para obtener los usuarios y libros
   */
  useEffect(() => {
    api.get<UserOption[]>('/usuarios').then((res) => setUsers(res.data)).catch(() => setUsers([]));
    filterBooks({}).then(setBooks).catch(() => setBooks([]));
  }, []);

  /**
   * Efecto para agregar el libro cuando se llega desde "Reservar libro" (append, sin reemplazar)
   */
  useEffect(() => {
    const state = location.state as CreateRentLocationState;
    const bookId = state?.bookId;
    if (bookId == null) return;
    const actual = getValues('librosIds') ?? [];
    if (actual.includes(bookId)) return;
    setValue('librosIds', [...actual, bookId]);
  }, [location.state, setValue, getValues]);

  /**
   * Manejador del formulario de creación de alquiler
   * @param data - Los datos del formulario
   */
  const onSubmit = async (data: IRent) => {
    setSubmitError(null);
    if (!data.librosIds?.length) {
      setError('librosIds', { message: 'Selecciona al menos un libro' });
      return;
    }
    const payload: IRent = {
      id: 0,
      usuarioId: Number(data.usuarioId),
      librosIds: data.librosIds.map(Number),
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      estado: data.estado,
    };
    try {
      const created = await postRent(payload);
      if (created?.id) navigate('/rents');
      else setSubmitError('No se pudo crear el alquiler.');
    } catch {
      setSubmitError('Error al guardar. Intenta de nuevo.');
    }
  };

  /**
   * Manejador para agregar o quitar un libro
   * @param bookId - El ID del libro
   */
  const toggleBookId = (bookId: number) => {
    setValue(
      'librosIds',
      librosIds.includes(bookId)
        ? librosIds.filter((id) => id !== bookId)
        : [...librosIds, bookId]
    );
  };

  /**
   * Fecha mínima de fin
   */
  const minFechaFin = fechaInicio || undefined;

  return (
    <main className="create-rent">
      <div className="container-lg py-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/rents')}
            aria-label="Volver"
          >
            <i className="bi bi-arrow-left" />
          </button>
          <h1 className="create-rent__title mb-0">
            <i className="bi bi-journal-plus me-2" />
            Nuevo alquiler
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="create-rent__form">
          <div className="row g-4">
            {/* Usuario */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    Seleccionar usuario
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className={`form-select flex-grow-1 ${errors.usuarioId ? 'is-invalid' : ''}`}
                      {...register('usuarioId', {
                        required: 'Selecciona un usuario',
                        valueAsNumber: true,
                        validate: (v) => (v > 0 ? true : 'Selecciona un usuario'),
                      })}
                    >
                      <option value={0}>-- Seleccionar --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombreCompleo} (ID {u.id})
                        </option>
                      ))}
                    </select>
                    <Link to="/users/new" className="btn btn-outline-primary btn-sm p-2" title="Nuevo usuario" aria-label="Nuevo usuario">
                      <i className="bi bi-person-plus" />
                    </Link>
                  </div>
                  {errors.usuarioId && (
                    <div className="invalid-feedback d-block">{errors.usuarioId.message}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column justify-content-center">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-toggle-on text-primary me-2" />
                    Estado
                  </label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      {...register('estado')}
                    />
                    <label className="form-check-label">Alquiler activo</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-calendar-event text-primary me-2" />
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.fechaInicio ? 'is-invalid' : ''}`}
                    {...register('fechaInicio', { required: 'Fecha de inicio obligatoria' })}
                  />
                  {errors.fechaInicio && (
                    <div className="invalid-feedback d-block">{errors.fechaInicio.message}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-calendar-range text-primary me-2" />
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    className={`form-control ${errors.fechaFin ? 'is-invalid' : ''}`}
                    min={minFechaFin}
                    {...register('fechaFin', {
                      required: 'Fecha de fin obligatoria',
                      validate: (v) =>
                        !fechaInicio || v >= fechaInicio
                          ? true
                          : 'La fecha fin debe ser igual o posterior al inicio',
                    })}
                  />
                  {errors.fechaFin && (
                    <div className="invalid-feedback d-block">{errors.fechaFin.message}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Libros */}
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-journal-bookmark-fill text-primary me-2" />
                    Libros a alquilar
                  </label>
                  {errors.librosIds && (
                    <div className="text-danger small mb-2">{errors.librosIds.message}</div>
                  )}
                  <div className="create-rent__books-list">
                    {books.map((book) => (
                      <div
                        key={book.id}
                        className={`create-rent__book-item ${librosIds.includes(book.id) ? 'create-rent__book-item--selected' : ''}`}
                        onClick={() => toggleBookId(book.id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleBookId(book.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input create-rent__book-check"
                          checked={librosIds.includes(book.id)}
                          onChange={() => toggleBookId(book.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="create-rent__book-title">{book.titulo}</span>
                        <span className="create-rent__book-meta text-muted small">
                          {book.autor} · ID {book.id}
                        </span>
                      </div>
                    ))}
                  </div>
                  {books.length === 0 && (
                    <p className="text-muted small mb-0">No hay libros cargados.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="alert alert-danger mt-3 mb-0" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {submitError}
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/rents')}
            >
              <i className="bi bi-x-lg me-2" />
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Guardando…
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2" />
                  Crear alquiler
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
