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

export interface BookQueryParams {
    titulo?: string;
    autor?: string;
    categoria?: string;
    idioma?: string;
    disponible?: boolean;
    anioPublicacion?: number;

    // json-server extras
    sort?: keyof Book;
    order?: "asc" | "desc";
}
