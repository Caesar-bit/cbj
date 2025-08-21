namespace backend.Models;

public class Staff
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public string? LicenseNumber { get; set; }
    public DateTime HireDate { get; set; }
    public string Status { get; set; } = "active";
    public string? Shift { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public List<string> Qualifications { get; set; } = new();
    public int? Experience { get; set; }
    public decimal? Salary { get; set; }
}
