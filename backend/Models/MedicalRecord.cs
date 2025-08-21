namespace backend.Models;

public class MedicalRecord
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public Guid? AppointmentId { get; set; }
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public List<string> Symptoms { get; set; } = new();
    public string? Treatment { get; set; }
    public List<Medication> Medications { get; set; } = new();
    public List<LabResult> LabResults { get; set; } = new();
    public List<string> Attachments { get; set; } = new();
    public bool FollowUpRequired { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Medication
{
    public string Name { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public DateTime PrescribedDate { get; set; }
    public string Status { get; set; } = "active";
}

public class LabResult
{
    public string TestName { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public string NormalRange { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}
