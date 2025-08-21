namespace backend.Models;

public class Patient
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}
