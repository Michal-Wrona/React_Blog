using React_Blog.Entities;

namespace React_Blog.Interfaces
{
    public interface IPostRepository
    {
        Task<Post?> GetPostByIdAsync(int id);
        Task UpdatePost(Post post);
        Task<IReadOnlyList<Post>> GetPostsAsync();
        Task AddPostAsync(Post post);
        Task DeletePost(int id);
    }
}
