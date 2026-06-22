using System.Security.Claims;
using React_Blog.Entities;

namespace React_Blog.Helpers
{
    public static class PostAuthorization
    {
        public static bool CanModify(ClaimsPrincipal user, Post post)
        {
            if (user.IsInRole(Roles.Admin))
                return true;

            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            return userId != null && post.AuthorId == userId;
        }
    }
}
