export interface Book {
  id: number
  titulo: string
  autor: string
  anioPublicacion: number
  isbn: string
  categoria: string
  idioma: string
  portada: string
  sinopsis: string
  criticas: string
  disponible: boolean
}

export interface BookPageProps {
  book: Book
}

/** Estado de filtros del sidebar para el listado de libros */
export interface BookFiltersState {
  categoria: string | null;
  idioma: string | null;
  anioMax: number | null;
  soloDisponibles: boolean;
}

export interface BookQueryParams {
    titulo?: string;
    autor?: string;
    categoria?: string;
    idioma?: string;
    disponible?: boolean;
    anioPublicacion?: number;
    /** Año mínimo de publicación (json-server: anioPublicacion_gte) */
    anioMin?: number;
    /** Año máximo de publicación (json-server: anioPublicacion_lte) */
    anioMax?: number;

    // json-server extras
    sort?: keyof Book;
    order?: "asc" | "desc";
}
