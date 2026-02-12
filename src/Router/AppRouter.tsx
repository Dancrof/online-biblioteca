import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import BookListPage from '../module/Books/BookListPage'
import { Suspense, type JSX } from 'react'
import React from 'react'
import { LoadingPage } from '../module/Loading/LoadingPage'
import { AuthLayout } from '../module/Layouts/AuthLayout'
import { RegisterPage } from '../module/Auth/RegisterPage'
import { LoginPage } from '../module/Auth/LoginPage'
import { CreateRent } from '../module/Rents/CreateRent'
import { RentLayout } from '../module/Layouts/RentLayout'
import { CreateUser } from '../module/User/CreateUser'
import { ProfilePage } from '../module/User/ProfilePage'
import { RentCartProvider } from '../context/RentCartContext'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { ROLE_ADMIN } from '../Config/constant'

const BookLayout = React.lazy(() => import('../module/Layouts/BookLayout'))
const BookDetail = React.lazy(() => import('../module/Books/BookDetailPage'))
const UserLayout = React.lazy(() => import('../module/Layouts/UserLayout'))
const RentListPage = React.lazy(() => import("../module/Rents/RentListPage"))
const RentDetailPage = React.lazy(() => import("../module/Rents/RentDetailPage"))
const AdminLayout = React.lazy(() => import('../module/Admin/AdminLayout'))
const BooksAdminPage = React.lazy(() => import('../module/Admin/BooksAdminPage'))
const RentsAdminPage = React.lazy(() => import('../module/Admin/RentsAdminPage'))
const UsersAdminPage = React.lazy(() => import('../module/Admin/UsersAdminPage'))

/* Componente de enrutamiento principal de la aplicación */
const RequireAuth = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    return children;
};

/** Componente que redirige a /books si el usuario ya está autenticado */
const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/books" replace />;
    }
    return children;
};


/* Componente que protege rutas exclusivas para administradores */
const RequireAdmin = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    if (user?.rol !== ROLE_ADMIN) {
        return <Navigate to="/books" replace />;
    }
    return children;
};

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
            <RentCartProvider>
            <Routes>
                <Route path='/auth' element={
                    <Suspense fallback={<LoadingPage />}>
                        <RedirectIfAuthenticated>
                            <AuthLayout />
                        </RedirectIfAuthenticated>
                    </Suspense>
                } >
                    <Route index element={<LoginPage />} />
                    <Route path='register' element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/auth" />} />
                </Route>
                <Route path='/users' element={
                    <Suspense fallback={<LoadingPage />}>
                        <RequireAuth>
                            <UserLayout />
                        </RequireAuth>
                    </Suspense>
                } >
                    <Route path="new" element={<CreateUser />} />
                    <Route path="*" element={<Navigate to="/users" />} />
                </Route>
                <Route path='/profile' element={
                    <Suspense fallback={<LoadingPage />}>
                        <RequireAuth>
                            <UserLayout />
                        </RequireAuth>
                    </Suspense>
                }>
                    <Route index element={<ProfilePage />} />
                    <Route path="*" element={<Navigate to="/profile" replace />} />
                </Route>
                <Route path="/books" element={
                    <Suspense fallback={<LoadingPage />}>
                        <BookLayout />
                    </Suspense>
                } >
                    <Route index element={
                        <Suspense fallback={<LoadingPage />}>
                            <BookListPage />
                        </Suspense>

                    } />
                    <Route path=":id" element={
                        <Suspense fallback={<LoadingPage />}>
                            <BookDetail />
                        </Suspense>

                    } />
                </Route>
                <Route path='/rents' element={
                    <Suspense fallback={<LoadingPage />}>
                        <RequireAuth>
                            <RentLayout />
                        </RequireAuth>
                    </Suspense>
                } >
                   <Route index element={
                        <Suspense fallback={<LoadingPage />}>
                            <RentListPage />
                        </Suspense>

                    } />
                    <Route path=":id" element={
                        <Suspense fallback={<LoadingPage />}>
                            <RentDetailPage />
                        </Suspense>
                    } />
                    <Route path="new" element={<CreateRent />} />
                    <Route path="*" element={<Navigate to="/rents" />} />
                </Route>
                <Route path='/admin' element={
                    <Suspense fallback={<LoadingPage />}>
                        <RequireAdmin>
                            <AdminLayout />
                        </RequireAdmin>
                    </Suspense>
                }>
                    <Route index element={<Navigate to="/admin/books" />} />
                    <Route path='books' element={
                        <Suspense fallback={<LoadingPage />}>
                            <BooksAdminPage />
                        </Suspense>
                    } />
                    <Route path='rents' element={
                        <Suspense fallback={<LoadingPage />}>
                            <RentsAdminPage />
                        </Suspense>
                    } />
                    <Route path='users' element={
                        <Suspense fallback={<LoadingPage />}>
                            <UsersAdminPage />
                        </Suspense>
                    } />
                </Route>
                <Route path="/users/new" element={<CreateUser />} />
                <Route path="/" element={<Navigate to="/books" />} />
                <Route path="*" element={<Navigate to="/books" />} />
            </Routes>
            </RentCartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
