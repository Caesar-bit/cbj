"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { API_BASE } from "@/lib/api"
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
import { Search, Plus, Edit, Eye, Phone, Mail, UserCheck, Clock, Award } from "lucide-react"
import type { Staff, StaffRole, StaffStatus } from "@/types/staff"
export function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all")
  const [statusFilter, setStatusFilter] = useState<StaffStatus | "all">("all")
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === "all" || member.role === roleFilter
      const matchesStatus = statusFilter === "all" || member.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [staff, searchTerm, roleFilter, statusFilter])

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`${API_BASE}/staff`)
        if (res.ok) {
          const data = await res.json()
          setStaff(
            data.map((s: any) => ({
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
    fetchStaff()
  }, [])

  const getRoleColor = (role: StaffRole) => {
    switch (role) {
      case "doctor":
        return "bg-blue-100 text-blue-800"
      case "nurse":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "technician":
        return "bg-orange-100 text-orange-800"
      case "pharmacist":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: StaffStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "on-leave":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddStaff = async (newStaff: Omit<Staff, "id">) => {
    try {
      const res = await fetch(`${API_BASE}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStaff.name, role: newStaff.role }),
      })
      if (res.ok) {
        const saved = await res.json()
        const staffMember: Staff = { ...newStaff, id: saved.id }
        setStaff([...staff, staffMember])
        setIsAddDialogOpen(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateStaff = (updatedStaff: Staff) => {
    setStaff(staff.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)))
    setSelectedStaff(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">Manage hospital staff and personnel records</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Enter staff information to create a new record</DialogDescription>
            </DialogHeader>
            <AddStaffForm onSubmit={handleAddStaff} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name, ID, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as StaffRole | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="nurse">Nurse</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="technician">Technician</SelectItem>
            <SelectItem value="pharmacist">Pharmacist</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StaffStatus | "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>ID: {member.id}</CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getRoleColor(member.role)}>{member.role.toUpperCase()}</Badge>
                  <Badge className={getStatusColor(member.status)}>{member.status.toUpperCase()}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Department:</span>
                  <span>{member.department}</span>
                </div>
                {member.specialization && (
                  <div className="flex items-center gap-2">
                    <Award className="h-3 w-3" />
                    <span className="truncate">{member.specialization}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.shift && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="capitalize">{member.shift} shift</span>
                  </div>
                )}
                {member.experience && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3 w-3" />
                    <span>{member.experience} years experience</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStaff(member)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedStaff(member)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No staff members found matching your criteria.</p>
        </div>
      )}

      {/* View Staff Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogDescription>Complete staff member information</DialogDescription>
          </DialogHeader>
          {selectedStaff && <StaffDetails staff={selectedStaff} />}
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={!!selectedStaff && !isViewDialogOpen} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff member information</DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <EditStaffForm staff={selectedStaff} onSubmit={handleUpdateStaff} onCancel={() => setSelectedStaff(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddStaffForm({ onSubmit }: { onSubmit: (staff: Omit<Staff, "id">) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "" as StaffRole,
    department: "",
    specialization: "",
    licenseNumber: "",
    hireDate: "",
    status: "active" as StaffStatus,
    shift: "" as Staff["shift"],
    address: "",
    emergencyContact: "",
    qualifications: "",
    experience: "",
    salary: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const experienceValue = formData.experience ? Number.parseInt(formData.experience) : undefined
    const salaryValue = formData.salary ? Number.parseInt(formData.salary) : undefined

    if (formData.experience && (isNaN(experienceValue!) || experienceValue! < 0 || experienceValue! > 70)) {
      alert("Please enter a valid experience between 0 and 70 years")
      return
    }

    if (formData.salary && (isNaN(salaryValue!) || salaryValue! < 0)) {
      alert("Please enter a valid salary amount")
      return
    }

    onSubmit({
      ...formData,
      experience: experienceValue,
      salary: salaryValue,
      qualifications: formData.qualifications ? formData.qualifications.split(",").map((q) => q.trim()) : [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
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
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as StaffRole })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="nurse">Nurse</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="pharmacist">Pharmacist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hireDate">Hire Date *</Label>
          <Input
            id="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as StaffStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shift">Shift</Label>
          <Select
            value={formData.shift || ""}
            onValueChange={(value) => setFormData({ ...formData, shift: value as Staff["shift"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="night">Night</SelectItem>
              <SelectItem value="rotating">Rotating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Experience (years)</Label>
          <Input
            id="experience"
            type="number"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Salary</Label>
          <Input
            id="salary"
            type="number"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
        <Input
          id="qualifications"
          value={formData.qualifications}
          onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
          placeholder="e.g., MD, Board Certified, Fellowship"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">Add Staff Member</Button>
      </div>
    </form>
  )
}

function EditStaffForm({
  staff,
  onSubmit,
  onCancel,
}: {
  staff: Staff
  onSubmit: (staff: Staff) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    ...staff,
    experience: staff.experience?.toString() || "",
    salary: staff.salary?.toString() || "",
    qualifications: staff.qualifications?.join(", ") || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const experienceValue = formData.experience ? Number.parseInt(formData.experience) : undefined
    const salaryValue = formData.salary ? Number.parseInt(formData.salary) : undefined

    if (formData.experience && (isNaN(experienceValue!) || experienceValue! < 0 || experienceValue! > 70)) {
      alert("Please enter a valid experience between 0 and 70 years")
      return
    }

    if (formData.salary && (isNaN(salaryValue!) || salaryValue! < 0)) {
      alert("Please enter a valid salary amount")
      return
    }

    onSubmit({
      ...formData,
      experience: experienceValue,
      salary: salaryValue,
      qualifications: formData.qualifications ? formData.qualifications.split(",").map((q) => q.trim()) : [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
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
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as StaffStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
        <Input
          id="qualifications"
          value={formData.qualifications}
          onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
          placeholder="e.g., MD, Board Certified, Fellowship"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Staff Member</Button>
      </div>
    </form>
  )
}

function StaffDetails({ staff }: { staff: Staff }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">PERSONAL INFORMATION</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{staff.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ID:</span>
                <span>{staff.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span className="truncate">{staff.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{staff.phone}</span>
              </div>
              {staff.emergencyContact && (
                <div className="flex justify-between">
                  <span className="font-medium">Emergency:</span>
                  <span>{staff.emergencyContact}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">EMPLOYMENT DETAILS</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <Badge
                  className={`${
                    staff.role === "doctor"
                      ? "bg-blue-100 text-blue-800"
                      : staff.role === "nurse"
                        ? "bg-green-100 text-green-800"
                        : staff.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {staff.role.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <Badge
                  className={`${
                    staff.status === "active"
                      ? "bg-green-100 text-green-800"
                      : staff.status === "on-leave"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {staff.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Department:</span>
                <span>{staff.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Hire Date:</span>
                <span>{new Date(staff.hireDate).toLocaleDateString()}</span>
              </div>
              {staff.shift && (
                <div className="flex justify-between">
                  <span className="font-medium">Shift:</span>
                  <span className="capitalize">{staff.shift}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground">PROFESSIONAL DETAILS</h3>
            <div className="mt-2 space-y-2">
              {staff.specialization && (
                <div className="flex justify-between">
                  <span className="font-medium">Specialization:</span>
                  <span>{staff.specialization}</span>
                </div>
              )}
              {staff.licenseNumber && (
                <div className="flex justify-between">
                  <span className="font-medium">License:</span>
                  <span>{staff.licenseNumber}</span>
                </div>
              )}
              {staff.experience && (
                <div className="flex justify-between">
                  <span className="font-medium">Experience:</span>
                  <span>{staff.experience} years</span>
                </div>
              )}
              {staff.salary && (
                <div className="flex justify-between">
                  <span className="font-medium">Salary:</span>
                  <span>${staff.salary.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {staff.qualifications && staff.qualifications.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground">QUALIFICATIONS</h3>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {staff.qualifications.map((qualification, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {qualification}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {staff.address && (
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground">ADDRESS</h3>
          <p className="mt-1 text-sm">{staff.address}</p>
        </div>
      )}
    </div>
  )
}
