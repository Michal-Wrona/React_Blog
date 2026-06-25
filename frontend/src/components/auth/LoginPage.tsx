import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AuthFormLayout from "./AuthFormLayout";

/**
 * Strona logowania — osobna trasa /login (nie modal w Navbar).
 *
 * Dlaczego osobna strona?
 * - Deep link: można wysłać kogoś na /login?returnUrl=/post/new
 * - ProtectedRoute przekierowuje tutaj automatycznie
 * - Prostszy formularz bez zarządzania modalem w Navbar
 */
export default function LoginPage() {
  const { login, user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnUrl = searchParams.get("returnUrl") || "/blog";

  useEffect(() => {
    if (!isAuthLoading && user) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthLoading, user, navigate, returnUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(returnUrl, { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Nie udało się zalogować.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormLayout
      title="Zaloguj się"
      subtitle="Zaloguj się, aby dodawać i edytować posty."
      footer={
        <>
          Nie masz konta?{" "}
          <Link
            to={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            Zarejestruj się
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-2"
          >
            Hasło
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          {isSubmitting ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>
    </AuthFormLayout>
  );
}
