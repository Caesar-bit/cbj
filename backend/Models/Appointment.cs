namespace backend.Models;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public Guid StaffId { get; set; }
    public DateTime Date { get; set; }
}
