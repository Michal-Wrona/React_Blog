using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using React_Blog.Data;
using React_Blog.Entities;
using React_Blog.Helpers;
using React_Blog.Interfaces;
using React_Blog.Services;

var builder = WebApplication.CreateBuilder(args);

var cloudinarySettings = builder.Configuration
    .GetSection(CloudinarySettings.SectionName)
    .Get<CloudinarySettings>() ?? new CloudinarySettings();

if (!cloudinarySettings.IsConfigured)
{
    throw new InvalidOperationException(
        "Brak konfiguracji Cloudinary. Ustaw Cloudinary:CloudName, Cloudinary:ApiKey i Cloudinary:ApiSecret " +
        "(np. przez dotnet user-secrets w katalogu backend/React_Blog).");
}

builder.Services.AddSingleton(_ =>
    new Cloudinary(new Account(
        cloudinarySettings.CloudName,
        cloudinarySettings.ApiKey,
        cloudinarySettings.ApiSecret)));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    });

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = ImageSettings.MaxFileSizeBytes;
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;

    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.AllowedForNewUsers = true;

    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.ExpireTimeSpan = TimeSpan.FromDays(14);
    options.SlidingExpiration = true;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
        || builder.Environment.IsEnvironment("Testing")
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IImageService, ImageService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        policy.WithOrigins(origins)
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.AddFixedWindowLimiter("auth", limiter =>
        {
            limiter.Window = TimeSpan.FromMinutes(1);
            limiter.PermitLimit = 5;
            limiter.QueueLimit = 0;
        });
    });
}

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<SwaggerFileUploadOperationFilter>();
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var configuration = services.GetRequiredService<IConfiguration>();

        await context.Database.MigrateAsync();
        await DbInitializer.SeedAsync(context, userManager, roleManager, configuration);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Wystąpił błąd podczas seedowania bazy danych");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none';";
    await next();
});

app.UseStaticFiles();
app.UseCors("Frontend");
if (!app.Environment.IsEnvironment("Testing"))
    app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
