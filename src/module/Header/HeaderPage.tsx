import { Link } from 'react-router'
import '../Layouts/StylesLayouts/BookLayout.css'
import { useRentCart } from '../../context/RentCartContext'

export const HeaderPage = () => {
    /**
     * Componente HeaderPage
     * @returns Componente HeaderPage
     */
    const { count } = useRentCart()

    /**
     * Renderizado del componente
     * @returns Renderizado del componente
     */
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
                                <Link to="/rents" className="layout__nav-link">Alquileres</Link>
                            </li>
                        </ul>
                    </nav>
                    <div className="layout__user">
                        <Link to="/auth" className="btn btn-outline-primary btn-sm">Login</Link>
                    </div>
                    <Link to="/rents/new" className="btn btn-outline-primary btn-sm position-relative">
                        <i className="bi bi-cart4"></i>
                        {count > 0 && (
                            <span className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill">
                                {count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    )
}
