import { Link, Outlet } from 'react-router';
import './StylesLayouts/BookLayout.css';


export default function BookLayout() {
    return (
        <div className="layout">
            {/* Header */}
            <header className="layout__header">
                <div className="container-fluid">
                    <div className="layout__header-content">
                        <div className="layout__logo">
                            <h1 className="layout__title">📚 Online Biblioteca</h1>
                        </div>
                        <nav className="layout__nav">
                            <ul className="layout__nav-list">
                                <li className="layout__nav-item">
                                    <Link to="/" className="layout__nav-link">Inicio</Link>
                                </li>
                                <li className="layout__nav-item">
                                    <Link to="/books" className="layout__nav-link">Catálogo</Link>
                                </li>
                                <li className="layout__nav-item">
                                    <Link to="/contacto" className="layout__nav-link">Contacto</Link>
                                </li>
                            </ul>
                        </nav>
                        <div className="layout__user">
                            <button className="btn btn-outline-primary btn-sm">Login</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="layout__wrapper">
                {/* Sidebar */}
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

                {/* Main Content Area */}
                <main className="layout__main">
                    <Outlet />
                </main>
            </div>

            {/* Footer */}
            <footer className="layout__footer">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 col-md-4 layout__footer-section">
                            <h5 className="layout__footer-title">Sobre Nosotros</h5>
                            <p className="layout__footer-text">
                                Tu biblioteca digital con miles de libros disponibles en línea.
                            </p>
                        </div>
                        <div className="col-12 col-md-4 layout__footer-section">
                            <h5 className="layout__footer-title">Enlaces Útiles</h5>
                            <ul className="layout__footer-list">
                                <li><a href="#" className="layout__footer-link">Términos de servicio</a></li>
                                <li><a href="#" className="layout__footer-link">Privacidad</a></li>
                                <li><a href="#" className="layout__footer-link">FAQ</a></li>
                            </ul>
                        </div>
                        <div className="col-12 col-md-4 layout__footer-section">
                            <h5 className="layout__footer-title">Síguenos</h5>
                            <div className="layout__social">
                                <a href="#" className="layout__social-link">Facebook</a>
                                <a href="#" className="layout__social-link">Twitter</a>
                                <a href="#" className="layout__social-link">Instagram</a>
                            </div>
                        </div>
                    </div>
                    <div className="layout__footer-bottom">
                        <p>&copy; 2026 Online Biblioteca. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
