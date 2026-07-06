using React_Blog.Helpers;

namespace React_Blog.Tests.Unit;

public class ImageUrlValidationTests
{
    [Fact]
    public void IsAllowed_ReturnsTrue_ForLegacyPath()
    {
        ImageUrlValidation.IsAllowed($"/{ImageSettings.LegacyUploadFolder}/photo.jpg")
            .Should().BeTrue();
    }

    [Fact]
    public void IsAllowed_ReturnsTrue_ForCloudinaryHttps()
    {
        ImageUrlValidation.IsAllowed("https://res.cloudinary.com/demo/image/upload/v1/react-blog/images/abc.jpg")
            .Should().BeTrue();
    }

    [Fact]
    public void IsAllowed_ReturnsFalse_ForCloudinaryHttp()
    {
        ImageUrlValidation.IsAllowed("http://res.cloudinary.com/demo/image/upload/v1/abc.jpg")
            .Should().BeFalse();
    }

    [Theory]
    [InlineData("https://evil.com/photo.jpg")]
    [InlineData("not-a-url")]
    [InlineData("")]
    public void IsAllowed_ReturnsFalse_ForDisallowedUrls(string url)
    {
        ImageUrlValidation.IsAllowed(url).Should().BeFalse();
    }
}
