using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using React_Blog.DTOs;

namespace React_Blog.Tests.Integration;

public static class HttpTestHelpers
{
    public static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public static async Task RegisterAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/Auth/register", new RegisterRequest
        {
            Email = email,
            Password = password
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    public static async Task LoginAsync(HttpClient client, string email, string password)
    {
        var response = await client.PostAsJsonAsync("/api/Auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    public static async Task<UserResponse> LoginAndGetUserAsync(HttpClient client, string email, string password)
    {
        await LoginAsync(client, email, password);
        var meResponse = await client.GetAsync("/api/Auth/me");
        meResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return (await meResponse.Content.ReadFromJsonAsync<UserResponse>(JsonOptions))!;
    }

    public static ByteArrayContent CreateImageFileContent(string fileName = "photo.jpg")
    {
        return new ByteArrayContent([0xFF, 0xD8, 0xFF, 0xD9])
        {
            Headers = { { "Content-Type", "image/jpeg" } }
        };
    }

    public static async Task<HttpResponseMessage> UploadPhotoAsync(HttpClient client, int postId)
    {
        using var form = new MultipartFormDataContent();
        form.Add(CreateImageFileContent(), "file", "photo.jpg");
        return await client.PostAsync($"/api/Post/{postId}/add-photo", form);
    }
}
