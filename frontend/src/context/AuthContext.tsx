import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/authApi";
import type { User } from "../types";

export interface AuthContextValue {
  /** Zalogowany użytkownik lub null (gość). */
  user: User | null;
  /**
   * true tylko podczas bootstrapu sesji (pierwsze GET /api/auth/me).
   * Navbar i ProtectedRoute czekają, żeby nie migać „Zaloguj” → „Wyloguj”.
   */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * React Context + Provider dla stanu auth.
 *
 * Dlaczego w main.tsx owija całą aplikację?
 * Navbar, Blog, ProtectedRoute i strony login — wszystkie potrzebują `user`.
 * Provider musi być WYŻEJ w drzewie niż te komponenty (inaczej useAuth nie zadziała).
 *
 * Bootstrap sesji: useEffect przy mount woła getMe() — odczyt istniejącego cookie,
 * bez ponownego logowania.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      try {
        const currentUser = await authApi.getMe();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await authApi.login({ email, password });
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const registeredUser = await authApi.register({ email, password });
    setUser(registeredUser);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
