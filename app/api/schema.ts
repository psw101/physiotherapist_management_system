import z from 'zod'

const schema = z.object({
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

export default schema;