using System.Text.Json.Serialization;

namespace React_Blog.Entities
{
    public class Image
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string Url { get; set; } = null!;

        [JsonIgnore]
        public Post Post { get; set; } = null!;
    }
}
