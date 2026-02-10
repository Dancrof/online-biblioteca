import { Outlet, NavLink } from 'react-router';
import { HeaderPage } from '../Header/HeaderPage';
import { FooterPage } from '../Footer/FooterPage';
import '../Layouts/StylesLayouts/BookLayout.css';

/**
 * Layout principal del dashboard de administrador.
 * Reutiliza el header y footer globales e incluye una
 * navegación secundaria para libros y alquileres.
 */
export const AdminLayout = () => {
  return (
    <div className="layout">
      <HeaderPage />

      <div className="layout__wrapper">
        <aside className="layout__sidebar">
          <div className="layout__sidebar-content">
            <h3 className="layout__sidebar-title">Administración</h3>
            <ul className="layout__sidebar-list">
              <li className="layout__sidebar-item">
                <NavLink
                  to="/admin/books"
                  className={({ isActive }) =>
                    `layout__sidebar-link ${isActive ? 'layout__sidebar-link--active' : ''}`
                  }
                >
                  <i className="bi bi-book-half me-2" />
                  Libros
                </NavLink>
              </li>
              <li className="layout__sidebar-item">
                <NavLink
                  to="/admin/rents"
                  className={({ isActive }) =>
                    `layout__sidebar-link ${isActive ? 'layout__sidebar-link--active' : ''}`
                  }
                >
                  <i className="bi bi-journal-bookmark me-2" />
                  Alquileres
                </NavLink>
              </li>
            </ul>
          </div>
        </aside>

        <main className="layout__main">
          <Outlet />
        </main>
      </div>

      <FooterPage />
    </div>
  );
};

export default AdminLayout;

