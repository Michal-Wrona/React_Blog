import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook do odczytu auth z dowolnego komponentu.
 *
 * Dlaczego osobny plik zamiast exportu z AuthContext?
 * Konwencja React: Context w jednym pliku, hook w hooks/ — krótszy import
 * (`useAuth()` zamiast `useContext(AuthContext)` w każdym miejscu).
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth musi być użyty wewnątrz <AuthProvider>.");
  }

  return context;
}
