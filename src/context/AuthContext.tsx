import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AuthUser, AuthResponse, LoginPayload } from "../Services/AuthService";
import { login as loginService } from "../Services/AuthService";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "online-biblioteca-auth";

type StoredAuth = {
  user: AuthUser;
  token: string;
};

function loadFromStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

function saveToStorage(auth: StoredAuth | null) {
  try {
    if (!auth) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    }
  } catch {
    // Ignorar errores de almacenamiento
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored?.token && stored.user) {
      const u = stored.user;
      if (u.rol !== "admin" && u.rol !== "user") u.rol = "user";
      setUser(u);
      setToken(stored.token);
    }
  }, []);

  const handleLogin = useCallback(async (payload: LoginPayload) => {
    const res: AuthResponse = await loginService(payload);
    setUser(res.user);
    setToken(res.token);
    saveToStorage({ user: res.user, token: res.token });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    saveToStorage(null);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      const stored = loadFromStorage();
      if (stored?.token) saveToStorage({ ...stored, user: next });
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login: handleLogin,
      logout: handleLogout,
      updateUser,
    }),
    [user, token, handleLogin, handleLogout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}

