import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../types";

function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/Post");

        if (!response.ok) {
          throw new Error("Nie udało się pobrać postów.");
        }

        const data: Post[] = await response.json();
        setPosts(data);
      } catch (error) {
        setError("Wystąpił błąd podczas pobierania postów.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (isLoading) {
    return <div className="p-8">Ładowanie postów...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">
            Blog
          </h1>

          <Link
            to="/post/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Dodaj post
          </Link>
        </div>

        {posts.map((post) => (
          <div key={post.id}>
            <Link
              to={`/post/${post.id}`}
              className="text-lg text-gray-700 hover:text-purple-600 hover:font-semibold hover:underline transition-all duration-200"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Blog;