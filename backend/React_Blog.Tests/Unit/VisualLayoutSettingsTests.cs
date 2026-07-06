using React_Blog.Entities;
using React_Blog.Helpers;

namespace React_Blog.Tests.Unit;

public class VisualLayoutSettingsTests
{
    [Fact]
    public void Validate_ReturnsNull_WhenLayoutIsNull()
    {
        VisualLayoutSettings.Validate(null, [1]).Should().BeNull();
    }

    [Fact]
    public void Validate_ReturnsError_ForUnknownImageId()
    {
        var layout = new VisualLayout
        {
            Placements =
            [
                new ImagePlacement
                {
                    ImageId = 99,
                    Left = 10,
                    Top = 10,
                    Width = 30,
                    AspectRatio = 1,
                    ZIndex = 1
                }
            ]
        };

        VisualLayoutSettings.Validate(layout, [1, 2])
            .Should().Be("Układ zawiera nieprawidłowe zdjęcie.");
    }

    [Fact]
    public void Validate_ReturnsError_ForDuplicateImageId()
    {
        var layout = new VisualLayout
        {
            Placements =
            [
                ValidPlacement(1),
                ValidPlacement(1)
            ]
        };

        VisualLayoutSettings.Validate(layout, [1])
            .Should().Be("To samo zdjęcie nie może występować więcej niż raz.");
    }

    [Fact]
    public void Validate_ReturnsError_WhenGalleryHasTooFewImages()
    {
        var layout = new VisualLayout
        {
            Galleries =
            [
                new GalleryPlacement
                {
                    GalleryId = "g1",
                    ImageIds = [],
                    Left = 10,
                    Top = 10,
                    Width = 30,
                    AspectRatio = 1,
                    ZIndex = 1
                }
            ]
        };

        VisualLayoutSettings.Validate(layout, [1])
            .Should().Be($"Galeria musi zawierać od {ImageSettings.MinImagesPerGallery} do {ImageSettings.MaxImagesPerGallery} zdjęć.");
    }

    [Fact]
    public void Validate_ReturnsNull_ForValidPlacement()
    {
        var layout = new VisualLayout
        {
            Placements = [ValidPlacement(1)]
        };

        VisualLayoutSettings.Validate(layout, [1]).Should().BeNull();
    }

    [Fact]
    public void SanitizeCaption_TrimsWhitespace()
    {
        VisualLayoutSettings.SanitizeCaption("  podpis  ")
            .Should().Be("podpis");
    }

    [Fact]
    public void ValidateCaption_ReturnsError_ForUnsafeCharacters()
    {
        VisualLayoutSettings.ValidateCaption("tekst <script>")
            .Should().Be("Podpis zawiera niedozwolone znaki.");
    }

    private static ImagePlacement ValidPlacement(int imageId) => new()
    {
        ImageId = imageId,
        Left = 10,
        Top = 10,
        Width = 30,
        AspectRatio = 1,
        ZIndex = 1
    };
}
