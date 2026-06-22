namespace React_Blog.DTOs
{
    public class UserResponse
    {
        public required string Id { get; set; }
        public required string Email { get; set; }
        public required IReadOnlyList<string> Roles { get; set; }
    }
}
