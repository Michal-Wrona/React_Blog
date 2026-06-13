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

            if (layout.Placements.Count > ImageSettings.MaxImagesPerPost)
                return $"Maksymalnie {ImageSettings.MaxImagesPerPost} zdjęć na kanwasie.";

            var seenImageIds = new HashSet<int>();

            foreach (var placement in layout.Placements)
            {
                if (!postImageIds.Contains(placement.ImageId))
                    return "Układ zawiera nieprawidłowe zdjęcie.";

                if (!seenImageIds.Add(placement.ImageId))
                    return "To samo zdjęcie nie może występować więcej niż raz.";

                if (placement.Left is < 0 or > 95)
                    return "Nieprawidłowa pozycja pozioma zdjęcia.";

                if (placement.Top is < 0 or > MaxTop)
                    return "Nieprawidłowa pozycja pionowa zdjęcia.";

                if (placement.Width is < MinWidth or > MaxWidth)
                    return "Nieprawidłowa szerokość zdjęcia.";

                if (placement.AspectRatio is < MinAspectRatio or > MaxAspectRatio)
                    return "Nieprawidłowe proporcje zdjęcia.";

                if (placement.ZIndex is < 0 or > 50)
                    return "Nieprawidłowa warstwa zdjęcia.";

                if (placement.CaptionEnabled)
                {
                    if (string.IsNullOrWhiteSpace(placement.Caption))
                        return "Podpis wymaga tekstu, gdy jest włączony.";

                    var captionError = ValidateCaption(placement.Caption);
                    if (captionError != null)
                        return captionError;
                }
                else if (placement.Caption != null && placement.Caption.Length > 0)
                {
                    return "Podpis musi być pusty, gdy jest wyłączony.";
                }
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
