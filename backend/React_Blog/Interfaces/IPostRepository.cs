using React_Blog.Entities;

namespace React_Blog.Interfaces
{
    public interface IPostRepository
    {
        Task<IReadOnlyList<Post>> GetPostsAsync();
        Task<Post?> GetPostByIdAsync(int id);
        Task AddPostAsync(Post post);
        Task UpdatePostAsync(Post post);
        Task DeletePostAsync(int id);
    }
}
