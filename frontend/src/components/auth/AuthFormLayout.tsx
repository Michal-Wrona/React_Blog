import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthFormLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Wspólny układ stron /login i /register — spójny wygląd z Blogiem. */
export default function AuthFormLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthFormLayoutProps) {
  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="max-w-md mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-gray-600 mb-8">{subtitle}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {children}
        </div>

        <p className="text-center text-gray-600 mt-6">{footer}</p>

        <div className="text-center mt-4">
          <Link
            to="/blog"
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            ← Powrót do bloga
          </Link>
        </div>
      </div>
    </div>
  );
}
