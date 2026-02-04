import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import BookListPage from '../module/Books/BookListPage'
import { Suspense } from 'react'
import React from 'react'
import { LoadingPage } from '../module/Loading/LoadingPage'
import { AuthLayout } from '../module/Layouts/AuthLayout'
import { RegisterPage } from '../module/Auth/RegisterPage'
import { LoginPage } from '../module/Auth/LoginPage'

const BookLayout = React.lazy(() => import('../module/Layouts/BookLayout'))
const BookDetail = React.lazy(() => import('../module/Books/BookDetailPage'))

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
                <Route path="/books" element={
                    <Suspense fallback={<LoadingPage />}>
                        <BookLayout />
                    </Suspense>
                } >
                    <Route index element={<BookListPage />} />
                    <Route path=":id" element={
                        <Suspense fallback={<LoadingPage />}>
                            <BookDetail />
                        </Suspense>

                    } />
                </Route>
                <Route path="/" element={<Navigate to="/books" />} />
                <Route path="*" element={<Navigate to="/books" />} />
            </Routes>
        </BrowserRouter>
    )
}
