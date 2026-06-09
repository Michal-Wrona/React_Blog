namespace React_Blog.Helpers
{
    public static class ImageSettings
    {
        public const long MaxFileSizeBytes = 10 * 1024 * 1024;
        public const int MaxImagesPerPost = 5;
        public static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        public const string UploadFolder = "uploads/images";
    }
}
