using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using React_Blog.Entities;
using React_Blog.Helpers;

namespace React_Blog.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration)
        {
            foreach (var role in new[] { Roles.User, Roles.Admin })
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            var adminEmail = configuration["AdminSeed:Email"];
            var adminPassword = configuration["AdminSeed:Password"];
            ApplicationUser? admin = null;

            if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword))
            {
                admin = await userManager.FindByEmailAsync(adminEmail);
                if (admin == null)
                {
                    admin = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        EmailConfirmed = true
                    };

                    var result = await userManager.CreateAsync(admin, adminPassword);
                    if (result.Succeeded)
                        await userManager.AddToRoleAsync(admin, Roles.Admin);
                }
            }

            var postsWithoutAuthor = await context.Posts
                .Where(p => p.AuthorId == null)
                .ToListAsync();

            if (postsWithoutAuthor.Count > 0 && admin != null)
            {
                foreach (var post in postsWithoutAuthor)
                    post.AuthorId = admin.Id;

                await context.SaveChangesAsync();
            }

            if (context.Posts.Any())
                return;

            if (admin == null)
                return;

            var posts = new List<Post>
            {
                new Post {
                    Title = "Wstęp do Reacta",
                    Content = "React to potężna biblioteka do budowy interfejsów. Pozwala na tworzenie komponentów wielokrotnego użytku. Dzięki Virtual DOM aplikacje działają bardzo szybko. Wspiera programowanie deklaratywne, co ułatwia debugowanie. To obecnie najpopularniejszy wybór wśród frontendowców.",
                    AuthorId = admin.Id
                },
                new Post {
                    Title = "Entity Framework Core w pigułce",
                    Content = "EF Core to system ORM dla platformy .NET. Mapuje on klasy C# bezpośrednio na tabele w bazie danych. Obsługuje wiele silników, w tym SQLite i SQL Server. Dzięki migracjom łatwo zarządzać schematem bazy. Pozwala pisać zapytania w czystym C# za pomocą LINQ.",
                    AuthorId = admin.Id
                },
                new Post {
                    Title = "Dlaczego .NET 8 jest super?",
                    Content = "Nowa wersja przynosi ogromne usprawnienia wydajnościowe. Wprowadzono Primary Constructors, które skracają kod klas. ASP.NET Core jest teraz jeszcze szybszy w obsłudze żądań. Ekosystem narzędzi dotnet jest bardzo dojrzały i stabilny. Wsparcie dla kontenerów i chmury jest na najwyższym poziomie.",
                    AuthorId = admin.Id
                },
                new Post {
                    Title = "Zalety SQLite",
                    Content = "SQLite to lekka baza danych przechowywana w jednym pliku. Nie wymaga instalacji serwera ani skomplikowanej konfiguracji. Idealnie nadaje się do małych projektów i aplikacji mobilnych. Jest niezwykle szybka przy operacjach odczytu danych. Cała baza danych Twojego bloga mieści się w pliku .db.",
                    AuthorId = admin.Id
                },
                new Post {
                    Title = "Czysty kod w C#",
                    Content = "Pisanie czytelnego kodu to klucz do sukcesu projektu. Warto stosować zasady SOLID i unikać zbyt długich metod. Dobre nazewnictwo zmiennych mówi więcej niż komentarze. Testy jednostkowe dają pewność, że zmiany nic nie zepsuły. Refaktoryzacja powinna być stałym elementem procesu tworzenia oprogramowania.",
                    AuthorId = admin.Id
                }
            };

            await context.Posts.AddRangeAsync(posts);
            await context.SaveChangesAsync();
        }
    }
}
