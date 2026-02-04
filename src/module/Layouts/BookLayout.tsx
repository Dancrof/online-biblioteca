import { Outlet } from 'react-router';
import './StylesLayouts/BookLayout.css';
import { SidebarPage } from '../Sidebar/SidebarPage';
import { FooterPage } from '../Footer/FooterPage';
import { HeaderPage } from '../Header/HeaderPage';


export default function BookLayout() {
    return (
        <div className="layout">
            {/* Header */}
            <HeaderPage />

            {/* Main Content */}
            <div className="layout__wrapper">
                {/* Sidebar */}
                <SidebarPage />
                {/* Main Content Area */}
                <main className="layout__main">
                    <Outlet />
                </main>
            </div>

            {/* Footer */}
            <FooterPage />
        </div>
    );
}
