import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Blog from "./components/Blog";
import Post from "./components/Post";
import ChoosePostType from "./components/ChoosePostType";
import CreatePost from "./components/CreatePost";
import CreateVisualPost from "./components/CreateVisualPost";
import EditPost from "./components/EditPost";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/post/new" element={<ChoosePostType />} />
        <Route path="/post/new/simple" element={<CreatePost />} />
        <Route path="/post/new/visual" element={<CreateVisualPost />} />
        <Route path="/post/:id/edit" element={<EditPost />} />
        <Route path="/post/:id" element={<Post />} />
      </Routes>
    </Router>
  );
}

export default App;
