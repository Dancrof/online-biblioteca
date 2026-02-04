import { Link } from 'react-router'
import '../Layouts/StylesLayouts/BookLayout.css'

export const HeaderPage = () => {
    return (
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
                        <Link to="/auth" className="btn btn-outline-primary btn-sm">Login</Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
