export interface IPaginate<T> {
    first: number,
    prev: number | null,
    next: number,
    last: number,
    pages: number,
    items: number,
    data: T[]
}

/** Props derivadas de la paginación del backend (IPaginate) + callback de cambio de página */
export type PaginationPageProps = Pick<
    IPaginate<unknown>,
    'first' | 'prev' | 'next' | 'last' | 'pages'
> & {
    currentPage?: number;
    onPageChange: (page: number) => void;
};