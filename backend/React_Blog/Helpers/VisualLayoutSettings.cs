using System.Text.RegularExpressions;
using React_Blog.Entities;

namespace React_Blog.Helpers
{
    public static partial class VisualLayoutSettings
    {
        public const int MaxCaptionLength = 200;
        public const double MinWidth = 10;
        public const double MaxWidth = 100;
        public const double MinAspectRatio = 0.2;
        public const double MaxAspectRatio = 5;
        public const double MaxTop = 500;

        private static readonly Regex UnsafeCaptionPattern = UnsafeCaptionRegex();

        public static string? Validate(VisualLayout? layout, IReadOnlyCollection<int> postImageIds)
        {
            if (layout == null)
                return null;

            if (layout.Placements.Count + layout.Galleries.Count > ImageSettings.MaxCanvasElements)
                return $"Maksymalnie {ImageSettings.MaxCanvasElements} elementów na kanwasie (zdjęcia i galerie).";

            var seenImageIds = new HashSet<int>();
            var seenGalleryIds = new HashSet<string>();

            foreach (var placement in layout.Placements)
            {
                var error = ValidatePlacement(placement, postImageIds, seenImageIds);
                if (error != null)
                    return error;
            }

            foreach (var gallery in layout.Galleries)
            {
                var error = ValidateGallery(gallery, postImageIds, seenImageIds, seenGalleryIds);
                if (error != null)
                    return error;
            }

            return null;
        }

        private static string? ValidatePlacement(
            ImagePlacement placement,
            IReadOnlyCollection<int> postImageIds,
            HashSet<int> seenImageIds)
        {
            if (!postImageIds.Contains(placement.ImageId))
                return "Układ zawiera nieprawidłowe zdjęcie.";

            if (!seenImageIds.Add(placement.ImageId))
                return "To samo zdjęcie nie może występować więcej niż raz.";

            return ValidateGeometryAndCaption(
                placement.Left,
                placement.Top,
                placement.Width,
                placement.AspectRatio,
                placement.ZIndex,
                placement.CaptionEnabled,
                placement.Caption);
        }

        private static string? ValidateGallery(
            GalleryPlacement gallery,
            IReadOnlyCollection<int> postImageIds,
            HashSet<int> seenImageIds,
            HashSet<string> seenGalleryIds)
        {
            if (string.IsNullOrWhiteSpace(gallery.GalleryId))
                return "Galeria wymaga identyfikatora.";

            if (!seenGalleryIds.Add(gallery.GalleryId))
                return "Zduplikowany identyfikator galerii.";

            if (gallery.ImageIds.Count is < ImageSettings.MinImagesPerGallery or > ImageSettings.MaxImagesPerGallery)
                return $"Galeria musi zawierać od {ImageSettings.MinImagesPerGallery} do {ImageSettings.MaxImagesPerGallery} zdjęć.";

            foreach (var imageId in gallery.ImageIds)
            {
                if (!postImageIds.Contains(imageId))
                    return "Galeria zawiera nieprawidłowe zdjęcie.";

                if (!seenImageIds.Add(imageId))
                    return "To samo zdjęcie nie może występować więcej niż raz.";
            }

            return ValidateGeometryAndCaption(
                gallery.Left,
                gallery.Top,
                gallery.Width,
                gallery.AspectRatio,
                gallery.ZIndex,
                gallery.CaptionEnabled,
                gallery.Caption);
        }

        private static string? ValidateGeometryAndCaption(
            double left,
            double top,
            double width,
            double aspectRatio,
            int zIndex,
            bool captionEnabled,
            string? caption)
        {
            if (left is < 0 or > 95)
                return "Nieprawidłowa pozycja pozioma elementu.";

            if (top is < 0 or > MaxTop)
                return "Nieprawidłowa pozycja pionowa elementu.";

            if (width is < MinWidth or > MaxWidth)
                return "Nieprawidłowa szerokość elementu.";

            if (aspectRatio is < MinAspectRatio or > MaxAspectRatio)
                return "Nieprawidłowe proporcje elementu.";

            if (zIndex is < 0 or > 50)
                return "Nieprawidłowa warstwa elementu.";

            if (captionEnabled)
            {
                if (string.IsNullOrWhiteSpace(caption))
                    return "Podpis wymaga tekstu, gdy jest włączony.";

                var captionError = ValidateCaption(caption);
                if (captionError != null)
                    return captionError;
            }
            else if (caption != null && caption.Length > 0)
            {
                return "Podpis musi być pusty, gdy jest wyłączony.";
            }

            return null;
        }

        public static string? ValidateCaption(string caption)
        {
            var trimmed = caption.Trim();

            if (trimmed.Length > MaxCaptionLength)
                return $"Podpis może mieć maksymalnie {MaxCaptionLength} znaków.";

            if (UnsafeCaptionPattern.IsMatch(trimmed))
                return "Podpis zawiera niedozwolone znaki.";

            return null;
        }

        public static string SanitizeCaption(string caption)
            => caption.Trim();

        [GeneratedRegex(@"[<>]")]
        private static partial Regex UnsafeCaptionRegex();
    }
}
