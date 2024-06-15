import { z } from 'zod'

const searchSchema = z.object({
	key: z.string(),
	value: z.string()
})
const orderSchema = z.object({
	key: z.string(),
	value: z.string()
})
const lists = z.object({
	offset: z.string(),
	limit: z.string(),
	search: searchSchema,
	order: orderSchema
})

export type AccountList = z.infer<typeof lists>
export { lists }
