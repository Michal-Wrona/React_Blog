namespace React_Blog.Helpers
{
    public static class ImageUrlValidation
    {
        public static bool IsAllowed(string url)
        {
            if (url.StartsWith($"/{ImageSettings.LegacyUploadFolder}/", StringComparison.Ordinal))
                return true;

            return Uri.TryCreate(url, UriKind.Absolute, out var uri)
                && uri.Scheme == Uri.UriSchemeHttps
                && uri.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase);
        }
    }
}
