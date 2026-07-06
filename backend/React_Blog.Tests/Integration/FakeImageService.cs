using Microsoft.AspNetCore.Http;
using React_Blog.Interfaces;

namespace React_Blog.Tests.Integration;

public class FakeImageService : IImageService
{
    private int _uploadCounter;

    public List<string> DeletedUrls { get; } = [];

    public Task<(string? Url, string? Error)> SaveImageAsync(IFormFile file)
    {
        if (file.Length == 0)
            return Task.FromResult<(string?, string?)>((null, "Plik jest pusty."));

        _uploadCounter++;
        var url = $"https://res.cloudinary.com/test/image/upload/v1/react-blog/images/fake-{_uploadCounter}.jpg";
        return Task.FromResult<(string?, string?)>((url, null));
    }

    public Task DeleteImageFileAsync(string url)
    {
        DeletedUrls.Add(url);
        return Task.CompletedTask;
    }
}
