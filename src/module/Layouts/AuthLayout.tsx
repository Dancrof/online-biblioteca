import { Outlet } from "react-router"

export const AuthLayout = () => {
    return (
        <div className="container bg-light vh-100 d-flex justify-content-center align-items-center">
            {<Outlet />}
        </div>
    )
}
