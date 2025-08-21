using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecordsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RecordsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IEnumerable<MedicalRecord> Get() => _db.Records;

    [HttpPost]
    public IActionResult Create(MedicalRecord record)
    {
        record.Id = Guid.NewGuid();
        _db.Records.Add(record);
        _db.SaveChanges();
        return Created($"api/records/{record.Id}", record);
    }
}
