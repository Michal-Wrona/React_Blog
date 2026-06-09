using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using React_Blog.Entities;
using React_Blog.Helpers;
using React_Blog.Interfaces;

namespace React_Blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController(
        IPostRepository postRepository,
        IImageService imageService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Post>>> GetPosts()
            => Ok(await postRepository.GetPostsAsync());

        [HttpGet("{id}")]
        public async Task<ActionResult<Post>> GetPost(int id)
        {
            var post = await postRepository.GetPostByIdWithImagesAsync(id);
            return post == null ? NotFound() : Ok(post);
        }

        [HttpPost]
        public async Task<ActionResult<Post>> CreatePost(Post post)
        {
            await postRepository.AddPostAsync(post);
            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }

        [HttpPost("{postId}/add-photo")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Image>> AddPhoto(int postId, IFormFile file)
        {
            var post = await postRepository.GetPostForUpdateAsync(postId);
            if (post == null) return NotFound("Post not found");

            var imageCount = await postRepository.GetImageCountForPostAsync(postId);
            if (imageCount >= ImageSettings.MaxImagesPerPost)
                return BadRequest($"Maksymalnie {ImageSettings.MaxImagesPerPost} zdjęć na post.");

            var result = await imageService.SaveImageAsync(file);
            if (result.Error != null) return BadRequest(result.Error);

            var image = new Image
            {
                Url = result.Url!,
                PostId = postId
            };

            await postRepository.AddImageAsync(image);

            return Ok(image);
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
