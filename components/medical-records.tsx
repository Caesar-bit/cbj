"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  Pill,
  Activity,
  Calendar,
  User,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import type { MedicalRecord, MedicalRecordType, MedicalRecordStatus, Medication } from "@/types/medical-record"
import type { Patient } from "@/types/patient"
import type { Staff } from "@/types/staff"

export function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<MedicalRecordType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<MedicalRecordStatus | "all">("all")
  const [patientFilter, setPatientFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"records" | "prescriptions">("records")

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === "all" || record.type === typeFilter
      const matchesStatus = statusFilter === "all" || record.status === statusFilter
      const matchesPatient = patientFilter === "all" || record.patientId === patientFilter

      return matchesSearch && matchesType && matchesStatus && matchesPatient
    })
  }, [records, searchTerm, typeFilter, statusFilter, patientFilter])

  const activePrescriptions = useMemo(() => {
    const allMedications: (Medication & { recordId: string; patientName: string; doctorName: string })[] = []
    records.forEach((record) => {
      if (record.medications) {
        record.medications.forEach((med) => {
          if (med.status === "active") {
            allMedications.push({
              ...med,
              recordId: record.id,
              patientName: record.patientName,
              doctorName: record.doctorName,
            })
          }
        })
      }
    })
    return allMedications
  }, [records])

  const getTypeColor = (type: MedicalRecordType) => {
    switch (type) {
      case "diagnosis":
        return "bg-blue-100 text-blue-800"
      case "prescription":
        return "bg-green-100 text-green-800"
      case "lab-result":
        return "bg-purple-100 text-purple-800"
      case "imaging":
        return "bg-orange-100 text-orange-800"
      case "surgery":
        return "bg-red-100 text-red-800"
      case "consultation":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: MedicalRecordStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "resolved":
        return "bg-emerald-100 text-emerald-800"
      case "ongoing":
        return "bg-blue-100 text-blue-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: MedicalRecordType) => {
    switch (type) {
      case "diagnosis":
        return <Stethoscope className="h-4 w-4" />
      case "prescription":
        return <Pill className="h-4 w-4" />
      case "lab-result":
        return <Activity className="h-4 w-4" />
      case "imaging":
        return <FileText className="h-4 w-4" />
      case "surgery":
        return <AlertTriangle className="h-4 w-4" />
      case "consultation":
        return <User className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleAddRecord = (newRecord: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">) => {
    const record: MedicalRecord = {
      ...newRecord,
      id: `MR${String(records.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRecords([...records, record])
    setIsAddDialogOpen(false)
  }

  const handleUpdateRecord = (updatedRecord: MedicalRecord) => {
    setRecords(
      records.map((r) => (r.id === updatedRecord.id ? { ...updatedRecord, updatedAt: new Date().toISOString() } : r)),
    )
    setSelectedRecord(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medical Records</h2>
          <p className="text-muted-foreground">Manage patient medical records and prescriptions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Medical Record</DialogTitle>
              <DialogDescription>Create a new medical record for a patient</DialogDescription>
            </DialogHeader>
            <AddMedicalRecordForm onSubmit={handleAddRecord} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">All medical records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.filter((r) => r.status === "ongoing").length}</div>
            <p className="text-xs text-muted-foreground">Ongoing treatments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePrescriptions.length}</div>
            <p className="text-xs text-muted-foreground">Current medications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Follow-ups Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter((r) => r.followUpRequired && r.followUpDate).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled follow-ups</p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "records" | "prescriptions")}>
        <TabsList>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="prescriptions">Active Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records by title, patient, doctor, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as MedicalRecordType | "all")}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="diagnosis">Diagnosis</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="lab-result">Lab Result</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as MedicalRecordStatus | "all")}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={patientFilter} onValueChange={setPatientFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medical Records */}
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(record.type)}
                          <span className="font-semibold text-lg">{record.title}</span>
                        </div>
                        <Badge className={getTypeColor(record.type)}>{record.type.toUpperCase()}</Badge>
                        <Badge className={getStatusColor(record.status)}>{record.status.toUpperCase()}</Badge>
                        {record.followUpRequired && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            Follow-up Due
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{record.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span>{record.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">ID:</span>
                          <span>{record.id}</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="text-muted-foreground">{record.description}</p>
                        {record.diagnosis && (
                          <p className="mt-1">
                            <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                          </p>
                        )}
                      </div>

                      {record.medications && record.medications.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {record.medications.slice(0, 3).map((med, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Pill className="h-3 w-3 mr-1" />
                              {med.name}
                            </Badge>
                          ))}
                          {record.medications.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{record.medications.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No medical records found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePrescriptions.map((prescription, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{prescription.name}</CardTitle>
                  </div>
                  <CardDescription>{prescription.patientName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Dosage:</span>
                      <span>{prescription.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Frequency:</span>
                      <span>{prescription.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Duration:</span>
                      <span>{prescription.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Prescribed by:</span>
                      <span>{prescription.doctorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Date:</span>
                      <span>{new Date(prescription.prescribedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      <span className="font-medium">Instructions:</span> {prescription.instructions}
                    </div>
                  )}
                  <Badge className="w-fit">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {prescription.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {activePrescriptions.length === 0 && (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No active prescriptions found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>Complete medical record information</DialogDescription>
          </DialogHeader>
          {selectedRecord && <MedicalRecordDetails record={selectedRecord} />}
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={!!selectedRecord && !isViewDialogOpen} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Medical Record</DialogTitle>
            <DialogDescription>Update medical record information</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <EditMedicalRecordForm
              record={selectedRecord}
              onSubmit={handleUpdateRecord}
              onCancel={() => setSelectedRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddMedicalRecordForm({
  onSubmit,
}: { onSubmit: (record: Omit<MedicalRecord, "id" | "createdAt" | "updatedAt">) => void }) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    appointmentId: "",
    date: new Date().toISOString().split("T")[0],
    type: "diagnosis" as MedicalRecordType,
    title: "",
    description: "",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    followUpRequired: false,
    followUpDate: "",
    status: "active" as MedicalRecordStatus,
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Staff[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, patRes, docRes] = await Promise.all([
          fetch("http://localhost:5000/api/records"),
          fetch("http://localhost:5000/api/patients"),
          fetch("http://localhost:5000/api/staff"),
        ])
        if (recRes.ok) setRecords(await recRes.json())
        if (patRes.ok) setPatients(await patRes.json())
        if (docRes.ok) {
          const allStaff: Staff[] = await docRes.json()
          setDoctors(allStaff.filter((s) => s.role === "doctor"))
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      symptoms: formData.symptoms ? formData.symptoms.split(",").map((s) => s.trim()) : [],
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
      setFormData({ ...formData, doctorId, doctorName: doctor.name })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient">Patient *</Label>
          <Select value={formData.patientId} onValueChange={handlePatientSelect}>
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
          <Select value={formData.doctorId} onValueChange={handleDoctorSelect}>
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
          <Label htmlFor="type">Record Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as MedicalRecordType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diagnosis">Diagnosis</SelectItem>
              <SelectItem value="prescription">Prescription</SelectItem>
              <SelectItem value="lab-result">Lab Result</SelectItem>
              <SelectItem value="imaging">Imaging</SelectItem>
              <SelectItem value="surgery">Surgery</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as MedicalRecordStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Brief title for the medical record"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Detailed description of the medical record"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Input
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            placeholder="Medical diagnosis"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
          <Input
            id="symptoms"
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            placeholder="e.g., Fever, Headache, Nausea"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">Treatment Plan</Label>
        <Textarea
          id="treatment"
          value={formData.treatment}
          onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
          rows={2}
          placeholder="Treatment plan and recommendations"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="followUpRequired"
            checked={formData.followUpRequired}
            onChange={(e) => setFormData({ ...formData, followUpRequired: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor="followUpRequired">Follow-up Required</Label>
        </div>
        {formData.followUpRequired && (
          <div className="space-y-2">
            <Label htmlFor="followUpDate">Follow-up Date</Label>
            <Input
              id="followUpDate"
              type="date"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Add Medical Record</Button>
      </div>
    </form>
  )
}

function EditMedicalRecordForm({
  record,
  onSubmit,
  onCancel,
}: {
  record: MedicalRecord
  onSubmit: (record: MedicalRecord) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    ...record,
    symptoms: record.symptoms?.join(", ") || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      symptoms: formData.symptoms ? formData.symptoms.split(",").map((s) => s.trim()) : [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as MedicalRecordStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosis">Diagnosis</Label>
        <Input
          id="diagnosis"
          value={formData.diagnosis || ""}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="treatment">Treatment Plan</Label>
        <Textarea
          id="treatment"
          value={formData.treatment || ""}
          onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Record</Button>
      </div>
    </form>
  )
}

function MedicalRecordDetails({ record }: { record: MedicalRecord }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">RECORD INFORMATION</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">ID:</span>
                <span>{record.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>
                <Badge
                  className={`${
                    record.type === "diagnosis"
                      ? "bg-blue-100 text-blue-800"
                      : record.type === "prescription"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {record.type.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  className={`${
                    record.status === "active"
                      ? "bg-green-100 text-green-800"
                      : record.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {record.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Date:</span>
                <span>{new Date(record.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">PATIENT & DOCTOR</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Patient:</span>
                <span>{record.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Doctor:</span>
                <span>{record.doctorName}</span>
              </div>
              {record.appointmentId && (
                <div className="flex justify-between">
                  <span className="font-medium">Appointment:</span>
                  <span>{record.appointmentId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">MEDICAL DETAILS</h3>
            <div className="mt-2 space-y-2">
              {record.diagnosis && (
                <div>
                  <span className="font-medium">Diagnosis:</span>
                  <p className="text-sm mt-1">{record.diagnosis}</p>
                </div>
              )}
              {record.symptoms && record.symptoms.length > 0 && (
                <div>
                  <span className="font-medium">Symptoms:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {record.followUpRequired && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">FOLLOW-UP</h3>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">
                    {record.followUpDate
                      ? `Due: ${new Date(record.followUpDate).toLocaleDateString()}`
                      : "Follow-up required"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-muted-foreground">DESCRIPTION</h3>
        <p className="mt-1 text-sm">{record.description}</p>
      </div>

      {record.treatment && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">TREATMENT PLAN</h3>
          <p className="mt-1 text-sm">{record.treatment}</p>
        </div>
      )}

      {record.medications && record.medications.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">MEDICATIONS</h3>
          <div className="mt-2 space-y-3">
            {record.medications.map((med, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{med.name}</span>
                  <Badge
                    className={`${
                      med.status === "active"
                        ? "bg-green-100 text-green-800"
                        : med.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {med.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Dosage:</span> {med.dosage}
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span> {med.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {med.duration}
                  </div>
                  <div>
                    <span className="font-medium">Prescribed:</span> {new Date(med.prescribedDate).toLocaleDateString()}
                  </div>
                </div>
                {med.instructions && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">Instructions:</span> {med.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {record.labResults && record.labResults.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">LAB RESULTS</h3>
          <div className="mt-2 space-y-2">
            {record.labResults.map((lab, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{lab.testName}</span>
                  <Badge
                    className={`${
                      lab.status === "normal"
                        ? "bg-green-100 text-green-800"
                        : lab.status === "abnormal"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {lab.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Result:</span> {lab.result} {lab.unit}
                  </div>
                  <div>
                    <span className="font-medium">Normal Range:</span> {lab.normalRange} {lab.unit}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(lab.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
