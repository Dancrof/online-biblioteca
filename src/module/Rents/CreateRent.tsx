import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { filterBooks } from '../../Services/BookService';
import { postRent } from '../../Services/RentService';
import type { IRent } from '../../interfaces/IRent';
import type { Book } from '../../interfaces/IBook';
import { api } from '../../Config/constant';
import './Styles/CreateRent.css';
import { Link } from 'react-router';
import { useRentCart } from '../../context/RentCartContext';

registerLocale('es', es);

/**
 * Opciones de usuario
 */
type UserOption = { id: number; nombreCompleo: string, correo: string };

/** Fecha actual en formato YYYY-MM-DD */
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}



/**
 * Valores por defecto del formulario (fechaInicio se fija al montar con la fecha actual)
 */
function getDefaultValues(): IRent {
  return {
    id: 0,
    usuarioId: 0,
    librosIds: [],
    fechaInicio: getTodayString(),
    fechaFin: '',
    estado: false,
  };
}

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
  const { bookIds: rentCartIds, addToRentCart, removeFromRentCart, clearRentCart } = useRentCart();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Hooks de formularios
   */
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<IRent>({ defaultValues: useMemo(() => getDefaultValues(), []) });

  const fechaInicio = watch('fechaInicio');
  const librosIds = watch('librosIds');
  const todayStr = useMemo(() => getTodayString(), []);

  /**
   * Efecto para obtener los usuarios y libros
   */
  useEffect(() => {
    api.get<UserOption[]>('/usuarios').then((res) => setUsers(res.data)).catch(() => setUsers([]));
    filterBooks({}).then(setBooks).catch(() => setBooks([]));
  }, []);

  /**
   * Agregar al carrito global cuando se llega con state.bookId (ej. enlace directo)
   */
  useEffect(() => {
    const state = location.state as CreateRentLocationState;
    const bookId = state?.bookId;
    if (bookId != null) addToRentCart(bookId);
  }, [location.state, addToRentCart]);

  /**
   * Sincronizar formulario con el carrito global (una sola fuente de verdad)
   */
  useEffect(() => {
    setValue('librosIds', rentCartIds);
  }, [rentCartIds, setValue]);

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
    const payload = {
      // omit id, let backend generate
      usuarioId: Number(data.usuarioId),
      librosIds: data.librosIds.map(Number),
      fechaInicio: (data.fechaInicio || getTodayString()).slice(0, 10),
      fechaFin: (data.fechaFin || '').slice(0, 10),
      estado: data.estado,
    };
    try {
      const created = await postRent(payload);
      if (created?.id) {
        clearRentCart();
        navigate('/rents');
      } else setSubmitError('No se pudo crear el alquiler.');
    } catch {
      setSubmitError('Error al guardar. Intenta de nuevo.');
    }
  };

  /**
   * Manejador para agregar o quitar un libro (actualiza formulario y carrito global)
   * @param bookId - El ID del libro
   */
  const toggleBookId = (bookId: number) => {
    if (librosIds.includes(bookId)) {
      removeFromRentCart(bookId);
      setValue('librosIds', librosIds.filter((id) => id !== bookId));
    } else {
      addToRentCart(bookId);
      setValue('librosIds', [...librosIds, bookId]);
    }
  };

  /**
   * Fecha mínima de fin
   */
  const minFechaFin = fechaInicio || todayStr;

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
                          {u.nombreCompleo} - ({u.correo})
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

            {/* Fecha de inicio: automática (hoy), oculta y no editable */}
            <input type="hidden" {...register('fechaInicio', { required: true })} />

            {/* Fecha de fin: react-datepicker (formato YYYY-MM-DD) */}
            <div className="col-12 col-md-6">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <label className="form-label fw-semibold" htmlFor="create-rent-fecha-fin">
                    <i className="bi bi-calendar-range text-primary me-2" />
                    Fecha de fin del alquiler
                  </label>
                  <Controller
                    name="fechaFin"
                    control={control}
                    rules={{
                      required: 'Fecha de fin obligatoria',
                      validate: (v) =>
                        !v || !minFechaFin || v >= minFechaFin
                          ? true
                          : 'La fecha fin debe ser igual o posterior al inicio',
                    }}
                    render={({ field }) => (
                      <DatePicker
                        id="create-rent-fecha-fin"
                        selected={field.value ? new Date(field.value + 'T12:00:00') : null}
                        onChange={(date: Date | null) => field.onChange(date ? date.toISOString().slice(0, 10) : '')}
                        onBlur={field.onBlur}
                        minDate={minFechaFin ? new Date(minFechaFin + 'T12:00:00') : undefined}
                        dateFormat="yyyy-MM-dd"
                        locale="es"
                        placeholderText="Seleccione la fecha"
                        className={`form-control form-control-lg ${errors.fechaFin ? 'is-invalid' : ''}`}
                        autoComplete="off"
                      />
                    )}
                  />
                  {errors.fechaFin && (
                    <div className="invalid-feedback d-block">{errors.fechaFin.message}</div>
                  )}
                  <small className="text-muted">Formato: AAAA-MM-DD</small>
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
                    {librosIds.length === 0 ? (
                      <p className="text-muted small mb-0">No hay libros agregados.</p>
                    ) : (
                      books
                        .filter((book) => librosIds.includes(book.id))
                        .map((book) => (
                          <div
                            key={book.id}
                            className="create-rent__book-item create-rent__book-item--selected"
                            onClick={() => toggleBookId(book.id)}
                            onKeyDown={(e) => e.key === 'Enter' && toggleBookId(book.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input create-rent__book-check"
                              checked
                              onChange={() => toggleBookId(book.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="create-rent__book-title">{book.titulo}</span>
                            <span className="create-rent__book-meta text-muted small">
                              {book.autor} · ID {book.id}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                  {librosIds.length > 0 && (
                    <p className="text-muted small mt-2 mb-0">
                      Agrega libros desde el <Link to="/books">catálogo</Link>.
                    </p>
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
