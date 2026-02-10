import "../Layouts/StylesLayouts/BookLayout.css";
import type { BookFiltersState } from "../../interfaces/IBook";
import { ANIO_MAX, ANIO_MIN, CATEGORIAS, IDIOMAS  } from "../../Config/constant";



/**
 * Props para el componente SidebarPage
 * @param filters - Filtros actuales
 * @param setFilters - Función para actualizar los filtros
 */
interface SidebarPageProps {
  filters: BookFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<BookFiltersState>>;
}

/**
 * Componente SidebarPage
 * @param filters - Filtros actuales
 * @param setFilters - Función para actualizar los filtros
 * @returns Componente SidebarPage
 */
export const SidebarPage = ({ filters, setFilters }: SidebarPageProps) => {
  const handleCategoria = (categoria: string) => {
    setFilters((prev) => ({
      ...prev,
      categoria: prev.categoria === categoria ? null : categoria,
    }));
  };
/**
 * Manejador para el cambio de idioma
 * @param e - Evento de cambio de idioma
 */
  const handleIdioma = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    setFilters((prev) => ({ ...prev, idioma: value }));
  };

  /**
   * Manejador para el cambio de texto de búsqueda
   * @param e - Evento de cambio de texto de búsqueda
   */
  const handleSearchText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      searchText: value || undefined,
    }));
  };

  /**
   * Manejador para el cambio de año máximo
   * @param e - Evento de cambio de año máximo
   */
  const handleAnioMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setFilters((prev) => ({ ...prev, anioMax: value }));
  };

  /**
   * Manejador para el cambio de solo disponibles
   * @param e - Evento de cambio de solo disponibles
   */
  const handleSoloDisponibles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, soloDisponibles: e.target.checked }));
  };

  return (
    <aside className="layout__sidebar">
      <div className="layout__sidebar-content">
        <div className="layout__sidebar-filter">
          <label className="form-label" htmlFor="book-search">
            Buscar (título, ISBN o autor)
          </label>
          <input
            id="book-search"
            type="text"
            className="form-control form-control-sm"
            placeholder="Escribe para filtrar..."
            value={filters.searchText ?? ""}
            onChange={handleSearchText}
          />
        </div>

        <h3 className="layout__sidebar-title">Categorías</h3>
        <ul className="layout__sidebar-list">
          {CATEGORIAS.map((cat) => (
            <li className="layout__sidebar-item" key={cat}>
              <button
                type="button"
                className={`layout__sidebar-link ${filters.categoria === cat ? "layout__sidebar-link--active" : ""}`}
                onClick={() => handleCategoria(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>

        <hr className="layout__sidebar-divider" />

        <h3 className="layout__sidebar-title">Filtros</h3>
        <div className="layout__sidebar-filter">
          <label className="form-label">Idioma</label>
          <select
            className="form-select form-select-sm"
            value={filters.idioma ?? ""}
            onChange={handleIdioma}
          >
            {IDIOMAS.map(({ value, label }) => (
              <option key={value || "all"} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="layout__sidebar-filter">
          <label className="form-label">
            Año de publicación hasta: {filters.anioMax ?? ANIO_MAX}
          </label>
          <input
            type="range"
            className="form-range"
            min={ANIO_MIN}
            max={ANIO_MAX}
            value={filters.anioMax ?? ANIO_MAX}
            onChange={handleAnioMax}
          />
        </div>

        <div className="layout__sidebar-filter">
          <label className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={filters.soloDisponibles}
              onChange={handleSoloDisponibles}
            />
            <span className="form-check-label">Solo disponibles</span>
          </label>
        </div>
      </div>
    </aside>
  );
};
