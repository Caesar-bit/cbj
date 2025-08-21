namespace backend.Models;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public int Duration { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = "scheduled";
    public string Department { get; set; } = string.Empty;
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
