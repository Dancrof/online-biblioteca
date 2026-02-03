import { useEffect, useState } from 'react';
import './Styles/BookListPage.css';
import { getBooks } from '../../Services/BookService';
import { useNavigate } from 'react-router';

interface Book {
  id: number;
  titulo: string;
  autor: string;
  anioPublicacion: number;
  isbn: string;
  categoria: string;
  idioma: string;
  portada: string;
  sinopsis: string;
  criticas: string;
  disponible: boolean;
}

export default function BookListPage() {


  const [books, setBooks] = useState<Book[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Aqui se podria cargar la lista de libros desde un servicio
    getBooks().then((data) => setBooks(data));
  }, []);

  return (
    <main className="book-list">
      <div className="container-lg py-5">
        <h1 className="book-list__title mb-5">Catálogo de Libros</h1>

        <div className="row g-4">
          {books?.map((book) => (
            <div className="col-12 col-sm-6 col-lg-3" key={book.id}>
              <article className={`book-card ${book.disponible ? 'book-card--available' : 'book-card--unavailable'}`}>

                {/* Imagen de la portada */}
                <div className="book-card__image-wrapper">
                  <img
                    src={book.portada}
                    alt={`Portada de ${book.titulo}`}
                    className="book-card__image img-fluid"
                    onClick={() => navigate(`${book.id}`)}
                  />
                  <span className={`book-card__badge ${book.disponible ? 'book-card__badge--available' : 'book-card__badge--unavailable'}`}>
                    {book.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="book-card__body card-body">
                  <h2 className="book-card__title card-title line-clamp-1" title={book.titulo}>{book.titulo}</h2>

                  <p className="book-card__author card-subtitle mb-3 line-clamp-1" title={book.autor}>
                    <strong>Autor:</strong> {book.autor}
                  </p>

                  {/* Metadatos */}
                  <div className="book-card__metadata mb-3">
                    <div className="book-card__meta-item">
                      <span className="book-card__meta-label">Año de publicación:</span>
                      <span className="book-card__meta-value badge bg-info">{book.anioPublicacion}</span>
                    </div>
                    <div className="book-card__meta-item">
                      <span className="book-card__meta-label">Categoría:</span>
                      <span className="book-card__meta-value badge bg-primary">{book.categoria}</span>
                    </div>
                    <div className="book-card__meta-item">
                      <span className="book-card__meta-label">Idioma:</span>
                      <span className="book-card__meta-value badge bg-secondary">{book.idioma}</span>
                    </div>
                  </div>

                  {/* Sinopsis */}
                  <div className="book-card__section mb-3">
                    <h5 className="book-card__section-title">Sinopsis</h5>
                    <p className="book-card__sinopsis card-text line-clamp-1" title={book.sinopsis}>{book.sinopsis}</p>
                  </div>

                  {/* Críticas */}
                  <div className="book-card__section mb-3">
                    <h5 className="book-card__section-title">Críticas</h5>
                    <p className="book-card__critics card-text line-clamp-1" title={book.criticas}>{book.criticas}</p>
                  </div>

                  {/* Footer con ISBN y botón */}
                  <div className="book-card__footer border-top pt-3 mt-3">
                    <small className="book-card__isbn text-muted">ISBN: {book.isbn}</small>
                    <button 
                    className="btn btn-primary mt-3 w-100" 
                    disabled={!book.disponible}
                    onClick={() => navigate(`books/${book.id}`)}
                    >
                      Reservar libro
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
