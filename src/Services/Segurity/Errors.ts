export const handleErrorService = <T>(err: unknown, fallback: T): T => {       
    console.error("Error en Service:", err);
    return fallback;
  };    