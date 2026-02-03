export const LoadingPage = () => {
    return (

        <main className="loading-page">
            <div className="loading-page__spinners d-flex justify-content-center align-items-center gap-3 flex-wrap p-4">
                <div className="spinner-grow text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div className="spinner-grow text-dark" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
            <div className="container-lg py-5 d-flex justify-content-center align-items-center">
                <span className="visually-hidden">Loading...</span>
            </div>
        </main>

    )
}
