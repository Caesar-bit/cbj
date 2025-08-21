using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PatientsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IEnumerable<Patient> Get() => _db.Patients;

    [HttpGet("{id}")]
    public ActionResult<Patient> GetById(Guid id)
    {
        var patient = _db.Patients.Find(id);
        return patient is null ? NotFound() : patient;
    }

    [HttpPost]
    public IActionResult Create(Patient patient)
    {
        patient.Id = Guid.NewGuid();
        _db.Patients.Add(patient);
        _db.SaveChanges();
        return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
    }
}
