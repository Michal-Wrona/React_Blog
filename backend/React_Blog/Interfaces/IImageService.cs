namespace React_Blog.Interfaces
{
    public interface IImageService
    {
        Task<(string? Url, string? Error)> SaveImageAsync(IFormFile file);
        void DeleteImageFile(string url);
    }
}
