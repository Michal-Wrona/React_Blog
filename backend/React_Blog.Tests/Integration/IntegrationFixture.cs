using Testcontainers.PostgreSql;

namespace React_Blog.Tests.Integration;

public class IntegrationFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _container;

    public CustomWebApplicationFactory Factory { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        _container = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .Build();
        await _container.StartAsync();
        Factory = new CustomWebApplicationFactory(_container.GetConnectionString());
    }

    public async Task DisposeAsync()
    {
        await Factory.DisposeAsync();
        if (_container != null)
            await _container.DisposeAsync();
    }
}

[CollectionDefinition(nameof(IntegrationCollection))]
public class IntegrationCollection : ICollectionFixture<IntegrationFixture>;
