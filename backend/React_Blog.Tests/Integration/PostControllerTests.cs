using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using React_Blog.Entities;

namespace React_Blog.Tests.Integration;

[Collection(nameof(IntegrationCollection))]
public class PostControllerTests(IntegrationFixture fixture)
{
    private readonly CustomWebApplicationFactory _factory = fixture.Factory;
    private readonly FakeImageService _imageService = fixture.Factory.ImageService;

    [Fact]
    public async Task GetPosts_ReturnsOk_WithoutAuthentication()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/Post");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task CreatePost_ReturnsUnauthorized_WhenNotLoggedIn()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/Post", CreateSimplePost());

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreatePost_ReturnsCreated_WhenAuthenticated()
    {
        var client = CreateClient(_factory);
        await HttpTestHelpers.RegisterAsync(client, $"author-{Guid.NewGuid():N}@test.local", "ValidPass123!");

        var response = await client.PostAsJsonAsync("/api/Post", CreateSimplePost());

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var post = await response.Content.ReadFromJsonAsync<Post>(HttpTestHelpers.JsonOptions);
        post!.Title.Should().Be("Test post title");
        post.AuthorId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task CreatePost_ReturnsBadRequest_WhenTitleTooShort()
    {
        var client = CreateClient(_factory);
        await HttpTestHelpers.RegisterAsync(client, $"author-{Guid.NewGuid():N}@test.local", "ValidPass123!");

        var post = CreateSimplePost();
        post.Title = "abc";

        var response = await client.PostAsJsonAsync("/api/Post", post);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task DeletePost_ReturnsForbidden_ForNonAuthor()
    {
        var authorClient = CreateClient(_factory);
        var email = $"author-{Guid.NewGuid():N}@test.local";
        await HttpTestHelpers.RegisterAsync(authorClient, email, "ValidPass123!");

        var createResponse = await authorClient.PostAsJsonAsync("/api/Post", CreateSimplePost());
        var created = await createResponse.Content.ReadFromJsonAsync<Post>(HttpTestHelpers.JsonOptions);

        var otherClient = CreateClient(_factory);
        await HttpTestHelpers.RegisterAsync(otherClient, $"other-{Guid.NewGuid():N}@test.local", "ValidPass123!");

        var deleteResponse = await otherClient.DeleteAsync($"/api/Post/{created!.Id}");

        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task DeletePost_RemovesCloudinaryImages()
    {
        _imageService.DeletedUrls.Clear();

        var client = CreateClient(_factory);
        await HttpTestHelpers.LoginAsync(client, "admin@test.local", "TestAdmin123!");

        var createResponse = await client.PostAsJsonAsync("/api/Post", CreateSimplePost());
        var post = await createResponse.Content.ReadFromJsonAsync<Post>(HttpTestHelpers.JsonOptions);

        var upload1 = await HttpTestHelpers.UploadPhotoAsync(client, post!.Id);
        upload1.StatusCode.Should().Be(HttpStatusCode.OK);
        var image1 = await upload1.Content.ReadFromJsonAsync<Image>(HttpTestHelpers.JsonOptions);

        var upload2 = await HttpTestHelpers.UploadPhotoAsync(client, post.Id);
        upload2.StatusCode.Should().Be(HttpStatusCode.OK);
        var image2 = await upload2.Content.ReadFromJsonAsync<Image>(HttpTestHelpers.JsonOptions);

        var deleteResponse = await client.DeleteAsync($"/api/Post/{post.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        _imageService.DeletedUrls.Should().Contain(image1!.Url);
        _imageService.DeletedUrls.Should().Contain(image2!.Url);

        var getResponse = await client.GetAsync($"/api/Post/{post.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeletePhoto_RemovesCloudinaryImage()
    {
        _imageService.DeletedUrls.Clear();

        var client = CreateClient(_factory);
        await HttpTestHelpers.LoginAsync(client, "admin@test.local", "TestAdmin123!");

        var createResponse = await client.PostAsJsonAsync("/api/Post", CreateSimplePost());
        var post = await createResponse.Content.ReadFromJsonAsync<Post>(HttpTestHelpers.JsonOptions);

        var uploadResponse = await HttpTestHelpers.UploadPhotoAsync(client, post!.Id);
        var image = await uploadResponse.Content.ReadFromJsonAsync<Image>(HttpTestHelpers.JsonOptions);

        var deleteResponse = await client.DeleteAsync($"/api/Post/{post.Id}/images/{image!.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        _imageService.DeletedUrls.Should().ContainSingle(image.Url);
    }

    private static HttpClient CreateClient(CustomWebApplicationFactory factory) =>
        factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

    private static Post CreateSimplePost() => new()
    {
        Title = "Test post title",
        Content = "This is valid post content with enough characters for validation.",
        PostType = PostType.Simple
    };
}
