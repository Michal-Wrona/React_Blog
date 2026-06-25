import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Strażnik tras wymagających logowania (tworzenie/edycja postów).
 *
 * Dlaczego osobny komponent, a nie if w App.tsx?
 * React Router oczekuje elementu w <Route element={...} /> — ProtectedRoute
 * opakowuje chronioną stronę i decyduje: renderuj dzieci albo przekieruj.
 *
 * returnUrl: zapisujemy bieżącą ścieżkę w query, żeby po loginie wrócić
 * tam, gdzie użytkownik chciał (np. /post/new).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center text-gray-600">
        Sprawdzanie sesji...
      </div>
    );
  }

  if (!user) {
    const returnUrl = encodeURIComponent(
      location.pathname + location.search
    );

    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  return children;
}
