import { useEffect, useState } from 'react';
import './Styles/RentPage.css';
import { getRents } from '../../Services/RentService';
import type { IRent } from '../../interfaces/IRent';
import { PaginationPage } from '../Pagination/PaginationPage';
import type { IPaginate } from '../../interfaces/IPaginate';

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function RentListPage() {
  const [paginateRents, setPaginateRents] = useState<IPaginate<IRent>>({
    data: [],
    first: 1,
    prev: null,
    next: 1,
    last: 1,
    pages: 1,
    items: 0
  });

  const loadPage = (page: number) => {
    getRents(page).then((data) => {
      setPaginateRents(data);
    });
  };

  useEffect(() => {
    loadPage(1);
  }, []);

    return (
    <main className="rent-list">
      <div className="container-lg py-5">
        <h1 className="rent-list__title mb-5">Alquileres</h1>

        {(paginateRents.data ?? []).length === 0 ? (
          <p className="rent-list__empty">
            No hay alquileres registrados.
          </p>
        ) : (
          <div className="row g-4">
            {(paginateRents.data ?? []).map((rent) => (
              <div className="col-12 col-md-6 col-lg-4" key={rent.id}>
                <article
                  className={`rent-card ${rent.estado ? 'rent-card--active' : 'rent-card--inactive'}`}
                >
                  <div className="rent-card__header">
                    <span className="rent-card__id">Alquiler #{rent.id}</span>
                    <span
                      className={`rent-card__badge ${rent.estado ? 'rent-card__badge--active' : 'rent-card__badge--inactive'}`}
                    >
                      {rent.estado ? 'Activo' : 'Finalizado'}
                    </span>
                  </div>

                  <div className="rent-card__body">
                    <div className="rent-card__row">
                      <span className="rent-card__label">Usuario:</span>
                      <span className="rent-card__value">ID {rent.usuarioId}</span>
                    </div>

                    <div className="rent-card__row">
                      <span className="rent-card__label">Fechas:</span>
                      <div className="rent-card__dates">
                        <span className="rent-card__date" title="Inicio">
                          {formatDate(rent.fechaInicio)}
                        </span>
                        <span className="rent-card__date rent-card__date--end" title="Fin">
                          {formatDate(rent.fechaFin)}
                        </span>
                      </div>
                    </div>

                    <div className="rent-card__row">
                      <span className="rent-card__label">Libros:</span>
                      <div className="rent-card__books">
                        {(rent.librosIds ?? []).map((bookId) => (
                          <span key={bookId} className="rent-card__book-id">
                            #{bookId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='pt-5'>
        <PaginationPage
          first={paginateRents.first}
          prev={paginateRents.prev}
          next={paginateRents.next}
          last={paginateRents.last}
          pages={paginateRents.pages}
          onPageChange={loadPage}
        />
        </div>
    </main>
  );
};
