using System.Security.Claims;
using React_Blog.Entities;
using React_Blog.Helpers;

namespace React_Blog.Tests.Unit;

public class PostAuthorizationTests
{
    [Fact]
    public void CanModify_ReturnsTrue_ForAdmin()
    {
        var user = CreateUser(Roles.Admin, "admin-id");
        var post = CreatePost("other-author");

        PostAuthorization.CanModify(user, post).Should().BeTrue();
    }

    [Fact]
    public void CanModify_ReturnsTrue_ForAuthor()
    {
        var user = CreateUser(Roles.User, "author-id");
        var post = CreatePost("author-id");

        PostAuthorization.CanModify(user, post).Should().BeTrue();
    }

    [Fact]
    public void CanModify_ReturnsFalse_ForOtherUser()
    {
        var user = CreateUser(Roles.User, "user-a");
        var post = CreatePost("user-b");

        PostAuthorization.CanModify(user, post).Should().BeFalse();
    }

    [Fact]
    public void CanModify_ReturnsFalse_WhenUserIdMissing()
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity());
        var post = CreatePost("author-id");

        PostAuthorization.CanModify(user, post).Should().BeFalse();
    }

    private static ClaimsPrincipal CreateUser(string role, string userId)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Role, role)
        };

        return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
    }

    private static Post CreatePost(string authorId) => new()
    {
        Title = "Tytuł posta",
        Content = "Treść posta z odpowiednią długością znaków.",
        AuthorId = authorId
    };
}
