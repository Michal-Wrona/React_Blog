using React_Blog.Entities;
using React_Blog.Helpers;

namespace React_Blog.Tests.Unit;

public class VisualStyleSettingsTests
{
    [Fact]
    public void Validate_ReturnsNull_ForValidStyle()
    {
        VisualStyleSettings.Validate(ValidStyle()).Should().BeNull();
    }

    [Fact]
    public void Validate_ReturnsError_ForInvalidBackgroundColor()
    {
        var style = ValidStyle();
        style.BackgroundColor = "red";

        VisualStyleSettings.Validate(style)
            .Should().Be("Nieprawidłowy kolor tła.");
    }

    [Fact]
    public void Validate_ReturnsError_ForInvalidFontFamily()
    {
        var style = ValidStyle();
        style.FontFamily = "Comic Sans MS";

        VisualStyleSettings.Validate(style)
            .Should().Be("Niedozwolona czcionka.");
    }

    [Fact]
    public void Validate_ReturnsError_ForInvalidFontSize()
    {
        var style = ValidStyle();
        style.FontSize = "huge";

        VisualStyleSettings.Validate(style)
            .Should().Be("Niedozwolony rozmiar czcionki.");
    }

    [Fact]
    public void Validate_ReturnsError_ForDisallowedBackgroundImageUrl()
    {
        var style = ValidStyle();
        style.BackgroundImageUrl = "https://evil.com/bg.jpg";

        VisualStyleSettings.Validate(style)
            .Should().Be("Nieprawidłowy adres tła graficznego.");
    }

    [Fact]
    public void Validate_ReturnsNull_ForAllowedBackgroundImageUrl()
    {
        var style = ValidStyle();
        style.BackgroundImageUrl = "https://res.cloudinary.com/test/image/upload/v1/react-blog/images/bg.jpg";

        VisualStyleSettings.Validate(style).Should().BeNull();
    }

    private static VisualStyle ValidStyle() => new()
    {
        BackgroundColor = "#ffffff",
        TextColor = "#374151",
        FontFamily = "system-ui, sans-serif",
        FontSize = "medium"
    };
}
