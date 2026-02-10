import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Contexto para el carrito de alquileres
 * @param bookIds - IDs de los libros en el carrito
 * @param count - Número de libros en el carrito
 * @param addToRentCart - Función para agregar un libro al carrito
 * @param removeFromRentCart - Función para quitar un libro del carrito
 * @param setRentCartIds - Función para establecer los IDs de los libros en el carrito
 * @param clearRentCart - Función para limpiar el carrito
 */
type RentCartContextValue = {
  bookIds: number[];
  count: number;
  addToRentCart: (bookId: number) => void;
  removeFromRentCart: (bookId: number) => void;
  setRentCartIds: (ids: number[]) => void;
  clearRentCart: () => void;
};

const RentCartContext = createContext<RentCartContextValue | null>(null);

/**
 * Proveedor del contexto del carrito de alquileres
 * @param children - Hijos del proveedor
 * @returns Proveedor del contexto del carrito de alquileres
 */
export function RentCartProvider({ children }: { children: React.ReactNode }) {
  const [bookIds, setBookIds] = useState<number[]>([]);

  /**
   * Función para agregar un libro al carrito
   * @param bookId - ID del libro a agregar
   */
  const addToRentCart = useCallback((bookId: number) => {
    setBookIds((prev) => (prev.includes(bookId) ? prev : [...prev, bookId]));
  }, []);

  /**
   * Función para quitar un libro del carrito
   * @param bookId - ID del libro a quitar
   */
  const removeFromRentCart = useCallback((bookId: number) => {
    setBookIds((prev) => prev.filter((id) => id !== bookId));
  }, []);

  /**
   * Función para establecer los IDs de los libros en el carrito
   * @param ids - IDs de los libros a establecer
   */
  const setRentCartIds = useCallback((ids: number[]) => {
    setBookIds(ids);
  }, []);

  /**
   * Función para limpiar el carrito
   */
  const clearRentCart = useCallback(() => {
    setBookIds([]);
  }, []);

  /**
   * Valor del contexto
   */
  const value = useMemo(
    () => ({
      bookIds,
      count: bookIds.length,
      addToRentCart,
      removeFromRentCart,
      setRentCartIds,
      clearRentCart,
    }),
    [bookIds, addToRentCart, removeFromRentCart, setRentCartIds, clearRentCart]
  );

  /**
   * Renderizado del componente
   * @returns Renderizado del componente
   */
  return (
    <RentCartContext.Provider value={value}>
      {children}
    </RentCartContext.Provider>
  );
}

/**
 * Hook para usar el contexto del carrito de alquileres
 * @returns Contexto del carrito de alquileres
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useRentCart(): RentCartContextValue {
  const ctx = useContext(RentCartContext);
  if (!ctx) {
    throw new Error('useRentCart debe usarse dentro de RentCartProvider');
  }
  return ctx;
}
