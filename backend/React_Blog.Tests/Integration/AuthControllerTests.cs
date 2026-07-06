using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using React_Blog.DTOs;

namespace React_Blog.Tests.Integration;

[Collection(nameof(IntegrationCollection))]
public class AuthControllerTests(IntegrationFixture fixture)
{
    private readonly HttpClient _client = fixture.Factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        HandleCookies = true
    });

    [Fact]
    public async Task Me_ReturnsUnauthorized_WhenNotLoggedIn()
    {
        var response = await _client.GetAsync("/api/Auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Register_ReturnsUser_AndSetsCookie()
    {
        var email = $"user-{Guid.NewGuid():N}@test.local";

        var response = await _client.PostAsJsonAsync("/api/Auth/register", new RegisterRequest
        {
            Email = email,
            Password = "ValidPass123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>();
        user!.Email.Should().Be(email);
        user.Roles.Should().Contain("User");

        var meResponse = await _client.GetAsync("/api/Auth/me");
        meResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Login_ReturnsOk_ForSeededAdmin()
    {
        var response = await _client.PostAsJsonAsync("/api/Auth/login", new LoginRequest
        {
            Email = "admin@test.local",
            Password = "TestAdmin123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var user = await response.Content.ReadFromJsonAsync<UserResponse>();
        user!.Roles.Should().Contain("Admin");
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_ForWrongPassword()
    {
        var response = await _client.PostAsJsonAsync("/api/Auth/login", new LoginRequest
        {
            Email = "admin@test.local",
            Password = "WrongPassword123!"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Logout_ClearsSession()
    {
        await HttpTestHelpers.LoginAsync(_client, "admin@test.local", "TestAdmin123!");

        var logoutResponse = await _client.PostAsync("/api/Auth/logout", null);
        logoutResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var meResponse = await _client.GetAsync("/api/Auth/me");
        meResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
