using System.Text.RegularExpressions;
using React_Blog.Entities;

namespace React_Blog.Helpers
{
    public static partial class VisualStyleSettings
    {
        public static readonly HashSet<string> AllowedFontFamilies =
        [
            "system-ui, sans-serif",
            "Georgia, serif",
            "\"Times New Roman\", Times, serif",
            "Arial, Helvetica, sans-serif",
            "Verdana, sans-serif",
            "\"Courier New\", monospace"
        ];

        public static readonly HashSet<string> AllowedFontSizes =
        [
            "small",
            "medium",
            "large"
        ];

        private static readonly Regex HexColorPattern = HexColorRegex();

        public static string? Validate(VisualStyle style)
        {
            if (!HexColorPattern.IsMatch(style.BackgroundColor))
                return "Nieprawidłowy kolor tła.";

            if (!HexColorPattern.IsMatch(style.TextColor))
                return "Nieprawidłowy kolor tekstu.";

            if (!AllowedFontFamilies.Contains(style.FontFamily))
                return "Niedozwolona czcionka.";

            if (!AllowedFontSizes.Contains(style.FontSize))
                return "Niedozwolony rozmiar czcionki.";

            if (style.BackgroundImageUrl != null
                && !ImageUrlValidation.IsAllowed(style.BackgroundImageUrl))
                return "Nieprawidłowy adres tła graficznego.";

            return null;
        }

        [GeneratedRegex(@"^#[0-9a-fA-F]{6}$")]
        private static partial Regex HexColorRegex();
    }
}
