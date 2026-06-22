using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using React_Blog.DTOs;
using React_Blog.Entities;
using React_Blog.Helpers;

namespace React_Blog.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager) : ControllerBase
    {
        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email
            };

            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));

            await userManager.AddToRoleAsync(user, Roles.User);

            await signInManager.SignInAsync(user, isPersistent: true);
            return Ok(await BuildUserResponse(user));
        }

        [AllowAnonymous]
        [EnableRateLimiting("auth")]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await signInManager.PasswordSignInAsync(
                request.Email,
                request.Password,
                isPersistent: true,
                lockoutOnFailure: true);

            if (result.IsLockedOut)
                return StatusCode(StatusCodes.Status423Locked, "Konto tymczasowo zablokowane. Spróbuj ponownie za chwilę.");

            if (!result.Succeeded)
                return Unauthorized("Nieprawidłowy email lub hasło.");

            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Unauthorized("Nieprawidłowy email lub hasło.");

            return Ok(await BuildUserResponse(user));
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return NoContent();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<UserResponse>> Me()
        {
            var user = await userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            return Ok(await BuildUserResponse(user));
        }

        private async Task<UserResponse> BuildUserResponse(ApplicationUser user)
        {
            var roles = await userManager.GetRolesAsync(user);
            return new UserResponse
            {
                Id = user.Id,
                Email = user.Email!,
                Roles = roles.ToList()
            };
        }
    }
}
