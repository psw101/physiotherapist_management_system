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

// Export both schemas together
export { productSchema, patientSchema };