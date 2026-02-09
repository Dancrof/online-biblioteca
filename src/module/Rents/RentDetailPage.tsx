import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getRentById, deleteRent } from '../../Services/RentService';
import { getUsers } from '../../Services/UserService';
import { getBookById } from '../../Services/BookService';
import type { IRent } from '../../interfaces/IRent';
import type { Book } from '../../interfaces/IBook';
import './Styles/RentPage.css';

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function RentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rent, setRent] = useState<IRent | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  }, [id]);

  const handleDelete = () => {
    if (!rent) return;
    if (!window.confirm('¿Eliminar este alquiler? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    deleteRent(rent.id, rent.librosIds ?? [])
      .then(() => navigate('/rents'))
      .catch(() => {
        setDeleting(false);
        window.alert('No se pudo eliminar el alquiler. Intenta de nuevo.');
      });
  };

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
          <div className="rent-detail__header-actions">
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
      </div>
    </main>
  );
}
