namespace React_Blog.Entities
{
    public class Image
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public string Url { get; set; } = null!;
        public Post Post { get; set; } = null!;
    }
}
