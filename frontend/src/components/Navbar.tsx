import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { user, isLoading, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // cookie i tak wygasnie; stan lokalny jest czyszczony w AuthContext
    }
  }

  return (
    <nav className="bg-green-100 border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tighter text-gray-900">
          Moja<span className="text-blue-600">Apka</span>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 px-4 py-2 rounded-xl"
                : "bg-blue-200 px-4 py-2 rounded-xl hover:bg-blue-500"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 px-4 py-2 rounded-xl"
                : "bg-blue-200 px-4 py-2 rounded-xl hover:bg-blue-500"
            }
          >
            Blog
          </NavLink>

          {/* Auth w Navbar — jedno miejsce widoczne na każdej stronie */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-green-200">
            {isLoading ? (
              <span className="text-gray-500 text-sm px-2">...</span>
            ) : user ? (
              <>
                <span
                  className="text-gray-700 text-sm max-w-[140px] truncate hidden sm:inline"
                  title={user.email}
                >
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  Zaloguj się
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  Rejestracja
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
