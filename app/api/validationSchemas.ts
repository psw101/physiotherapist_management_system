import z from 'zod'

const productSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.number().min(1, { message: "Price is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    specification: z.array(
        z.object({
            key: z.string().min(1, { message: "Key is required" }),
            value: z.string().min(1, { message: "Value is required" }),
        })
    ),
    imageUrl: z.string().min(1, { message: "Image is required" }),
    videoUrl: z.string().min(1, { message: "Video is required" }),
});

const patientSchema = z.object({
    name: z.string().min(1, { message: "Full name is required" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    age: z.number()
        .int({ message: "Age must be a whole number" })
        .positive({ message: "Age must be positive" })
        .max(120, { message: "Invalid age" }),
    contactNumber: z.string()
        .min(10, { message: "Contact number is too short" })
        .max(15, { message: "Contact number is too long" })
        .regex(/^[0-9+\-\s()]+$/, { message: "Invalid contact number format" }),
    email: z.string()
        .email({ message: "Invalid email address" }),
    area: z.string()
        .min(1, { message: "Area is required" }),
    nic: z.string()
        .min(1, { message: "NIC/Passport number is required" }),
    address: z.string()
        .min(5, { message: "Please provide a complete address" }),
});

// Updated Appointment validation schema
const appointmentSchema = z.object({
    patientId: z.number({
        required_error: "Patient is required",
        invalid_type_error: "Patient ID must be a number"
    }),
    
    // Only one of physiotherapistId or serviceId is required - made consistent with schema
    physiotherapistId: z.number().optional(),
    serviceId: z.number().optional(),
    
    appointmentDate: z.string()
        .min(1, { message: "Appointment date is required" })
        .refine(date => !isNaN(Date.parse(`${date}T00:00:00`)), { 
            message: "Invalid date format, use YYYY-MM-DD" 
        })
        .refine(date => {
            // Compare only the date part, ignoring time
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointmentDate = new Date(date);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate >= today;
        }, { 
            message: "Appointment date cannot be in the past" 
        }),
    
    startTime: z.string()
        .min(1, { message: "Start time is required" })
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
            message: "Time must be in HH:MM format" 
        }),
    
    duration: z.number({
        required_error: "Duration is required",
        invalid_type_error: "Duration must be a number"
    })
    .int({ message: "Duration must be a whole number" })
    .min(15, { message: "Appointment must be at least 15 minutes" })
    .max(180, { message: "Appointment cannot exceed 3 hours" }),
    
    status: z.enum(["scheduled", "completed", "cancelled", "no-show"])
        .default("scheduled"),
    
    notes: z.string()
        .max(500, { message: "Notes cannot exceed 500 characters" })
        .optional()
        .nullable()
        .transform(val => val === null || val === undefined ? "" : val),
    
    reason: z.string()
        .min(3, { message: "Please provide a brief reason for the appointment" })
        .max(200, { message: "Reason cannot exceed 200 characters" }),
    
    paymentStatus: z.enum(["unpaid", "partially_paid", "paid"])
        .default("unpaid"),
    
    paymentAmount: z.number()
        .optional()
        .nullable()
        .default(0)
        .transform(val => val === null || val === undefined ? 0 : val)
}).refine(data => data.physiotherapistId || data.serviceId, {
    message: "Either a physiotherapist or a service must be selected",
    path: ["physiotherapistId"],
});

// Export all schemas together
export { productSchema, patientSchema, appointmentSchema };