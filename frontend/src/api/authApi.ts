import type { LoginRequest, RegisterRequest, User } from "../types";
import { apiFetch, readApiErrorMessage } from "./client";

/**
 * Warstwa API tylko dla auth.
 *
 * Dlaczego osobny plik, a nie metody w AuthContext?
 * Context trzyma STAN (kto jest zalogowany), authApi robi HTTP.
 * Rozdzielenie: łatwiej testować i nie mieszać fetch z logiką UI.
 */
export async function getMe(): Promise<User | null> {
  const response = await apiFetch("/api/auth/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Nie udało się sprawdzić sesji.");
  }

  return response.json() as Promise<User>;
}

export async function login(request: LoginRequest): Promise<User> {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (response.status === 423) {
    throw new Error(
      await readApiErrorMessage(
        response,
        "Konto tymczasowo zablokowane. Spróbuj ponownie za chwilę."
      )
    );
  }

  if (response.status === 429) {
    throw new Error("Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.");
  }

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, "Nieprawidłowy email lub hasło.")
    );
  }

  return response.json() as Promise<User>;
}

export async function register(request: RegisterRequest): Promise<User> {
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (response.status === 429) {
    throw new Error("Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.");
  }

  if (!response.ok) {
    throw new Error(
      await readApiErrorMessage(response, "Nie udało się utworzyć konta.")
    );
  }

  return response.json() as Promise<User>;
}

export async function logout(): Promise<void> {
  const response = await apiFetch("/api/auth/logout", { method: "POST" });

  if (!response.ok && response.status !== 401) {
    throw new Error("Nie udało się wylogować.");
  }
}
