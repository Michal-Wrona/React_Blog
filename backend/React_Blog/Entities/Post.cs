using System.Text.Json.Serialization;

namespace React_Blog.Entities
{
    public class Post
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string Content { get; set; } = null!;
        public PostType PostType { get; set; } = PostType.Simple;
        public VisualStyle? VisualStyle { get; set; }
        public VisualLayout? VisualLayout { get; set; }
        public string? AuthorId { get; set; }

        [JsonIgnore]
        public ApplicationUser? Author { get; set; }

        public ICollection<Image> Images { get; set; } = [];
    }
}
