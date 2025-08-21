using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AppointmentsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IEnumerable<Appointment> Get() => _db.Appointments;

    [HttpPost]
    public IActionResult Create(Appointment appt)
    {
        appt.Id = Guid.NewGuid();
        _db.Appointments.Add(appt);
        _db.SaveChanges();
        return Created($"api/appointments/{appt.Id}", appt);
    }
}
