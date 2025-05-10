import z from 'zod'

const schema = z.object({
    productName: z.string().min(3),
})

export default schema;