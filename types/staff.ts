export interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: "doctor" | "nurse" | "admin" | "technician" | "pharmacist"
  department: string
  specialization?: string
  licenseNumber?: string
  hireDate: string
  status: "active" | "inactive" | "on-leave"
  shift?: "morning" | "afternoon" | "night" | "rotating"
  address?: string
  emergencyContact?: string
  qualifications?: string[]
  experience?: number // years
  salary?: number
}

export type StaffRole = Staff["role"]
export type StaffStatus = Staff["status"]
