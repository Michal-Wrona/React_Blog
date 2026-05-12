// src/data.ts

export interface PostType {
  id: number;
  title: string;
  category: string;
  content: string;
}

// Fallback lokalne dane jeśli API nie odpowiada
const FALLBACK_POSTS: PostType[] = [
  {
    id: 1,
    category: "React",
    title: "Pierwsze kroki w React",
    content: "React to biblioteka do budowania interfejsów...",
  },
  {
    id: 2,
    category: "Tailwind",
    title: "Dlaczego Tailwind jest super?",
    content: "Tailwind pozwala stylizować strony bez wychodzenia z HTML...",
  },
];

// Bazowy URL API - konfigurowalny przez Vite env: VITE_API_URL
// Support for TypeScript import.meta typing
// Use Vite's import.meta.env for the base URL. Avoid using process in browser code.
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5185";

export async function fetchPosts(): Promise<PostType[]> {
  try {
    console.log("🔍 Próbuję pobrać z API:", `${API_BASE}/api/posts`);
    const res = await fetch(`${API_BASE}/api/posts`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    console.log("✅ Posty z API:", data);
    return data as PostType[];
  } catch (error) {
    // Jeśli fetch nie zadziała zwracamy fallback
    console.log("⚠️ API nie odpowiadało, używam fallback danych:", error);
    return FALLBACK_POSTS;
  }
}

export async function fetchPostById(id: number): Promise<PostType | undefined> {
  try {
    const res = await fetch(`${API_BASE}/api/posts/${id}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data as PostType;
  } catch (error) {
    console.log("⚠️ Błąd pobierania postu", error);
    return FALLBACK_POSTS.find((p) => p.id === id);
  }
}
