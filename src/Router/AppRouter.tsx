import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import BookListPage from '../module/Books/BookListPage'
import { Suspense } from 'react'
import React from 'react'
import { LoadingPage } from '../module/Loading/LoadingPage'

const BookLayout = React.lazy(() => import('../module/Layouts/BookLayout'))
const BookDetail = React.lazy(() => import('../module/Books/BookDetailPage'))

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
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
