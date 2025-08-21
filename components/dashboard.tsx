"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Calendar, FileText, LogOut, User } from "lucide-react"
import { PatientManagement } from "@/components/patient-management"
import { StaffManagement } from "@/components/staff-management"
import { AppointmentManagement } from "@/components/appointment-management"
import { MedicalRecords } from "@/components/medical-records"
import { mockPatients } from "@/lib/patient-data"
import { mockStaff } from "@/lib/staff-data"
import { mockAppointments } from "@/lib/appointment-data"
import { mockMedicalRecords } from "@/lib/medical-record-data"

type DashboardView = "overview" | "patients" | "staff" | "appointments" | "records"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [currentView, setCurrentView] = useState<DashboardView>("overview")
  const [counts, setCounts] = useState({
    patients: 0,
    staff: 0,
    appointments: 0,
    todayAppointments: 0,
    records: 0,
  })

  useEffect(() => {
    const updateCounts = () => {
      const today = new Date().toISOString().split("T")[0]
      const todayAppointments = mockAppointments.filter((apt) => apt.date === today)

      setCounts({
        patients: mockPatients.length,
        staff: mockStaff.filter((s) => s.status === "active").length,
        appointments: mockAppointments.length,
        todayAppointments: todayAppointments.length,
        records: mockMedicalRecords.length,
      })
    }

    updateCounts()
    const interval = setInterval(updateCounts, 1000)
    return () => clearInterval(interval)
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor":
        return "bg-blue-100 text-blue-800"
      case "nurse":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getQuickActions = () => {
    switch (user?.role) {
      case "doctor":
        return [
          {
            icon: Users,
            label: "View Patients",
            description: "Access patient records",
            view: "patients" as DashboardView,
          },
          {
            icon: Calendar,
            label: "My Appointments",
            description: "Today's schedule",
            view: "appointments" as DashboardView,
          },
          {
            icon: FileText,
            label: "Medical Records",
            description: "Update patient files",
            view: "records" as DashboardView,
          },
        ]
      case "nurse":
        return [
          {
            icon: Users,
            label: "Patient Care",
            description: "Monitor patient status",
            view: "patients" as DashboardView,
          },
          {
            icon: Calendar,
            label: "Shift Schedule",
            description: "View assignments",
            view: "appointments" as DashboardView,
          },
          {
            icon: FileText,
            label: "Care Notes",
            description: "Update care records",
            view: "records" as DashboardView,
          },
        ]
      case "admin":
        return [
          {
            icon: Users,
            label: "Staff Management",
            description: "Manage hospital staff",
            view: "staff" as DashboardView,
          },
          {
            icon: Calendar,
            label: "Appointments",
            description: "Schedule management",
            view: "appointments" as DashboardView,
          },
          {
            icon: FileText,
            label: "Reports",
            description: "System reports",
            view: "records" as DashboardView,
          },
        ]
      default:
        return []
    }
  }

  const renderContent = () => {
    switch (currentView) {
      case "patients":
        return <PatientManagement />
      case "staff":
        return <StaffManagement />
      case "appointments":
        return <AppointmentManagement />
      case "records":
        return <MedicalRecords />
      default:
        return <OverviewContent />
    }
  }

  const OverviewContent = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name}</h2>
        <p className="text-muted-foreground">
          {user?.department && `${user.department} Department • `}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {getQuickActions().map((action, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setCurrentView(action.view)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <action.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{action.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{action.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {counts.patients === 0 && counts.staff === 0 && counts.appointments === 0 && counts.records === 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Welcome to Your Hospital Management System</CardTitle>
            <CardDescription className="text-center">
              Your database is empty and ready for you to start adding data. Begin by adding patients, staff,
              appointments, or medical records.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Button variant="outline" onClick={() => setCurrentView("patients")}>
                <Users className="h-4 w-4 mr-2" />
                Add Patients
              </Button>
              <Button variant="outline" onClick={() => setCurrentView("staff")}>
                <User className="h-4 w-4 mr-2" />
                Add Staff
              </Button>
              <Button variant="outline" onClick={() => setCurrentView("appointments")}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointments
              </Button>
              <Button variant="outline" onClick={() => setCurrentView("records")}>
                <FileText className="h-4 w-4 mr-2" />
                Add Records
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.patients}</div>
            <p className="text-xs text-muted-foreground">
              {counts.patients === 0 ? "No patients yet" : "Active in system"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {counts.todayAppointments === 0 ? "No appointments today" : `${counts.appointments} total appointments`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.staff}</div>
            <p className="text-xs text-muted-foreground">
              {counts.staff === 0 ? "No staff added" : "Currently active"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Medical Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.records}</div>
            <p className="text-xs text-muted-foreground">{counts.records === 0 ? "No records yet" : "Total records"}</p>
          </CardContent>
        </Card>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Hospital Management System</h1>
              <p className="text-sm text-muted-foreground">Professional Healthcare Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.name}</span>
              <Badge className={getRoleColor(user?.role || "")}>{user?.role?.toUpperCase()}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {currentView !== "overview" && (
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("overview")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  )
}
