using React_Blog.Helpers;
using React_Blog.Interfaces;

namespace React_Blog.Services
{
    public class ImageService(IWebHostEnvironment environment) : IImageService
    {
        public async Task<(string? Url, string? Error)> SaveImageAsync(IFormFile file)
        {
            if (file.Length == 0)
                return (null, "Plik jest pusty.");

            if (file.Length > ImageSettings.MaxFileSizeBytes)
                return (null, "Plik jest za duży. Maksymalny rozmiar to 10 MB.");

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!ImageSettings.AllowedExtensions.Contains(extension))
                return (null, "Niedozwolony format pliku. Dozwolone: jpg, jpeg, png, webp.");

            var webRootPath = environment.WebRootPath
                ?? Path.Combine(environment.ContentRootPath, "wwwroot");

            var uploadPath = Path.Combine(webRootPath, ImageSettings.UploadFolder);
            Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadPath, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var url = $"/{ImageSettings.UploadFolder}/{fileName}";
            return (url, null);
        }
    }
}
