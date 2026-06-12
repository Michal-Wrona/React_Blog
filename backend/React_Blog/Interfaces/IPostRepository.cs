using React_Blog.Entities;

namespace React_Blog.Interfaces
{
    public interface IPostRepository
    {
        Task<IReadOnlyList<Post>> GetPostsAsync();
        Task<Post?> GetPostByIdAsync(int id);
        Task<Post?> GetPostByIdWithImagesAsync(int id);
        Task<Post?> GetPostForUpdateAsync(int id);
        Task<int> GetImageCountForPostAsync(int postId);
        Task AddPostAsync(Post post);
        Task AddImageAsync(Image image);
        Task<Image?> GetImageByIdAsync(int imageId);
        Task DeleteImageAsync(int imageId);
        Task UpdatePostAsync(Post post);
        Task DeletePostAsync(int id);
    }
}
