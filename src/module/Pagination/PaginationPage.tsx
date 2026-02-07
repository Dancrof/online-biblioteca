import type { PaginationPageProps } from "../../interfaces/IPaginate";

/**
 * Componente de paginación para la lista de libros.
 * 
 * @param {PaginationPageProps} props - Props del componente.
 * @param {number} props.first - Página inicial.
 * @param {number | null} props.prev - Página anterior.
 * @param {number} props.next - Página siguiente.
 * @param {number} props.last - Última página.
 * @param {number} props.pages - Número de páginas.
 * @param {number | undefined} props.currentPage - Página actual.
 * @param {Function} props.onPageChange - Callback para cambiar de página.
 */
export const PaginationPage = ({ first, prev, next, last, pages, currentPage, onPageChange }: PaginationPageProps) => {
    const current = currentPage ?? (prev === null ? first : prev + 1);
    const hasPrev = prev !== null;
    const hasNext = next <= last;

    const handleClick = (e: React.MouseEvent, page: number) => {
        e.preventDefault();
        onPageChange(page);
    };

    const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);
    const showPages = pages <= 7
        ? pageNumbers
        : current <= 4
            ? [1, 2, 3, 4, 5, '...', pages]
            : current >= pages - 3
                ? [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages]
                : [1, '...', current - 1, current, current + 1, '...', pages];

    return (
        <nav aria-label="Navegación de páginas">
            <ul className="pagination justify-content-center flex-wrap">
                <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        onClick={(e) => hasPrev && handleClick(e, prev!)}
                        disabled={!hasPrev}
                        aria-label="Página anterior"
                    >
                        Anterior
                    </button>
                </li>

                {showPages.map((p, i) =>
                    p === '...' ? (
                        <li key={`ellipsis-${i}`} className="page-item disabled">
                            <span className="page-link">…</span>
                        </li>
                    ) : (
                        <li
                            key={p}
                            className={`page-item ${p === current ? 'active' : ''}`}
                            aria-current={p === current ? 'page' : undefined}
                        >
                            <button
                                type="button"
                                className="page-link"
                                onClick={(e) => handleClick(e, p as number)}
                            >
                                {p}
                            </button>
                        </li>
                    )
                )}

                <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        onClick={(e) => hasNext && handleClick(e, next)}
                        disabled={!hasNext}
                        aria-label="Página siguiente"
                    >
                        Siguiente
                    </button>
                </li>
            </ul>
        </nav>
    );
};
