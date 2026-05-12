import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchPostById } from "../data";
import type { PostType } from "../data";

// // Opisujemy TYLKO to, co przychodzi z adresu URL
// interface PostParams {
//   id: string; // bo w URL wszystko jest stringiem
// }

function Post() {
  const { id } = useParams(); // useParams domyślnie zwraca string | undefined
  const [post, setPost] = useState<PostType | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetchPostById(Number(id)).then((p) => {
      if (mounted) setPost(p);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!post) {
    return <div>Nie podano ID posta!</div>;
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      {/* Tytuł posta */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>

      {/* Treść posta */}
      <div className="text-lg text-gray-700 leading-relaxed mb-10">{post.content}</div>

      {/* Przycisk Powrót do bloga */}
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