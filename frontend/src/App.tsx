import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Blog from "./components/Blog";
import Post from "./components/Post";
import ChoosePostType from "./components/ChoosePostType";
import CreatePost from "./components/CreatePost";
import CreateVisualPost from "./components/CreateVisualPost";
import EditPost from "./components/EditPost";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Publiczne — bez logowania */}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Chronione — ProtectedRoute + returnUrl przy braku sesji */}
        <Route
          path="/post/new"
          element={
            <ProtectedRoute>
              <ChoosePostType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/new/simple"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/new/visual"
          element={
            <ProtectedRoute>
              <CreateVisualPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id/edit"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
