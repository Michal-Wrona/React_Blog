using React_Blog.Entities;
using React_Blog.Helpers;

namespace React_Blog.Tests.Unit;

public class ImageSettingsTests
{
    [Fact]
    public void GetMaxImagesForPost_ReturnsFive_ForSimplePost()
    {
        ImageSettings.GetMaxImagesForPost(PostType.Simple)
            .Should().Be(ImageSettings.MaxImagesPerSimplePost);
    }

    [Fact]
    public void GetMaxImagesForPost_ReturnsTwelve_ForVisualPost()
    {
        ImageSettings.GetMaxImagesForPost(PostType.Visual)
            .Should().Be(ImageSettings.MaxImagesPerVisualPost);
    }
}
