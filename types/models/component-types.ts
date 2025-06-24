import { Patient, Product, Specification, CustomOption, AppointmentBasic } from './index';

// Media and Upload related interfaces
export interface CloudinaryResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
}

export interface MediaUploaderProps {
  mediaType: "image" | "video" | "any"; 
  setUrl: (url: string) => void;
  setPublicId?: (id: string) => void;
}

export interface ImageUploaderProps {
  onChange: (file: File | null) => void;
  acceptedFileTypes: string;
  maxSizeMB: number;
}

// Component props interfaces
export interface TableProps {
  patients: Patient[];
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
}

export interface EditPatientProps {
  patients: Patient[];
  selectedPatient: Patient;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SpecificationAdderProps {
  initialSpecs?: Specification[];
  onChange: (specs: Specification[]) => void;
  className?: string;
}

export interface CustomizationOptionsAdderProps {
  initialOptions: CustomOption[] | null | undefined;
  onChange: (options: CustomOption[]) => void;
}

export interface PaymentFormProps {
  amount: number;
  onSubmit: (paymentDetails: PaymentDetails) => Promise<void>;
  processing: boolean;
  error?: string;
}

export interface PaymentDetails {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

// Email template props
export interface OTPTemplateProps {
  name: string;
  otp: string;
}

// Simple CloudinaryResult for upload page
export interface SimpleCloudinaryResult {
  public_id: string;
}

export interface AppointmentCardProps {
  appointment: AppointmentBasic;
  onCancel?: (id: string) => void;
  isCancelling?: boolean;
}
