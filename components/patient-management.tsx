"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Plus, Edit, Eye, Phone, Mail, AlertCircle } from "lucide-react"
import type { Patient, PatientStatus } from "@/types/patient"
import { mockPatients } from "@/lib/patient-data"

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "all">("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact.includes(searchTerm)

      const matchesStatus = statusFilter === "all" || patient.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [patients, searchTerm, statusFilter])

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "admitted":
        return "bg-blue-100 text-blue-800"
      case "critical":
        return "bg-red-100 text-red-800"
      case "discharged":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddPatient = (newPatient: Omit<Patient, "id">) => {
    const patient: Patient = {
      ...newPatient,
      id: `P${String(patients.length + 1).padStart(3, "0")}`,
    }
    setPatients([...patients, patient])
    setIsAddDialogOpen(false)
  }

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)))
    setSelectedPatient(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Patient Management</h2>
          <p className="text-muted-foreground">Manage patient records and information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Enter patient information to create a new record</DialogDescription>
            </DialogHeader>
            <AddPatientForm onSubmit={handleAddPatient} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, ID, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PatientStatus | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="admitted">Admitted</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="discharged">Discharged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{patient.name}</CardTitle>
                  <CardDescription>ID: {patient.id}</CardDescription>
                </div>
                <Badge className={getStatusColor(patient.status)}>{patient.status.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Age:</span>
                  <span>{patient.age} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{patient.contact}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.department && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Dept:</span>
                    <span>{patient.department}</span>
                  </div>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span className="text-xs">Allergies: {patient.allergies.join(", ")}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(patient)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No patients found matching your criteria.</p>
        </div>
      )}

      {/* View Patient Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete patient information</DialogDescription>
          </DialogHeader>
          {selectedPatient && <PatientDetails patient={selectedPatient} />}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={!!selectedPatient && !isViewDialogOpen} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update patient information</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <EditPatientForm
              patient={selectedPatient}
              onSubmit={handleUpdatePatient}
              onCancel={() => setSelectedPatient(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddPatientForm({ onSubmit }: { onSubmit: (patient: Omit<Patient, "id">) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "" as Patient["gender"],
    contact: "",
    email: "",
    address: "",
    emergencyContact: "",
    status: "active" as PatientStatus,
    department: "",
    bloodType: "",
    allergies: "",
    insurance: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ageValue = Number.parseInt(formData.age)
    if (isNaN(ageValue) || ageValue < 0 || ageValue > 150) {
      alert("Please enter a valid age between 0 and 150")
      return
    }

    onSubmit({
      ...formData,
      age: ageValue,
      allergies: formData.allergies ? formData.allergies.split(",").map((a) => a.trim()) : [],
      admissionDate: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => setFormData({ ...formData, gender: value as Patient["gender"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact *</Label>
          <Input
            id="contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as PatientStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Input
            id="bloodType"
            value={formData.bloodType}
            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies (comma-separated)</Label>
          <Input
            id="allergies"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="e.g., Penicillin, Latex"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="insurance">Insurance</Label>
          <Input
            id="insurance"
            value={formData.insurance}
            onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Add Patient</Button>
      </div>
    </form>
  )
}

function EditPatientForm({
  patient,
  onSubmit,
  onCancel,
}: {
  patient: Patient
  onSubmit: (patient: Patient) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    ...patient,
    age: patient.age.toString(),
    allergies: patient.allergies?.join(", ") || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ageValue = Number.parseInt(formData.age)
    if (isNaN(ageValue) || ageValue < 0 || ageValue > 150) {
      alert("Please enter a valid age between 0 and 150")
      return
    }

    onSubmit({
      ...formData,
      age: ageValue,
      allergies: formData.allergies ? formData.allergies.split(",").map((a) => a.trim()) : [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact">Contact *</Label>
          <Input
            id="contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as PatientStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="admitted">Admitted</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies (comma-separated)</Label>
        <Input
          id="allergies"
          value={formData.allergies}
          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          placeholder="e.g., Penicillin, Latex"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Patient</Button>
      </div>
    </form>
  )
}

function PatientDetails({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">PERSONAL INFORMATION</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{patient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Age:</span>
                <span>{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Gender:</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Blood Type:</span>
                <span>{patient.bloodType || "Not specified"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">CONTACT INFORMATION</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{patient.contact}</span>
              </div>
              {patient.email && (
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              {patient.emergencyContact && (
                <div className="flex justify-between">
                  <span className="font-medium">Emergency:</span>
                  <span>{patient.emergencyContact}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">MEDICAL INFORMATION</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  className={`${
                    patient.status === "critical"
                      ? "bg-red-100 text-red-800"
                      : patient.status === "admitted"
                        ? "bg-blue-100 text-blue-800"
                        : patient.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {patient.status.toUpperCase()}
                </Badge>
              </div>
              {patient.department && (
                <div className="flex justify-between">
                  <span className="font-medium">Department:</span>
                  <span>{patient.department}</span>
                </div>
              )}
              {patient.assignedDoctor && (
                <div className="flex justify-between">
                  <span className="font-medium">Doctor:</span>
                  <span>{patient.assignedDoctor}</span>
                </div>
              )}
              {patient.admissionDate && (
                <div className="flex justify-between">
                  <span className="font-medium">Admission:</span>
                  <span>{new Date(patient.admissionDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {patient.allergies && patient.allergies.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground text-red-600">ALLERGIES</h3>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {patient.address && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">ADDRESS</h3>
          <p className="mt-1 text-sm">{patient.address}</p>
        </div>
      )}

      {patient.insurance && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">INSURANCE</h3>
          <p className="mt-1 text-sm">{patient.insurance}</p>
        </div>
      )}
    </div>
  )
}
