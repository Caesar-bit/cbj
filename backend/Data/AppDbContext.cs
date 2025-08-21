using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<User> Users => Set<User>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<MedicalRecord> Records => Set<MedicalRecord>();
}
