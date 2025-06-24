/**
 * Appointment-related interfaces
 * Centralizes all appointment types for consistent usage throughout the application
 */

/**
 * Complete appointment details with all possible fields
 */
export interface AppointmentDetails {
  id: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  status: string;
  reason: string;
  paymentStatus: string;
  fee: number;
  patientId?: string;
  slotId?: string;
  physiotherapistId?: string;
  physiotherapistName?: string;
  patientName?: string;
}

/**
 * Basic appointment information typically used in list views
 */
export interface AppointmentBasic {
  id: string;
  appointmentDate: string;
  startTime: string;
  duration: number;
  status: string;
  paymentStatus: string;
  fee: number;
}

/**
 * Data required to create a new appointment
 */
export interface CreateAppointmentDto {
  appointmentDate: string;
  startTime: string;
  duration: number;
  reason: string;
  patientId: string;
  slotId: string;
  fee?: number;
}

/**
 * Data for updating an existing appointment
 */
export interface UpdateAppointmentDto {
  status?: string;
  paymentStatus?: string;
  reason?: string;
  appointmentDate?: string;
  startTime?: string;
  duration?: number;
}
