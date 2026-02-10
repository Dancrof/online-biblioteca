import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Book } from '../../interfaces/IBook';
import type { IPaginate } from '../../interfaces/IPaginate';
import { PaginationPage } from '../Pagination/PaginationPage';
import { getBooks, postBook, putBook, deleteBook } from '../../Services/BookService';
import { CATEGORIAS, IDIOMAS } from '../../Config/constant';

type BookFormValues = Omit<Book, 'id'>;

const emptyBook: BookFormValues = {
  titulo: '',
  autor: '',
  anioPublicacion: new Date().getFullYear(),
  isbn: '',
  categoria: '',
  idioma: '',
  portada: '',
  sinopsis: '',
  criticas: '',
  disponible: true,
};

/**
 * Dashboard de administración de libros.
 * Permite crear, editar y eliminar libros usando react-hook-form.
 */
export const BooksAdminPage = () => {
  const [paginateBooks, setPaginateBooks] = useState<IPaginate<Book>>({
    data: [],
    first: 1,
    prev: null,
    next: 1,
    last: 1,
    pages: 1,
    items: 0,
  });
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    defaultValues: emptyBook,
  });

  const books = paginateBooks.data ?? [];

  /**
   * Carga una página de libros usando la API paginada
   */
  const loadPage = (page: number) => {
    setLoading(true);
    getBooks(page, 8)
      .then((data) => {
        setPaginateBooks(data);
        setCurrentPage(page);
      })
      .catch(() => {
        setPaginateBooks({
          data: [],
          first: 1,
          prev: null,
          next: 1,
          last: 1,
          pages: 1,
          items: 0,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * Cargar primera página al montar
   * (se envuelve en queueMicrotask para evitar setState síncrono directo en el efecto)
   */
  useEffect(() => {
    queueMicrotask(() => loadPage(1));
  }, []);

  /**
   * Cuando se selecciona un libro para editar, llenamos el formulario.
   */
  useEffect(() => {
    if (selectedBook) {
      reset(selectedBook);
    } else {
      reset(emptyBook);
    }
  }, [selectedBook, reset]);

  /**
   * Envío del formulario (crear / actualizar libro)
   */
  const onSubmit = async (values: BookFormValues) => {
    setSubmitError(null);
    try {
      if (selectedBook) {
        const updated = await putBook(selectedBook.id, values);
        if (!updated) {
          setSubmitError('No se pudo actualizar el libro.');
          return;
        }
      } else {
        const created = await postBook(values);
        if (!created) {
          setSubmitError('No se pudo crear el libro.');
          return;
        }
      }
      setSelectedBook(null);
      loadPage(currentPage);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al guardar el libro. Intenta de nuevo.';
      setSubmitError(message);
    }
  };

  /**
   * Eliminar libro
   */
  const handleDelete = async (book: Book) => {
    if (!window.confirm(`¿Eliminar el libro "${book.titulo}"?`)) return;
    const ok = await deleteBook(book.id);
    if (ok) {
      if (selectedBook?.id === book.id) {
        setSelectedBook(null);
      }
      // Si la página actual queda vacía tras borrar, retroceder una página si es posible
      const nextPage = books.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      loadPage(nextPage);
    } else {
      setSubmitError('No se pudo eliminar el libro.');
    }
  };

  /**
   * Cancelar edición
   */
  const handleCancelEdit = () => {
    setSelectedBook(null);
  };

  return (
    <div className="container-lg py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0">
          <i className="bi bi-book-half me-2" />
          Administración de libros
        </h1>
      </div>

      <div className="row g-4">
        {/* Formulario de creación / edición */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">
                {selectedBook ? 'Editar libro' : 'Nuevo libro'}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Título
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                    {...register('titulo', {
                      required: 'El título es obligatorio',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    })}
                  />
                  {errors.titulo && (
                    <div className="invalid-feedback d-block">{errors.titulo.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Autor
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.autor ? 'is-invalid' : ''}`}
                    {...register('autor', {
                      required: 'El autor es obligatorio',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                    })}
                  />
                  {errors.autor && (
                    <div className="invalid-feedback d-block">{errors.autor.message}</div>
                  )}
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Año de publicación
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.anioPublicacion ? 'is-invalid' : ''}`}
                        {...register('anioPublicacion', {
                          required: 'El año es obligatorio',
                          valueAsNumber: true,
                          min: { value: 1000, message: 'Año no válido' },
                          max: {
                            value: new Date().getFullYear(),
                            message: 'No puede ser mayor al año actual',
                          },
                        })}
                      />
                      {errors.anioPublicacion && (
                        <div className="invalid-feedback d-block">
                          {errors.anioPublicacion.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        ISBN
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.isbn ? 'is-invalid' : ''}`}
                        {...register('isbn', {
                          required: 'El ISBN es obligatorio',
                          minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                        })}
                      />
                      {errors.isbn && (
                        <div className="invalid-feedback d-block">{errors.isbn.message}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Categoría
                      </label>
                      <select
                        className={`form-select ${errors.categoria ? 'is-invalid' : ''}`}
                        {...register('categoria', {
                          required: 'La categoría es obligatoria',
                        })}
                      >
                        <option value="">-- Seleccionar categoría --</option>
                        {CATEGORIAS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.categoria && (
                        <div className="invalid-feedback d-block">{errors.categoria.message}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Idioma
                      </label>
                      <select
                        className={`form-select ${errors.idioma ? 'is-invalid' : ''}`}
                        {...register('idioma', {
                          required: 'El idioma es obligatorio',
                          validate: (v) =>
                            v && v.trim() !== '' ? true : 'El idioma es obligatorio',
                        })}
                      >
                        <option value="">-- Seleccionar idioma --</option>
                        {IDIOMAS.filter((i) => i.value !== '').map((idioma) => (
                          <option key={idioma.value} value={idioma.value}>
                            {idioma.label}
                          </option>
                        ))}
                      </select>
                      {errors.idioma && (
                        <div className="invalid-feedback d-block">{errors.idioma.message}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    URL de portada
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.portada ? 'is-invalid' : ''}`}
                    {...register('portada', {
                      required: 'La portada es obligatoria',
                    })}
                  />
                  {errors.portada && (
                    <div className="invalid-feedback d-block">{errors.portada.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Sinopsis
                  </label>
                  <textarea
                    className={`form-control ${errors.sinopsis ? 'is-invalid' : ''}`}
                    rows={3}
                    {...register('sinopsis', {
                      required: 'La sinopsis es obligatoria',
                      minLength: { value: 10, message: 'Mínimo 10 caracteres' },
                    })}
                  />
                  {errors.sinopsis && (
                    <div className="invalid-feedback d-block">{errors.sinopsis.message}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Críticas / reseñas
                  </label>
                  <textarea
                    className={`form-control ${errors.criticas ? 'is-invalid' : ''}`}
                    rows={3}
                    {...register('criticas')}
                  />
                  {errors.criticas && (
                    <div className="invalid-feedback d-block">{errors.criticas.message}</div>
                  )}
                </div>

                <div className="mb-3 form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="book-disponible"
                    {...register('disponible')}
                  />
                  <label className="form-check-label" htmlFor="book-disponible">
                    Libro disponible para alquiler
                  </label>
                </div>

                {submitError && (
                  <div className="alert alert-danger py-2" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    {submitError}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2 mt-3">
                  {selectedBook && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancelar edición
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando…' : selectedBook ? 'Actualizar libro' : 'Crear libro'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Listado de libros */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="h5 mb-0">Listado de libros</h2>
                  <small className="text-muted">
                    Página {currentPage} de {paginateBooks.pages}
                  </small>
                </div>
                <small className="text-muted">
                  Total: {paginateBooks.items}
                </small>
              </div>

              {loading ? (
                <p>Cargando libros…</p>
              ) : books.length === 0 ? (
                <p className="text-muted mb-0">No hay libros registrados.</p>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Título</th>
                          <th>Autor</th>
                          <th>Categoría</th>
                          <th>Idioma</th>
                          <th>Disponible</th>
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book.id}>
                            <td>{book.titulo}</td>
                            <td>{book.autor}</td>
                            <td>{book.categoria}</td>
                            <td>{book.idioma}</td>
                            <td>
                              {book.disponible ? (
                                <span className="badge bg-success">Sí</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm" role="group">
                                <button
                                  type="button"
                                  className="btn btn-outline-primary"
                                  onClick={() => setSelectedBook(book)}
                                >
                                  <i className="bi bi-pencil-square" /> Editar
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger"
                                  onClick={() => handleDelete(book)}
                                >
                                  <i className="bi bi-trash" /> Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3">
                    <PaginationPage
                      first={paginateBooks.first}
                      prev={paginateBooks.prev}
                      next={paginateBooks.next}
                      last={paginateBooks.last}
                      pages={paginateBooks.pages}
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

export default BooksAdminPage;

