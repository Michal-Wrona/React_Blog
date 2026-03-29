import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Pobieramy element root z index.html
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement // "as" = TypeScript mówi jaki to typ
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);