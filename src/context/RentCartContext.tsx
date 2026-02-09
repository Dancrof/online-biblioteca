import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type RentCartContextValue = {
  bookIds: number[];
  count: number;
  addToRentCart: (bookId: number) => void;
  removeFromRentCart: (bookId: number) => void;
  setRentCartIds: (ids: number[]) => void;
  clearRentCart: () => void;
};

const RentCartContext = createContext<RentCartContextValue | null>(null);

export function RentCartProvider({ children }: { children: React.ReactNode }) {
  const [bookIds, setBookIds] = useState<number[]>([]);

  const addToRentCart = useCallback((bookId: number) => {
    setBookIds((prev) => (prev.includes(bookId) ? prev : [...prev, bookId]));
  }, []);

  const removeFromRentCart = useCallback((bookId: number) => {
    setBookIds((prev) => prev.filter((id) => id !== bookId));
  }, []);

  const setRentCartIds = useCallback((ids: number[]) => {
    setBookIds(ids);
  }, []);

  const clearRentCart = useCallback(() => {
    setBookIds([]);
  }, []);

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

  return (
    <RentCartContext.Provider value={value}>
      {children}
    </RentCartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRentCart(): RentCartContextValue {
  const ctx = useContext(RentCartContext);
  if (!ctx) {
    throw new Error('useRentCart debe usarse dentro de RentCartProvider');
  }
  return ctx;
}
