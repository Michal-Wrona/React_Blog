using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using React_Blog.Entities;
using React_Blog.Interfaces;

namespace React_Blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController(IPostRepository postRepository) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
            => Ok(await postRepository.GetPostsAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Post>> GetPost(int id)
        {
            var post = await postRepository.GetPostByIdAsync(id);
            return post == null ? NotFound() : Ok(post);
        }

        [HttpPost]
        public async Task<ActionResult<Post>> CreatePost(Post post)
        {
            await postRepository.AddPostAsync(post);
            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePost(Post post)
        {
            await postRepository.UpdatePostAsync(post);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            await postRepository.DeletePostAsync(id);
            return NoContent();
        }
    }
}
