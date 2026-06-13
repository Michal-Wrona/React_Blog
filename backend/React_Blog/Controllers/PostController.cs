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
            var titleError = PostValidation.ValidateCreateTitle(post.Title);
            if (titleError != null) return BadRequest(titleError);

            var contentError = PostValidation.ValidateCreateContent(post.Content);
            if (contentError != null) return BadRequest(contentError);

            if (post.PostType == PostType.Simple)
            {
                post.VisualStyle = null;
                post.VisualLayout = null;
            }
            else
            {
                post.VisualStyle ??= new VisualStyle();
                var visualError = PostValidation.ValidateVisualPost(post);
                if (visualError != null) return BadRequest(visualError);

                post.VisualLayout ??= new VisualLayout();
                SanitizeVisualLayout(post.VisualLayout);
            }

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

        [HttpPost("{postId}/background-image")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<string>> UploadBackgroundImage(int postId, IFormFile file)
        {
            var post = await postRepository.GetPostForUpdateAsync(postId);
            if (post == null) return NotFound("Post not found");
            if (post.PostType != PostType.Visual)
                return BadRequest("Tylko posty wizualne mogą mieć tło graficzne.");

            var result = await imageService.SaveImageAsync(file);
            if (result.Error != null) return BadRequest(result.Error);

            if (!string.IsNullOrEmpty(post.VisualStyle?.BackgroundImageUrl))
                imageService.DeleteImageFile(post.VisualStyle.BackgroundImageUrl);

            post.VisualStyle ??= new VisualStyle();
            post.VisualStyle.BackgroundImageUrl = result.Url;
            await postRepository.UpdatePostAsync(post);

            return Ok(result.Url);
        }

        [HttpDelete("{postId}/background-image")]
        public async Task<IActionResult> DeleteBackgroundImage(int postId)
        {
            var post = await postRepository.GetPostForUpdateAsync(postId);
            if (post == null) return NotFound();
            if (post.PostType != PostType.Visual) return BadRequest();

            if (!string.IsNullOrEmpty(post.VisualStyle?.BackgroundImageUrl))
            {
                imageService.DeleteImageFile(post.VisualStyle.BackgroundImageUrl);
                post.VisualStyle.BackgroundImageUrl = null;
                await postRepository.UpdatePostAsync(post);
            }

            return NoContent();
        }

        [HttpDelete("{postId}/images/{imageId}")]
        public async Task<IActionResult> DeletePhoto(int postId, int imageId)
        {
            var image = await postRepository.GetImageByIdAsync(imageId);
            if (image == null) return NotFound();
            if (image.PostId != postId) return BadRequest();

            var post = await postRepository.GetPostForUpdateAsync(postId);

            imageService.DeleteImageFile(image.Url);
            await postRepository.DeleteImageAsync(imageId);

            if (post?.VisualLayout != null)
            {
                post.VisualLayout.Placements.RemoveAll(p => p.ImageId == imageId);
                await postRepository.UpdatePostAsync(post);
            }

            return NoContent();
        }

        private static void SanitizeVisualLayout(VisualLayout layout)
        {
            foreach (var placement in layout.Placements)
            {
                if (placement.CaptionEnabled && placement.Caption != null)
                    placement.Caption = VisualLayoutSettings.SanitizeCaption(placement.Caption);
            }
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePost(Post post)
        {
            var existing = await postRepository.GetPostForUpdateAsync(post.Id);
            if (existing == null) return NotFound();

            var titleError = PostValidation.ValidateCreateTitle(post.Title);
            if (titleError != null) return BadRequest(titleError);

            var contentError = PostValidation.ValidateCreateContent(post.Content);
            if (contentError != null) return BadRequest(contentError);

            existing.Title = post.Title;
            existing.Content = post.Content;

            if (existing.PostType == PostType.Visual)
            {
                if (post.VisualStyle == null)
                    return BadRequest("Post wizualny wymaga ustawień wyglądu.");

                var visualError = VisualStyleSettings.Validate(post.VisualStyle);
                if (visualError != null) return BadRequest(visualError);

                existing.VisualStyle = post.VisualStyle;

                existing.VisualLayout ??= new VisualLayout();
                if (post.VisualLayout != null)
                {
                    SanitizeVisualLayout(post.VisualLayout);

                    var imageIds = existing.Images.Select(i => i.Id).ToHashSet();
                    var layoutError = VisualLayoutSettings.Validate(post.VisualLayout, imageIds);
                    if (layoutError != null) return BadRequest(layoutError);

                    existing.VisualLayout = post.VisualLayout;
                }
            }

            await postRepository.UpdatePostAsync(existing);
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
