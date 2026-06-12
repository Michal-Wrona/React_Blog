import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Post as PostType } from "../types";

function Post() {
  const { id } = useParams();
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/Post/${id}`);

        if (!response.ok) {
          throw new Error("Nie udało się pobrać posta.");
        }

        const data: PostType = await response.json();
        setPost(data);
      } catch (error) {
        setError("Wystąpił błąd podczas pobierania posta.");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (isLoading) {
    return <div className="p-10">Ładowanie posta...</div>;
  }

  if (error || !post) {
    return <div className="p-10 text-red-600">Nie znaleziono posta.</div>;
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-4 gap-4">
        <h1 className="text-4xl font-bold text-gray-800">
          {post.title}
        </h1>

        <Link
          to={`/post/${post.id}/edit`}
          className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Edytuj post
        </Link>
      </div>

      <div className="text-lg text-gray-700 leading-relaxed mb-10 whitespace-pre-line">
        {post.content}
      </div>

      {post.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {post.images.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={post.title}
              className="w-full rounded-xl object-cover"
            />
          ))}
        </div>
      )}

      <Link
        to="/blog"
        className="inline-block bg-gray-700 hover:bg-gray-800 text-white font-medium px-3 py-1 rounded-xl transition-colors"
      >
        ← Powrót do listy postów
      </Link>
    </div>
  );
}

export default Post;