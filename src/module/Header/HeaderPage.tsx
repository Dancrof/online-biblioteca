import { Link } from 'react-router'
import '../Layouts/StylesLayouts/BookLayout.css'
import { useRentCart } from '../../context/RentCartContext'
import { useAuth } from '../../context/AuthContext'
import { ROLE_ADMIN } from '../../Config/constant'



export const HeaderPage = () => {
    const { count } = useRentCart()
    const { isAuthenticated, user, logout } = useAuth()
    const isAdmin = user?.rol === ROLE_ADMIN

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
                    {isAdmin && (
                        <div className="layout__nav-item">
                            <Link to="/admin" className="layout__nav-link">Admin</Link>
                        </div>
                    )}
                    <div className="layout__user">
                        {isAuthenticated ? (
                            <div className="dropdown">
                                <button
                                    type="button"
                                    className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 dropdown-toggle p-0 border-0"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    id="userMenuDropdown"
                                >
                                    <span
                                        className="rounded-circle bg-primary bg-opacity-25 d-flex align-items-center justify-content-center text-primary fw-semibold"
                                        style={{ width: 36, height: 36, fontSize: '0.9rem' }}
                                    >
                                        {user?.nombreCompleo?.charAt(0)?.toUpperCase() ?? '?'}
                                    </span>
                                    <span className="d-none d-sm-inline">{user?.nombreCompleo}</span>
                                    <i className="bi bi-chevron-down small" />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenuDropdown">
                                    <li>
                                        <Link to="/profile" className="dropdown-item">
                                            <i className="bi bi-person-circle me-2" />
                                            Mi perfil
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button
                                            type="button"
                                            className="dropdown-item text-danger"
                                            onClick={logout}
                                        >
                                            <i className="bi bi-box-arrow-right me-2" />
                                            Salir
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <Link to="/auth" className="btn btn-outline-primary btn-sm">Login</Link>
                        )}
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
