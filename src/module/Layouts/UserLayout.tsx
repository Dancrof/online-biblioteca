import { HeaderPage } from '../Header/HeaderPage'
import { Outlet } from 'react-router'
import { FooterPage } from '../Footer/FooterPage'

export default function UserLayout(){
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
