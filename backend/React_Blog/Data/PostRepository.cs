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
