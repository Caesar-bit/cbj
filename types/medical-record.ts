export interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  appointmentId?: string
  date: string
  type: "diagnosis" | "prescription" | "lab-result" | "imaging" | "surgery" | "consultation"
  title: string
  description: string
  diagnosis?: string
  symptoms?: string[]
  treatment?: string
  medications?: Medication[]
  labResults?: LabResult[]
  attachments?: string[]
  followUpRequired: boolean
  followUpDate?: string
  status: "active" | "resolved" | "ongoing" | "archived"
  createdAt: string
  updatedAt: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  prescribedDate: string
  status: "active" | "completed" | "discontinued"
}

export interface LabResult {
  testName: string
  result: string
  normalRange: string
  unit: string
  status: "normal" | "abnormal" | "critical"
  date: string
}

export type MedicalRecordType = MedicalRecord["type"]
export type MedicalRecordStatus = MedicalRecord["status"]
