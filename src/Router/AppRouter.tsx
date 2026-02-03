import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import BookListPage from '../module/Books/BookListPage'
import { Suspense } from 'react'
import React from 'react'

const BookLayout = React.lazy(() => import('../module/Layouts/BookLayout'))
const BookDetail = React.lazy(() => import('../module/Books/BookDetailPage'))

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/books" element={
                    <Suspense fallback={<div>Loading layout...</div>}>
                        <BookLayout />
                    </Suspense>
                } >
                    <Route index element={<BookListPage />} />
                    <Route path=":id" element={
                        <Suspense fallback={<div>Loading...</div>}>
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
