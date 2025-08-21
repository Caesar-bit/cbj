"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback } from "react"
import { API_BASE } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Edit,
  Eye,
  Calendar,
  Clock,
  Stethoscope,
  CalendarDays,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import type { Appointment, AppointmentType, AppointmentStatus } from "@/types/appointment"
import type { Patient } from "@/types/patient"
import type { Staff } from "@/types/staff"

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">("all")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list")

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/appointments`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(
          data.map((a: any) => ({
            id: a.id ?? "",
            patientId: a.patientId ?? "",
            patientName: "",
            doctorId: a.staffId ?? "",
            doctorName: "",
            date: a.date ?? "",
            time: "",
            duration: 30,
            type: "consultation",
            status: "scheduled",
            department: "",
            reason: "",
            notes: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        )
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesSearch =
        appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
      const matchesType = typeFilter === "all" || appointment.type === typeFilter
      const matchesDate = !dateFilter || appointment.date === dateFilter

      return matchesSearch && matchesStatus && matchesType && matchesDate
    })
  }, [appointments, searchTerm, statusFilter, typeFilter, dateFilter])

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-emerald-100 text-emerald-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "no-show":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: AppointmentType) => {
    switch (type) {
      case "consultation":
        return "bg-purple-100 text-purple-800"
      case "follow-up":
        return "bg-teal-100 text-teal-800"
      case "surgery":
        return "bg-red-100 text-red-800"
      case "emergency":
        return "bg-orange-100 text-orange-800"
      case "checkup":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "no-show":
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const handleAddAppointment = async (
    newAppointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: newAppointment.patientId,
          staffId: newAppointment.doctorId,
          date: `${newAppointment.date}T${newAppointment.time}`,
        }),
      })
      if (res.ok) {
        await fetchAppointments()
        setIsAddDialogOpen(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    setAppointments(
      appointments.map((a) =>
        a.id === updatedAppointment.id ? { ...updatedAppointment, updatedAt: new Date().toISOString() } : a,
      ),
    )
    setSelectedAppointment(null)
  }

  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    setAppointments(
      appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a,
      ),
    )
  }

  const todaysAppointments = appointments.filter((apt) => apt.date === new Date().toISOString().split("T")[0])
  const upcomingAppointments = appointments.filter((apt) => new Date(apt.date) > new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appointment Management</h2>
          <p className="text-muted-foreground">Schedule and manage patient appointments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>Create a new appointment for a patient</DialogDescription>
              </DialogHeader>
              <AddAppointmentForm onSubmit={handleAddAppointment} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysAppointments.filter((a) => a.status === "confirmed").length} confirmed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysAppointments.filter((a) => a.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Finished appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">No-Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.filter((a) => a.status === "no-show").length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "list" | "calendar")}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments by patient, doctor, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AppointmentType | "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="checkup">Checkup</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-48" />
          </div>

          {/* Appointment Cards */}
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(appointment.status)}
                          <span className="font-semibold text-lg">{appointment.patientName}</span>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status.toUpperCase()}</Badge>
                        <Badge className={getTypeColor(appointment.type)}>{appointment.type.toUpperCase()}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span>{appointment.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {appointment.time} ({appointment.duration}min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Dept:</span>
                          <span>{appointment.department}</span>
                        </div>
                      </div>

                      {appointment.reason && (
                        <div className="text-sm">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      {appointment.status === "scheduled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, "confirmed")}
                        >
                          Confirm
                        </Button>
                      )}
                      {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No appointments found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <div className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p>Calendar view with appointment scheduling coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Appointment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>Complete appointment information</DialogDescription>
          </DialogHeader>
          {selectedAppointment && <AppointmentDetails appointment={selectedAppointment} />}
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={!!selectedAppointment && !isViewDialogOpen} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>Update appointment information</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <EditAppointmentForm
              appointment={selectedAppointment}
              onSubmit={handleUpdateAppointment}
              onCancel={() => setSelectedAppointment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddAppointmentForm({
  onSubmit,
}: { onSubmit: (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    date: "",
    time: "",
    duration: "30",
    type: "" as AppointmentType,
    status: "scheduled" as AppointmentStatus,
    department: "",
    reason: "",
    notes: "",
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Staff[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patRes, docRes] = await Promise.all([
          fetch(`${API_BASE}/patients`),
          fetch(`${API_BASE}/staff`),
        ])
        if (patRes.ok) {
          const pData = await patRes.json()
          setPatients(
            pData.map((p: any) => ({
              id: p.id ?? "",
              name: p.name ?? "",
              age: p.dateOfBirth
                ? new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
                : 0,
              gender: "other",
              contact: "",
              email: "",
              address: "",
              emergencyContact: "",
              status: "active",
              admissionDate: undefined,
              department: "",
              assignedDoctor: "",
              medicalHistory: [],
              allergies: [],
              bloodType: "",
              insurance: "",
            }))
          )
        }
        if (docRes.ok) {
          const allStaff: Staff[] = await docRes.json()
          setDoctors(
            allStaff
              .filter((s) => s.role === "doctor")
              .map((s: any) => ({
                id: s.id ?? "",
                name: s.name ?? "",
                email: "",
                phone: "",
                role: s.role ?? "doctor",
                department: "",
                specialization: undefined,
                licenseNumber: undefined,
                hireDate: new Date().toISOString(),
                status: "active",
                shift: undefined,
                address: "",
                emergencyContact: "",
                qualifications: [],
                experience: undefined,
                salary: undefined,
              }))
          )
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const durationValue = Number.parseInt(formData.duration)
    if (isNaN(durationValue) || durationValue < 5 || durationValue > 480) {
      alert("Please enter a valid duration between 5 and 480 minutes")
      return
    }

    if (
      !formData.patientId ||
      !formData.doctorId ||
      !formData.date ||
      !formData.time ||
      !formData.duration ||
      !formData.type ||
      !formData.status ||
      !formData.reason ||
      !formData.notes
    ) {
      alert("All fields are required")
      return
    }

    onSubmit({
      ...formData,
      duration: durationValue,
    })
  }

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    if (patient) {
      setFormData({ ...formData, patientId, patientName: patient.name })
    }
  }

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    if (doctor) {
      setFormData({ ...formData, doctorId, doctorName: doctor.name, department: doctor.department })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient">Patient *</Label>
          <Select value={formData.patientId} onValueChange={handlePatientSelect} required>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} ({patient.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctor">Doctor *</Label>
          <Select value={formData.doctorId} onValueChange={handleDoctorSelect} required>
            <SelectTrigger>
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (min) *</Label>
          <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Appointment Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as AppointmentType })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="checkup">Checkup</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as AppointmentStatus })}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Visit *</Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Brief description of the appointment purpose"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes *</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Additional notes or instructions"
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Schedule Appointment</Button>
      </div>
    </form>
  )
}

function EditAppointmentForm({
  appointment,
  onSubmit,
  onCancel,
}: {
  appointment: Appointment
  onSubmit: (appointment: Appointment) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    ...appointment,
    duration: appointment.duration.toString(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const durationValue = Number.parseInt(formData.duration)
    if (isNaN(durationValue) || durationValue < 5 || durationValue > 480) {
      alert("Please enter a valid duration between 5 and 480 minutes")
      return
    }

    onSubmit({
      ...formData,
      duration: durationValue,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as AppointmentStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Appointment</Button>
      </div>
    </form>
  )
}

function AppointmentDetails({ appointment }: { appointment: Appointment }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">APPOINTMENT INFORMATION</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">ID:</span>
                <span>{appointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(appointment.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Time:</span>
                <span>
                  {appointment.time} ({appointment.duration} min)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <Badge
                  className={`${
                    appointment.type === "surgery"
                      ? "bg-red-100 text-red-800"
                      : appointment.type === "emergency"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {appointment.type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  className={`${
                    appointment.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : appointment.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {appointment.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">PATIENT INFORMATION</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{appointment.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Patient ID:</span>
                <span>{appointment.patientId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">MEDICAL STAFF</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Doctor:</span>
                <span>{appointment.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Doctor ID:</span>
                <span>{appointment.doctorId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Department:</span>
                <span>{appointment.department}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">TIMESTAMPS</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(appointment.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Updated:</span>
                <span>{new Date(appointment.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {appointment.reason && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">REASON FOR VISIT</h3>
          <p className="mt-1 text-sm">{appointment.reason}</p>
        </div>
      )}

      {appointment.notes && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">NOTES</h3>
          <p className="mt-1 text-sm">{appointment.notes}</p>
        </div>
      )}
    </div>
  )
}
