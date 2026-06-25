using React_Blog.Entities;

namespace React_Blog.Helpers
{
    public static class ImageSettings
    {
        public const long MaxFileSizeBytes = 10 * 1024 * 1024;
        public const int MaxImagesPerSimplePost = 5;
        public const int MaxImagesPerVisualPost = 12;
        public const int MinImagesPerGallery = 1;
        public const int MaxImagesPerGallery = 5;
        public const int MaxCanvasElements = 10;

        public static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
        public const string UploadFolder = "uploads/images";

        public static int GetMaxImagesForPost(PostType postType) =>
            postType == PostType.Visual ? MaxImagesPerVisualPost : MaxImagesPerSimplePost;
    }
}
