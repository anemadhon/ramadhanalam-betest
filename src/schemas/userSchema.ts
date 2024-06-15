import { z } from 'zod'

const update = z.object({
	first_name: z.string().min(3, 'Nama depan harus diisi'),
	last_name: z.string().optional(),
	email: z.preprocess(
		(value) => (value === '' || value === undefined ? undefined : value),
		z.string().email('Email tidak valid').optional()
	),
	user_id: z.string()
})
const remove = z.object({
	user_id: z.string()
})
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
const readByAccountNumber = z.object({
	account_number: z.string()
})
const readByRegistrationNumber = z.object({
	registration_number: z.string()
})

export type UserUpdate = z.infer<typeof update>
export type UserLists = z.infer<typeof lists>
export { update, remove, lists, readByAccountNumber, readByRegistrationNumber }
