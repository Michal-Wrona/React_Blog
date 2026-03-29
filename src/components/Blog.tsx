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
    <div>
      <h1>Blog</h1>

      {posts.map((post) => (
        <div key={post.id}>
          <Link to={`/post/${post.id}`}>
            {post.title}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Blog;