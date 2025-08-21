export interface Patient {
  id: string
  name: string
  age: number
  gender: "male" | "female" | "other"
  contact: string
  email?: string
  address?: string
  emergencyContact?: string
  status: "active" | "discharged" | "admitted" | "critical"
  admissionDate?: string
  department?: string
  assignedDoctor?: string
  medicalHistory?: string[]
  allergies?: string[]
  bloodType?: string
  insurance?: string
}

export type PatientStatus = Patient["status"]
