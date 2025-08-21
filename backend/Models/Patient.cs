namespace backend.Models;

public class Patient
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string Status { get; set; } = "active";
    public DateTime? AdmissionDate { get; set; }
    public string? Department { get; set; }
    public string? AssignedDoctor { get; set; }
    public List<string> MedicalHistory { get; set; } = new();
    public List<string> Allergies { get; set; } = new();
    public string? BloodType { get; set; }
    public string? Insurance { get; set; }
}
