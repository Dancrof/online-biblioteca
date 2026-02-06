
export const PaginationPage = ({next = 1, prev = 1}: {next: number, prev: number | null}) => {
    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination">
                <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                <li className="page-item"><a className="page-link" href="#">{prev}</a></li>
                <li className="page-item"><a className="page-link" href="#">{next}</a></li>
                <li className="page-item"><a className="page-link" href="#">Next</a></li>
            </ul>
        </nav>
    )
}
