using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StaffController : ControllerBase
{
    private readonly AppDbContext _db;

    public StaffController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IEnumerable<Staff> Get() => _db.Staff;

    [HttpPost]
    public IActionResult Create(Staff member)
    {
        member.Id = Guid.NewGuid();
        _db.Staff.Add(member);
        _db.SaveChanges();
        return Created($"api/staff/{member.Id}", member);
    }
}
