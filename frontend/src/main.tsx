import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

/**
 * AuthProvider owija całą aplikację — wyżej niż Router i Navbar.
 * Dzięki temu bootstrap sesji (GET /api/auth/me) startuje raz przy wejściu na stronę,
 * a każdy komponent może użyć useAuth().
 */
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
