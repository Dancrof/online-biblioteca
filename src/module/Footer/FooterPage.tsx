import '../Layouts/StylesLayouts/BookLayout.css'

export const FooterPage = () => {
    return (
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
    )
}
