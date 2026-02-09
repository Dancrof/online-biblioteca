import { useState } from 'react';
import { Outlet } from 'react-router';
import './StylesLayouts/BookLayout.css';
import { SidebarPage } from '../Sidebar/SidebarPage';
import { FooterPage } from '../Footer/FooterPage';
import { HeaderPage } from '../Header/HeaderPage';
import type { BookFiltersState } from '../../interfaces/IBook';

const initialFilters: BookFiltersState = {
  categoria: null,
  idioma: null,
  anioMax: null,
  soloDisponibles: false,
};

export default function BookLayout() {
  const [filters, setFilters] = useState<BookFiltersState>(initialFilters);

  return (
    <div className="layout">
      <HeaderPage />
      <div className="layout__wrapper">
        <SidebarPage filters={filters} setFilters={setFilters} />
        <main className="layout__main">
          <Outlet context={{ filters, setFilters }} />
        </main>
      </div>
      <FooterPage />
    </div>
  );
}
