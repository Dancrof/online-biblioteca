import './Styles/BookDetailPage.css';
import type { Book } from '../../interfaces/IBook';
import { useEffect, useState } from 'react';
import { getBookById } from '../../Services/BookService';
import { Link, useNavigate, useParams } from 'react-router';



export default function BookDetailPage() {


    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [bookData, setBookData] = useState<Book | null>(null);

    useEffect(() => {
        if (id) {
            const bookId = parseInt(id, 10);
            getBookById(bookId).then((data) => setBookData(data));
        }
    }, [id]);


  return (
    <main className="book-detail">
      <div className="book-detail__container">
        <div className="book-detail__image-wrapper">
          <img src={bookData?.portada} alt={`Portada de ${bookData?.titulo}`} className="book-detail__image" />
        </div>

        <section className="book-detail__info">
          <h1 className="book-detail__title line-clamp-1">{bookData?.titulo}</h1>
          <div className="book-detail__subtitle">{bookData?.autor} — <span className="book-detail__muted">{bookData?.anioPublicacion}</span></div>

          <div className="book-detail__meta">
            <div className="book-detail__meta-item">Categoría: {bookData?.categoria}</div>
            <div className="book-detail__meta-item">Idioma: {bookData?.idioma}</div>
            <div className="book-detail__meta-item">ISBN: {bookData?.isbn}</div>
          </div>

          <p className="book-detail__synopsis line-clamp-3">{bookData?.sinopsis}</p>

          <div className="book-detail__details">
            <div>
              <div className="book-detail__detail-label">Disponibilidad</div>
              <div className="book-detail__detail-value">{bookData?.disponible ? 'Disponible' : 'No disponible'}</div>
            </div>
            <div>
              <div className="book-detail__detail-label">Críticas</div>
              <div className="book-detail__detail-value">{bookData?.criticas}</div>
            </div>
          </div>

          <div className="book-detail__actions">
            <button
              className={`book-detail__btn book-detail__btn--primary ${!bookData?.disponible ? 'book-detail__btn--disabled' : ''}`}
              onClick={() => bookData?.disponible && navigate('/rents/new', { state: { bookId: bookData.id } })}
              disabled={!bookData?.disponible}
            >
              Reservar libro
            </button>

            <Link to="/books" className="book-detail__btn book-detail__btn--secondary">Volver</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
