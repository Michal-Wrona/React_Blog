using System.Text.RegularExpressions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using React_Blog.Helpers;
using React_Blog.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;

namespace React_Blog.Services
{
    public partial class ImageService(
        Cloudinary cloudinary,
        IWebHostEnvironment environment) : IImageService
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

            try
            {
                await using var inputStream = file.OpenReadStream();
                using var image = await Image.LoadAsync(inputStream);

                await using var outputStream = new MemoryStream();
                await image.SaveAsync(outputStream, GetEncoder(extension));
                outputStream.Position = 0;

                var fileName = $"{Guid.NewGuid()}{extension}";
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, outputStream),
                    Folder = ImageSettings.CloudinaryFolder,
                    UseFilename = false,
                    UniqueFilename = true,
                    Overwrite = false,
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null)
                    return (null, "Nie udało się przesłać obrazu do Cloudinary.");

                return (uploadResult.SecureUrl.ToString(), null);
            }
            catch (Exception ex) when (ex is UnknownImageFormatException or InvalidImageContentException)
            {
                return (null, "Plik nie jest prawidłowym obrazem lub jest uszkodzony.");
            }
        }

        public async Task DeleteImageFileAsync(string url)
        {
            if (IsCloudinaryUrl(url))
            {
                var publicId = ExtractCloudinaryPublicId(url);
                if (publicId == null)
                    return;

                await cloudinary.DestroyAsync(new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Image
                });
                return;
            }

            if (!url.StartsWith($"/{ImageSettings.LegacyUploadFolder}/", StringComparison.Ordinal))
                return;

            var relativePath = url.TrimStart('/');
            var webRootPath = environment.WebRootPath
                ?? Path.Combine(environment.ContentRootPath, "wwwroot");
            var filePath = Path.Combine(webRootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

            if (File.Exists(filePath))
                File.Delete(filePath);
        }

        private static bool IsCloudinaryUrl(string url) =>
            Uri.TryCreate(url, UriKind.Absolute, out var uri)
            && uri.Scheme == Uri.UriSchemeHttps
            && uri.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase);

        private static string? ExtractCloudinaryPublicId(string url)
        {
            var match = CloudinaryPublicIdRegex().Match(url);
            return match.Success ? match.Groups[1].Value : null;
        }

        private static IImageEncoder GetEncoder(string extension) => extension switch
        {
            ".png" => new PngEncoder(),
            ".webp" => new WebpEncoder(),
            _ => new JpegEncoder { Quality = 95 }
        };

        [GeneratedRegex(@"res\.cloudinary\.com/[^/]+/(?:image|video|raw)/upload/(?:.*/)?(?:v\d+/)?(.+)\.[^/]+$", RegexOptions.IgnoreCase)]
        private static partial Regex CloudinaryPublicIdRegex();
    }
}
