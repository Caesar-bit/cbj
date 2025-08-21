export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  duration: number // minutes
  type: "consultation" | "follow-up" | "surgery" | "emergency" | "checkup"
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"
  department: string
  reason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export type AppointmentType = Appointment["type"]
export type AppointmentStatus = Appointment["status"]
