using backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Get()
    {
        var today = DateTime.UtcNow.Date;
        return Ok(new
        {
            patients = _db.Patients.Count(),
            staff = _db.Staff.Count(),
            appointments = _db.Appointments.Count(),
            todayAppointments = _db.Appointments.Count(a => a.Date.Date == today),
            records = _db.Records.Count()
        });
    }
}
