using Microsoft.EntityFrameworkCore;
using React_Blog.Entities;
using React_Blog.Interfaces;

namespace React_Blog.Data
{
    public class PostRepository(AppDbContext context) : IPostRepository
    {
        public async Task<IReadOnlyList<Post>> GetPostsAsync()
        {
            return await context.Posts
                .AsNoTracking() 
                .ToListAsync();
        }

        public async Task<Post?> GetPostByIdAsync(int id)
        {
            return await context.Posts.FindAsync(id);
        }

        public async Task<Post?> GetPostByIdWithImagesAsync(int id)
        {
            return await context.Posts
                .AsNoTracking()
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Post?> GetPostForUpdateAsync(int id)
        {
            return await context.Posts
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<int> GetImageCountForPostAsync(int postId)
        {
            return await context.Images
                .CountAsync(i => i.PostId == postId);
        }

        public async Task AddImageAsync(Image image)
        {
            await context.Images.AddAsync(image);
            await context.SaveChangesAsync();
        }

        public async Task AddPostAsync(Post post)
        {
            await context.Posts.AddAsync(post);
            await context.SaveChangesAsync();
        }

        public async Task UpdatePostAsync(Post post)
        {
            context.Posts.Update(post);
            await context.SaveChangesAsync();
        }

        public async Task DeletePostAsync(int id)
        {
            await context.Posts
                .Where(p => p.Id == id)
                .ExecuteDeleteAsync();
        }
    }
}
