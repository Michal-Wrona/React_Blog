// src/data.ts

export interface PostType {
  id: number;
  title: string;
  category: string;
  content: string;
}

export const posts: PostType[] = [
  { 
    id: 1, 
    category: "React", 
    title: "Pierwsze kroki w React", 
    content: "React to biblioteka do budowania interfejsów..." 
  },
  { 
    id: 2, 
    category: "Tailwind", 
    title: "Dlaczego Tailwind jest super?", 
    content: "Tailwind pozwala stylizować strony bez wychodzenia z HTML..." 
  }
];