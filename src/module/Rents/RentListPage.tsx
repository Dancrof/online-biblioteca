import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import './Styles/RentPage.css';
import { getRents } from '../../Services/RentService';
import type { IRent } from '../../interfaces/IRent';
import { PaginationPage } from '../Pagination/PaginationPage';
import type { IPaginate } from '../../interfaces/IPaginate';
import { useAuth } from '../../context/AuthContext';

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
 * Componente RentListPage
 * @returns Componente RentListPage
 */
export default function RentListPage() {
  const { user: authUser } = useAuth();
  const [allUserRents, setAllUserRents] = useState<IRent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(8);
  const [paginateRents, setPaginateRents] = useState<IPaginate<IRent>>({
    data: [],
    first: 1,
    prev: null,
    next: 1,
    last: 1,
    pages: 1,
    items: 0
  });
  /**
   * Construye una paginación a partir de una lista en memoria
   */
  const buildPaginate = (all: IRent[], page: number, limit: number): IPaginate<IRent> => {
    const items = all.length;
    const pages = Math.max(1, Math.ceil(items / limit));
    const safePage = Math.max(1, Math.min(page, pages));
    const start = (safePage - 1) * limit;
    const data = all.slice(start, start + limit);
    return {
      data,
      first: 1,
      prev: safePage > 1 ? safePage - 1 : null,
      next: safePage < pages ? safePage + 1 : pages,
      last: pages,
      pages,
      items,
    };
  };

  /**
   * Carga una página de alquileres
   * @param page - Número de página
   */
  const loadPage = (page: number) => {
    setCurrentPage(page);
    setPaginateRents(buildPaginate(allUserRents, page, perPage));
  };

  /**
   * Efecto para cargar todos los alquileres del usuario logueado
   */
  useEffect(() => {
    if (!authUser?.id) {
      queueMicrotask(() => {
        setAllUserRents([]);
        setCurrentPage(1);
        setPaginateRents(buildPaginate([], 1, perPage));
      });
      return;
    }

    let mounted = true;
    const userId = Number(authUser.id);

    const loadUserRents = async () => {
      try {
        const perRequest = 100;
        let page = 1;
        let totalPages = 1;
        const allRents: IRent[] = [];

        do {
          const res = await getRents(page, perRequest);
          allRents.push(...(res.data ?? []));
          totalPages = Math.max(1, res.last ?? res.pages ?? 1);
          page += 1;
        } while (page <= totalPages);

        const onlyUserRents = allRents.filter((rent) => Number(rent.usuarioId) === userId);

        if (!mounted) return;
        setAllUserRents(onlyUserRents);
        setCurrentPage(1);
        setPaginateRents(buildPaginate(onlyUserRents, 1, perPage));
      } catch {
        if (!mounted) return;
        setAllUserRents([]);
        setCurrentPage(1);
        setPaginateRents(buildPaginate([], 1, perPage));
      }
    };

    void loadUserRents();

    return () => {
      mounted = false;
    };
  }, [authUser?.id, perPage]);

  /**
   * Renderizado del componente
   * @returns Renderizado del componente
   */
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
                <Link to={`${rent.id}`} className="rent-card__link">
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
                      <span className="rent-card__value">
                        Tú
                      </span>
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
                </Link>
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
          currentPage={currentPage}
          onPageChange={loadPage}
        />
        </div>
    </main>
  );
};
