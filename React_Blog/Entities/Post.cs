namespace React_Blog.Entities
{
    public class Post
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string Content { get; set; } = null!;
    }
}
