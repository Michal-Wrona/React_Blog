using React_Blog.Helpers;
using React_Blog.Interfaces;
using SixLabors.ImageSharp;

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

            try
            {
                // Wczytanie obrazu weryfikuje, że plik to faktycznie obraz (nie np. przemianowany .exe),
                // a ponowny zapis koduje od nowa tylko piksele, usuwając ewentualny złośliwy ładunek.
                await using var inputStream = file.OpenReadStream();
                using var image = await Image.LoadAsync(inputStream);
                await image.SaveAsync(filePath);
            }
            catch (Exception ex) when (ex is UnknownImageFormatException or InvalidImageContentException)
            {
                return (null, "Plik nie jest prawidłowym obrazem lub jest uszkodzony.");
            }

            var url = $"/{ImageSettings.UploadFolder}/{fileName}";
            return (url, null);
        }

        public void DeleteImageFile(string url)
        {
            var relativePath = url.TrimStart('/');
            var webRootPath = environment.WebRootPath
                ?? Path.Combine(environment.ContentRootPath, "wwwroot");
            var filePath = Path.Combine(webRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(filePath))
                File.Delete(filePath);
        }
    }
}
