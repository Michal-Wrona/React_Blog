using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using React_Blog.Helpers;
using React_Blog.Interfaces;

namespace React_Blog.Tests.Integration;

public class CustomWebApplicationFactory(string connectionString) : WebApplicationFactory<Program>
{
    public FakeImageService ImageService { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.UseSetting("ConnectionStrings:DefaultConnection", connectionString);
        builder.UseSetting($"{CloudinarySettings.SectionName}:CloudName", "test");
        builder.UseSetting($"{CloudinarySettings.SectionName}:ApiKey", "test-key");
        builder.UseSetting($"{CloudinarySettings.SectionName}:ApiSecret", "test-secret");
        builder.UseSetting("AdminSeed:Email", "admin@test.local");
        builder.UseSetting("AdminSeed:Password", "TestAdmin123!");
        builder.UseSetting("Cors:AllowedOrigins:0", "http://localhost");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IImageService>();
            services.AddSingleton<IImageService>(ImageService);
        });
    }
}
