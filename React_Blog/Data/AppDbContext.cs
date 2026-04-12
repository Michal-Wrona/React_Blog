using Microsoft.EntityFrameworkCore;
using React_Blog.Entities;

namespace React_Blog.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Post> Posts { get; set; }
    }
}
