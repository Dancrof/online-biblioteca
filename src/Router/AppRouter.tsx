import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import BookListPage from '../module/Books/BookListPage'
import { Suspense } from 'react'
import React from 'react'
import { LoadingPage } from '../module/Loading/LoadingPage'
import { AuthLayout } from '../module/Layouts/AuthLayout'
import { RegisterPage } from '../module/Auth/RegisterPage'
import { LoginPage } from '../module/Auth/LoginPage'
import { CreateRent } from '../module/Rents/CreateRent'
import { RentLayout } from '../module/Layouts/RentLayout'
import { CreateUser } from '../module/User/CreateUser'

const BookLayout = React.lazy(() => import('../module/Layouts/BookLayout'))
const BookDetail = React.lazy(() => import('../module/Books/BookDetailPage'))
const UserLayout = React.lazy(() => import('../module/Layouts/UserLayout'))
const RentListPage = React.lazy(() => import("../module/Rents/RentListPage"))

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/auth' element={
                    <Suspense fallback={<LoadingPage />}>
                        <AuthLayout />
                    </Suspense>
                } >
                    <Route index element={<LoginPage />} />
                    <Route path='register' element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/auth" />} />
                </Route>
                <Route path='/users' element={
                    <Suspense fallback={<LoadingPage />}>
                        <UserLayout />
                    </Suspense>
                } >
                    <Route path="new" element={<CreateUser />} />
                    <Route path="*" element={<Navigate to="/users" />} />
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
                        <RentLayout />
                    </Suspense>
                } >
                   <Route index element={
                        <Suspense fallback={<LoadingPage />}>
                            <RentListPage />
                        </Suspense>

                    } />                  
                    <Route path="new" element={<CreateRent />} />
                    <Route path="*" element={<Navigate to="/rents" />} />
                </Route>
                <Route path="/users/new" element={<CreateUser />} />
                <Route path="/" element={<Navigate to="/books" />} />
                <Route path="*" element={<Navigate to="/books" />} />
            </Routes>
        </BrowserRouter>
    )
}
