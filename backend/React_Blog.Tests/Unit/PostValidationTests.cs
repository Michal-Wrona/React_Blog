using React_Blog.Entities;
using React_Blog.Helpers;

namespace React_Blog.Tests.Unit;

public class PostValidationTests
{
    [Theory]
    [InlineData("abc")]
    [InlineData("")]
    public void ValidateCreateTitle_ReturnsError_WhenTooShort(string title)
    {
        PostValidation.ValidateCreateTitle(title)
            .Should().Be("Tytuł musi mieć minimum 5 znaków.");
    }

    [Fact]
    public void ValidateCreateTitle_ReturnsError_WhenOnlyWhitespace()
    {
        PostValidation.ValidateCreateTitle("     ")
            .Should().Be("Tytuł nie może składać się wyłącznie ze znaków białych.");
    }

    [Fact]
    public void ValidateCreateTitle_ReturnsNull_WhenValid()
    {
        PostValidation.ValidateCreateTitle("Poprawny tytuł")
            .Should().BeNull();
    }

    [Fact]
    public void ValidateCreateContent_ReturnsError_WhenTooShort()
    {
        PostValidation.ValidateCreateContent("za krótka treść")
            .Should().Be("Treść musi mieć minimum 30 znaków.");
    }

    [Fact]
    public void ValidateCreateContent_ReturnsError_WhenTooMuchWhitespace()
    {
        var content = new string(' ', 20) + "tekst" + new string(' ', 20);
        PostValidation.ValidateCreateContent(content)
            .Should().Be("Treść może zawierać maksymalnie połowę znaków białych.");
    }

    [Fact]
    public void ValidateCreateContent_ReturnsNull_WhenValid()
    {
        PostValidation.ValidateCreateContent(
                "To jest poprawna treść posta z wystarczającą liczbą znaków.")
            .Should().BeNull();
    }

    [Fact]
    public void ValidateVisualPost_ReturnsNull_ForSimplePost()
    {
        var post = new Post
        {
            Title = "Tytuł",
            Content = "Treść posta z odpowiednią długością znaków.",
            PostType = PostType.Simple
        };

        PostValidation.ValidateVisualPost(post).Should().BeNull();
    }

    [Fact]
    public void ValidateVisualPost_ReturnsError_WhenVisualStyleMissing()
    {
        var post = new Post
        {
            Title = "Tytuł",
            Content = "Treść posta z odpowiednią długością znaków.",
            PostType = PostType.Visual,
            VisualStyle = null
        };

        PostValidation.ValidateVisualPost(post)
            .Should().Be("Post wizualny wymaga ustawień wyglądu.");
    }

    [Fact]
    public void ValidateVisualPost_ReturnsNull_WhenVisualStyleValid()
    {
        var post = new Post
        {
            Title = "Tytuł",
            Content = "Treść posta z odpowiednią długością znaków.",
            PostType = PostType.Visual,
            VisualStyle = ValidVisualStyle()
        };

        PostValidation.ValidateVisualPost(post).Should().BeNull();
    }

    private static VisualStyle ValidVisualStyle() => new()
    {
        BackgroundColor = "#ffffff",
        TextColor = "#374151",
        FontFamily = "system-ui, sans-serif",
        FontSize = "medium"
    };
}
