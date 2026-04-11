import { Link } from "react-router-dom";
import { posts } from "../data"; // Importujemy nasze dane


// // 🔥 Typ dla posta
// interface PostType {
//   id: number;
//   title: string;
// }

// // Fake dane z typem
// const posts: PostType[] = [
//   { id: 1, title: "Pierwszy post" },
//   { id: 2, title: "Drugi post" }
// ];

function Blog() {
  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Blog
      </h1>

      {posts.map((post) => (
        <div key={post.id}>
          <Link to={`/post/${post.id}`}
            className="text-lg text-gray-700 hover:text-purple-600 hover:font-semibold hover:underline transition-all duration-200"
          >
            {post.title}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Blog;