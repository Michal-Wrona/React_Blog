using Microsoft.AspNetCore.Identity;

namespace React_Blog.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public ICollection<Post> Posts { get; set; } = [];
    }
}
