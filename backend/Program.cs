var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

var users = new List<User>();
var patients = new List<object>();
var staff = new List<object>();
var appointments = new List<object>();
var records = new List<object>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapPost("/api/auth/register", (RegisterDto dto) =>
{
    var user = new User(Guid.NewGuid().ToString(), dto.Name, dto.Email, dto.Password, "nurse");
    users.Add(user);
    return Results.Ok(new { user.Id, user.Name, user.Email, user.Role });
});

app.MapPost("/api/auth/login", (LoginDto dto) =>
{
    var user = users.FirstOrDefault(u => u.Email == dto.Email && u.Password == dto.Password);
    return user is null
        ? Results.Unauthorized()
        : Results.Ok(new { user.Id, user.Name, user.Email, user.Role });
});

app.MapGet("/api/patients", () => patients);
app.MapGet("/api/staff", () => staff);
app.MapGet("/api/appointments", () => appointments);
app.MapGet("/api/records", () => records);
app.MapGet("/api/dashboard", () => new
{
    patients = patients.Count,
    staff = staff.Count,
    appointments = appointments.Count,
    todayAppointments = 0,
    records = records.Count
});

app.Run();

record User(string Id, string Name, string Email, string Password, string Role);
record RegisterDto(string Name, string Email, string Password);
record LoginDto(string Email, string Password);
