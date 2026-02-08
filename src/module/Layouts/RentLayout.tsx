import { Outlet } from 'react-router'
import { FooterPage } from '../Footer/FooterPage'
import { HeaderPage } from '../Header/HeaderPage'
import './StylesLayouts/BookLayout.css'

export const RentLayout = () => {
  return (
     <div className="layout">
            {/* Header */}
            <HeaderPage />

            {/* Main Content */}
            <div className="layout__wrapper">
                {/* Main Content Area */}
                <main className="layout__main">
                    <Outlet />
                </main>
            </div>

            {/* Footer */}
            <FooterPage />
        </div>
  )
}
