import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getRentById, deleteRent, extendRentDate } from '../../Services/RentService';
import { getUsers } from '../../Services/UserService';
import { getBookById } from '../../Services/BookService';
import type { IRent } from '../../interfaces/IRent';
import type { Book } from '../../interfaces/IBook';
import { useAuth } from '../../context/AuthContext';
import { getUiActionErrorMessage } from '../../Services/Segurity/Errors';
import './Styles/RentPage.css';

/**
 * Formatea una fecha a un formato legible
 * @param dateStr - La fecha a formatear
 * @returns La fecha formateada
 */
const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Componente RentDetailPage
 * @returns Componente RentDetailPage
 */
export default function RentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [rent, setRent] = useState<IRent | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [extending, setExtending] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extendError, setExtendError] = useState<string | null>(null);
  const [extendSuccess, setExtendSuccess] = useState<string | null>(null);

  /**
   * Efecto para obtener el alquiler y los libros
   */
  useEffect(() => {
    if (!id) {
      queueMicrotask(() => {
        setNotFound(true);
        setLoading(false);
      });
      return;
    }

    queueMicrotask(() => setLoading(true));
    getRentById(id)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          setRent(null);
          return;
        }

        const isAdmin = authUser?.rol === 'admin';
        const isOwner = authUser?.id != null && Number(authUser.id) === Number(data.usuarioId);
        if (!isAdmin && !isOwner) {
          setNotFound(true);
          setRent(null);
          return;
        }

        setRent(data);
        return data;
      })
      .then((data) => {
        if (!data) return;
        const uid = data.usuarioId;
        getUsers().then((users) => {
          if (users) {
            const u = users.find((x) => (typeof x.id === 'string' ? parseInt(x.id, 10) : x.id) === uid);
            setUserName(u ? `${u.nombreCompleo} ${u.apellidoCompleto}`.trim() : `ID ${uid}`);
          }
        });
        const ids = data.librosIds ?? [];
        if (ids.length === 0) {
          setBooks([]);
          return;
        }
        Promise.all(ids.map((bookId) => getBookById(bookId)))
          .then((results) => setBooks(results.filter((b): b is Book => b != null)));
      })
      .finally(() => setLoading(false));
  }, [id, authUser?.id, authUser?.rol]);

  /**
   * Manejador para eliminar el alquiler
   */
  const handleDelete = () => {
    if (!rent) return;
    if (authUser?.rol !== 'admin') return;
    if (!window.confirm('¿Eliminar este alquiler? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    deleteRent(rent.id, rent.librosIds ?? [])
      .then(() => navigate('/rents'))
      .catch((error) => {
        setDeleting(false);
        window.alert(getUiActionErrorMessage(error, 'No se pudo eliminar el alquiler. Intenta de nuevo.'));
      });
  };

  /**
   * Manejador para extender la fecha de vencimiento
   */
  const handleExtendDate = async () => {
    if (!rent || !id) return;
    setExtendError(null);
    setExtendSuccess(null);
    setExtending(true);

    try {
      const updatedRent = await extendRentDate(id, extensionDays);
      if (updatedRent) {
        setRent(updatedRent);
        setExtendSuccess(`Fecha extendida ${extensionDays} días exitosamente.`);
        setShowExtendModal(false);
        setTimeout(() => setExtendSuccess(null), 5000);
      } else {
        setExtendError('No se pudo extender la fecha del alquiler.');
      }
    } catch (error) {
      setExtendError(getUiActionErrorMessage(error, 'No se pudo extender la fecha.'));
    } finally {
      setExtending(false);
    }
  };

  /**
   * Renderizado del componente
   * @returns Renderizado del componente
   */
  if (loading) {
    return (
      <main className="rent-detail">
        <div className="container-lg py-5">
          <div className="rent-detail__loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3 text-muted">Cargando alquiler...</p>
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !rent) {
    return (
      <main className="rent-detail">
        <div className="container-lg py-5">
          <div className="rent-detail__not-found">
            <h2 className="rent-detail__not-found-title">Alquiler no encontrado</h2>
            <p className="text-muted">El alquiler solicitado no existe o fue eliminado.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/rents')}>
              Volver a alquileres
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="rent-detail">
      <div className="container-lg py-5">
        <div className="rent-detail__back mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/rents')}
          >
            ← Volver a alquileres
          </button>
        </div>

        <header className="rent-detail__header">
          <div className="rent-detail__header-top">
            <h1 className="rent-detail__title">Alquiler #{rent.id}</h1>
            <span
              className={`rent-detail__badge ${rent.estado ? 'rent-detail__badge--active' : 'rent-detail__badge--inactive'}`}
            >
              {rent.estado ? 'Activo' : 'Finalizado'}
            </span>
          </div>
          
          {extendSuccess && (
            <div className="alert alert-success py-2 mt-3" role="alert">
              <i className="bi bi-check-circle-fill me-2" />
              {extendSuccess}
            </div>
          )}
          
          {extendError && (
            <div className="alert alert-danger py-2 mt-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {extendError}
            </div>
          )}
          
          <div className="rent-detail__header-actions">
            {rent.estado && (
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={() => setShowExtendModal(true)}
                disabled={extending}
              >
                <i className="bi bi-calendar-plus me-2" />
                Extender fecha
              </button>
            )}
            {authUser?.rol === 'admin' && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar alquiler'
                )}
              </button>
            )}
          </div>
        </header>

        <section className="rent-detail__section">
          <h2 className="rent-detail__section-title">Datos del alquiler</h2>
          <dl className="rent-detail__grid">
            <div className="rent-detail__row">
              <dt className="rent-detail__label">Usuario</dt>
              <dd className="rent-detail__value">{userName}</dd>
            </div>
            <div className="rent-detail__row">
              <dt className="rent-detail__label">Fecha de inicio</dt>
              <dd className="rent-detail__value">{formatDate(rent.fechaInicio)}</dd>
            </div>
            <div className="rent-detail__row">
              <dt className="rent-detail__label">Fecha de fin</dt>
              <dd className="rent-detail__value">{formatDate(rent.fechaFin)}</dd>
            </div>
          </dl>
        </section>

        <section className="rent-detail__section">
          <h2 className="rent-detail__section-title">Libros alquilados</h2>
          {books.length === 0 ? (
            <p className="rent-detail__empty-books text-muted">No hay libros en este alquiler.</p>
          ) : (
            <div className="rent-detail__books">
              {books.map((book) => (
                <article key={book.id} className="rent-detail__book-card">
                  <h3 className="rent-detail__book-title">{book.titulo}</h3>
                  <dl className="rent-detail__book-fields">
                    <div className="rent-detail__book-row">
                      <dt>Autor</dt>
                      <dd>{book.autor}</dd>
                    </div>
                    <div className="rent-detail__book-row">
                      <dt>Año</dt>
                      <dd>{book.anioPublicacion}</dd>
                    </div>
                    <div className="rent-detail__book-row">
                      <dt>ISBN</dt>
                      <dd>{book.isbn}</dd>
                    </div>
                    <div className="rent-detail__book-row">
                      <dt>Categoría</dt>
                      <dd>{book.categoria}</dd>
                    </div>
                    <div className="rent-detail__book-row">
                      <dt>Idioma</dt>
                      <dd>{book.idioma}</dd>
                    </div>
                    <div className="rent-detail__book-row">
                      <dt>Sinopsis</dt>
                      <dd>{book.sinopsis || '—'}</dd>
                    </div>
                    <div className="rent-detail__book-row">
                      <dt>Críticas</dt>
                      <dd>{book.criticas || '—'}</dd>
                    </div>
                    <div className="rent-detail__book-row">
                      <dt>Disponible</dt>
                      <dd>{book.disponible ? 'Sí' : 'No'}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
        
        {/* Modal para extender fecha */}
        {showExtendModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Extender fecha de vencimiento</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowExtendModal(false)}
                    disabled={extending}
                  />
                </div>
                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Fecha actual de vencimiento: <strong>{formatDate(rent.fechaFin)}</strong>
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
                      {new Date(new Date(rent.fechaFin).getTime() + extensionDays * 24 * 60 * 60 * 1000)
                        .toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowExtendModal(false)}
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
    </main>
  );
}
