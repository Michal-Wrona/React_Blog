/**
 * Wspólny klient HTTP dla całej aplikacji.
 *
 * Dlaczego tutaj, a nie w każdym komponencie osobno?
 * Backend używa cookie sesji (ASP.NET Identity). Przeglądarka musi
 * wysyłać to cookie przy każdym żądaniu — robi to `credentials: "include"`.
 * Jedna funkcja = jedno miejsce na tę regułę; Blog, Post i auth nie duplikują kodu.
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

/** Czyta komunikat błędu z odpowiedzi API (tekst lub tablica JSON z Identity). */
export async function readApiErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const text = await response.text();
  if (!text) {
    return fallback;
  }

  try {
    const json: unknown = JSON.parse(text);
    if (Array.isArray(json)) {
      return json.map(String).join(" ");
    }
    if (typeof json === "string") {
      return json;
    }
  } catch {
    // odpowiedź to zwykły tekst, np. "Nieprawidłowy email lub hasło."
  }

  return text;
}
