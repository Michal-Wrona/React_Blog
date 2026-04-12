using React_Blog.Entities;

namespace React_Blog.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Sprawdzamy, czy w bazie są już jakieś posty
            if (context.Posts.Any()) return;

            var posts = new List<Post>
            {
                new Post {
                    Title = "Wstęp do Reacta",
                    Content = "React to potężna biblioteka do budowy interfejsów. Pozwala na tworzenie komponentów wielokrotnego użytku. Dzięki Virtual DOM aplikacje działają bardzo szybko. Wspiera programowanie deklaratywne, co ułatwia debugowanie. To obecnie najpopularniejszy wybór wśród frontendowców."
                },
                new Post {
                    Title = "Entity Framework Core w pigułce",
                    Content = "EF Core to system ORM dla platformy .NET. Mapuje on klasy C# bezpośrednio na tabele w bazie danych. Obsługuje wiele silników, w tym SQLite i SQL Server. Dzięki migracjom łatwo zarządzać schematem bazy. Pozwala pisać zapytania w czystym C# za pomocą LINQ."
                },
                new Post {
                    Title = "Dlaczego .NET 8 jest super?",
                    Content = "Nowa wersja przynosi ogromne usprawnienia wydajnościowe. Wprowadzono Primary Constructors, które skracają kod klas. ASP.NET Core jest teraz jeszcze szybszy w obsłudze żądań. Ekosystem narzędzi dotnet jest bardzo dojrzały i stabilny. Wsparcie dla kontenerów i chmury jest na najwyższym poziomie."
                },
                new Post {
                    Title = "Zalety SQLite",
                    Content = "SQLite to lekka baza danych przechowywana w jednym pliku. Nie wymaga instalacji serwera ani skomplikowanej konfiguracji. Idealnie nadaje się do małych projektów i aplikacji mobilnych. Jest niezwykle szybka przy operacjach odczytu danych. Cała baza danych Twojego bloga mieści się w pliku .db."
                },
                new Post {
                    Title = "Czysty kod w C#",
                    Content = "Pisanie czytelnego kodu to klucz do sukcesu projektu. Warto stosować zasady SOLID i unikać zbyt długich metod. Dobre nazewnictwo zmiennych mówi więcej niż komentarze. Testy jednostkowe dają pewność, że zmiany nic nie zepsuły. Refaktoryzacja powinna być stałym elementem procesu tworzenia oprogramowania."
                }
            };

            await context.Posts.AddRangeAsync(posts);
            await context.SaveChangesAsync();
        }
    }
}
