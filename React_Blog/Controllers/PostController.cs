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
        [HttpPost]
        public async Task<ActionResult> AddPost(Post post)
        {
            await postRepository.AddPostAsync(post);
            return Ok();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetAllPosts()
        {
            var posts = await postRepository.GetPostsAsync();
            return Ok(posts);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Post>> GetPostById(int id)
        {
            var post = await postRepository.GetPostByIdAsync(id);
            if (post == null) return NotFound();
            return Ok(post);
        }


        [HttpPut]
        public async Task<IActionResult> UpdatePost(Post post)
        {
            await postRepository.UpdatePost(post);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            await postRepository.DeletePost(id);
            return NoContent();
        }
    }
}
