import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Post, CreatePostRequest } from "../types";

function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const newPost: CreatePostRequest = { title, content };

      const response = await fetch("/api/Post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error("Nie udało się utworzyć posta.");
      }

      const createdPost: Post = await response.json();
      navigate(`/post/${createdPost.id}`);
    } catch (error) {
      setError("Wystąpił błąd podczas tworzenia posta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Dodaj post
        </h1>

        {error && (
          <div className="mb-4 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Tytuł
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
              Treść
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-48 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz post"}
            </button>

            <Link
              to="/blog"
              className="bg-gray-700 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Anuluj
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
