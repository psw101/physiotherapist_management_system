// Export all types from model files
export * from './product';
export * from './patient';
export * from './order';
export * from './navigation';
export * from './component-types';
export * from './appointment';

// Explicitly re-export key interfaces for better documentation and auto-completion
export type { 
  // Product interfaces
  Product, 
  BaseProduct,
  CreateProductDto,
  UpdateProductDto,
  Specification, 
  CustomOption 
} from './product';

export type {
  // Patient interfaces
  Patient
} from './patient';

export type {
  // Order interfaces
  Order,
  AdminOrder
} from './order';

export type {
  // Appointment interfaces
  AppointmentDetails,
  AppointmentBasic,
  CreateAppointmentDto,
  UpdateAppointmentDto
} from './appointment';

// Add other exports as needed
