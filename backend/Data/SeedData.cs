using backend.Models;
using Microsoft.AspNetCore.Identity;

namespace backend.Data;

public static class SeedData
{
    public static void Initialize(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (db.Patients.Any())
            return; // assume database already seeded

        // seed a demo user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = "admin@example.com",
            Role = "admin"
        };
        var hasher = new PasswordHasher<User>();
        user.PasswordHash = hasher.HashPassword(user, "password");
        db.Users.Add(user);

        var patient = new Patient
        {
            Id = Guid.NewGuid(),
            Name = "John Doe",
            Age = 45,
            Gender = "male",
            Contact = "555-1234",
            Email = "john@example.com",
            Status = "active",
            Department = "Cardiology"
        };
        db.Patients.Add(patient);

        var staff = new Staff
        {
            Id = Guid.NewGuid(),
            Name = "Dr. Smith",
            Email = "smith@example.com",
            Phone = "555-0001",
            Role = "doctor",
            Department = "Cardiology",
            HireDate = DateTime.UtcNow.AddYears(-5),
            Status = "active"
        };
        db.Staff.Add(staff);

        db.Appointments.Add(new Appointment
        {
            Id = Guid.NewGuid(),
            PatientId = patient.Id,
            PatientName = patient.Name,
            DoctorId = staff.Id,
            DoctorName = staff.Name,
            Date = DateTime.UtcNow.Date,
            Time = "09:00",
            Duration = 30,
            Type = "consultation",
            Status = "scheduled",
            Department = "Cardiology"
        });

        db.Records.Add(new MedicalRecord
        {
            Id = Guid.NewGuid(),
            PatientId = patient.Id,
            PatientName = patient.Name,
            DoctorId = staff.Id,
            DoctorName = staff.Name,
            Date = DateTime.UtcNow.Date,
            Type = "diagnosis",
            Title = "Initial Checkup",
            Description = "General health assessment",
            Status = "active",
            FollowUpRequired = false
        });

        db.SaveChanges();
    }
}

