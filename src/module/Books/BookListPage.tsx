import { useEffect, useState, useCallback, useMemo } from 'react';
import './Styles/BookListPage.css';
import { filterBooks, filtersToQueryParams } from '../../Services/BookService';
import { useNavigate, useOutletContext } from 'react-router';
import { PaginationPage } from '../Pagination/PaginationPage';
import type { IPaginate } from '../../interfaces/IPaginate';
import type { BookFiltersState } from '../../interfaces/IBook';
import type { Book } from '../../interfaces/IBook';
import { ITEMS_PER_PAGE } from '../../Config/constant';
import { useRentCart } from '../../context/RentCartContext';



type BookListOutletContext = { filters: BookFiltersState };

function buildPaginate(allBooks: Book[], currentPage: number, perPage: number): IPaginate<Book> {
  const items = allBooks.length;
  const pages = Math.max(1, Math.ceil(items / perPage));
  const page = Math.max(1, Math.min(currentPage, pages));
  const start = (page - 1) * perPage;
  const data = allBooks.slice(start, start + perPage);
  return {
    data,
    first: 1,
    prev: page > 1 ? page - 1 : null,
    next: Math.min(page + 1, pages),
    last: pages,
    pages,
    items,
  };
}

export default function BookListPage() {
  const { filters } = useOutletContext<BookListOutletContext>();
  const [allFilteredBooks, setAllFilteredBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToRentCart } = useRentCart();

  const normalizedSearchText = useMemo(
    () => filters.searchText?.trim().toLowerCase() ?? "",
    [filters.searchText]
  );

  const navigate = useNavigate();

  const loadFilteredBooks = useCallback(() => {
    const queryParams = filtersToQueryParams(filters);
    filterBooks(queryParams).then((books) => {
      setAllFilteredBooks(books);
      setCurrentPage(1);
    });
  }, [filters]);

  useEffect(() => {
    loadFilteredBooks();
  }, [loadFilteredBooks]);

  const visibleBooks = useMemo(() => {
    if (!normalizedSearchText) return allFilteredBooks;

    return allFilteredBooks.filter((book) => {
      const query = normalizedSearchText;
      return (
        book.titulo.toLowerCase().includes(query) ||
        book.autor.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query)
      );
    });
  }, [allFilteredBooks, normalizedSearchText]);

  const paginateBooks = useMemo(
    () => buildPaginate(visibleBooks, currentPage, ITEMS_PER_PAGE),
    [visibleBooks, currentPage]
  );

  const loadPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <main className="book-list">
      <div className="container-lg py-5">
        <h1 className="book-list__title mb-5">Catálogo de Libros</h1>

        <div className="row g-4">
          {paginateBooks.data?.map((book) => (
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
                      onClick={() => {
                        addToRentCart(book.id);
                        navigate('/rents/new');
                      }}
                    >
                      Reservar libro
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
        <div className='pt-5'>
        <PaginationPage
          first={paginateBooks.first}
          prev={paginateBooks.prev}
          next={paginateBooks.next}
          last={paginateBooks.last}
          pages={paginateBooks.pages}
          onPageChange={loadPage}
        />
        </div>
      </div>
    </main>
  );
}
