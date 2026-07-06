using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using React_Blog.Data;
using React_Blog.Entities;
using React_Blog.Interfaces;

namespace React_Blog.Tests.Integration;

[Collection(nameof(IntegrationCollection))]
public class PostRepositoryTests(IntegrationFixture fixture)
{
    [Fact]
    public async Task GetPostByIdWithImagesAsync_IncludesImages()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IPostRepository>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var admin = await userManager.FindByEmailAsync("admin@test.local");

        var post = new Post
        {
            Title = "Repository test post",
            Content = "Content long enough for any validation rules in the repository layer.",
            AuthorId = admin!.Id
        };
        await repo.AddPostAsync(post);

        await repo.AddImageAsync(new Image
        {
            PostId = post.Id,
            Url = "https://res.cloudinary.com/test/image/upload/v1/react-blog/images/repo.jpg"
        });

        var loaded = await repo.GetPostByIdWithImagesAsync(post.Id);

        loaded.Should().NotBeNull();
        loaded!.Images.Should().ContainSingle();
        loaded.Images.First().Url.Should().Contain("repo.jpg");
    }

    [Fact]
    public async Task DeletePostAsync_RemovesPostAndImages()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IPostRepository>();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var admin = await userManager.FindByEmailAsync("admin@test.local");

        var post = new Post
        {
            Title = "Post to delete",
            Content = "Content long enough for repository delete cascade verification test.",
            AuthorId = admin!.Id
        };
        await repo.AddPostAsync(post);

        await repo.AddImageAsync(new Image
        {
            PostId = post.Id,
            Url = "https://res.cloudinary.com/test/image/upload/v1/react-blog/images/delete.jpg"
        });

        await repo.DeletePostAsync(post.Id);

        var postExists = await context.Posts.AnyAsync(p => p.Id == post.Id);
        var imagesExist = await context.Images.AnyAsync(i => i.PostId == post.Id);

        postExists.Should().BeFalse();
        imagesExist.Should().BeFalse();
    }

    [Fact]
    public async Task AddPostAsync_PersistsVisualStyleAsJson()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IPostRepository>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var admin = await userManager.FindByEmailAsync("admin@test.local");

        var post = new Post
        {
            Title = "Visual repository post",
            Content = "Visual post content stored as JSON owned entity in PostgreSQL.",
            PostType = PostType.Visual,
            AuthorId = admin!.Id,
            VisualStyle = new VisualStyle
            {
                BackgroundColor = "#112233",
                TextColor = "#ffffff",
                FontFamily = "Georgia, serif",
                FontSize = "large"
            }
        };

        await repo.AddPostAsync(post);

        var loaded = await repo.GetPostByIdAsync(post.Id);

        loaded.Should().NotBeNull();
        loaded!.VisualStyle.Should().NotBeNull();
        loaded.VisualStyle!.BackgroundColor.Should().Be("#112233");
        loaded.VisualStyle.FontFamily.Should().Be("Georgia, serif");
    }
}
