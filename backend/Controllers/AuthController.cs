using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterDto dto)
    {
        if (_db.Users.Any(u => u.Email == dto.Email))
            return BadRequest("Email already registered");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email,
            Role = "user"
        };
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);
        _db.Users.Add(user);
        _db.SaveChanges();
        return Ok(new { user.Id, user.Name, user.Email, user.Role });
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var user = _db.Users.SingleOrDefault(u => u.Email == dto.Email);
        if (user == null)
            return Unauthorized();

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        return result == PasswordVerificationResult.Success
            ? Ok(new { user.Id, user.Name, user.Email, user.Role })
            : Unauthorized();
    }

    public record RegisterDto(string Name, string Email, string Password);
    public record LoginDto(string Email, string Password);
}
