import "../Layouts/StylesLayouts/BookLayout.css";

export const SidebarPage = () => {
    return (
        <aside className="layout__sidebar">
            <div className="layout__sidebar-content">
                <h3 className="layout__sidebar-title">Categorías</h3>
                <ul className="layout__sidebar-list">
                    <li className="layout__sidebar-item">
                        <a href="#" className="layout__sidebar-link">Novelas</a>
                    </li>
                    <li className="layout__sidebar-item">
                        <a href="#" className="layout__sidebar-link">Ciencia Ficción</a>
                    </li>
                    <li className="layout__sidebar-item">
                        <a href="#" className="layout__sidebar-link">Misterio</a>
                    </li>
                    <li className="layout__sidebar-item">
                        <a href="#" className="layout__sidebar-link">Educación</a>
                    </li>
                    <li className="layout__sidebar-item">
                        <a href="#" className="layout__sidebar-link">Infantil</a>
                    </li>
                </ul>

                <hr className="layout__sidebar-divider" />

                <h3 className="layout__sidebar-title">Filtros</h3>
                <div className="layout__sidebar-filter">
                    <label className="form-label">Idioma</label>
                    <select className="form-select form-select-sm">
                        <option>Todos</option>
                        <option>Español</option>
                        <option>Inglés</option>
                        <option>Francés</option>
                    </select>
                </div>

                <div className="layout__sidebar-filter">
                    <label className="form-label">Año de publicación</label>
                    <input type="range" className="form-range" min="1900" max="2026" />
                </div>

                <div className="layout__sidebar-filter">
                    <label className="form-check">
                        <input type="checkbox" className="form-check-input" defaultChecked />
                        <span className="form-check-label">Solo disponibles</span>
                    </label>
                </div>
            </div>
        </aside>
    )
}
