import { z } from 'zod'

const passwordSchema = z
	.string()
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
		'Password setidaknya memiliki 1 angka, 1 huruf kecil, 1 huruf besar dan memiliki panjang minimal 8 karakter'
	)
const register = z
	.object({
		first_name: z.string().min(3, 'Nama depan harus diisi'),
		last_name: z.string().optional(),
		email: z.string().email('Email tidak valid'),
		account_number: z
			.string()
			.length(11, 'No. Akun memiliki minimal 11 karakter'),
		username: z.string().min(6, 'Username memiliki minimal 6 karakter'),
		password: passwordSchema,
		password_confirmation: z.string().min(1, 'Konfirmasi password harus diisi')
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: 'Passwords tidak cocok dengan konfirmasi password',
		path: ['password_confirmation']
	})
const login = z.object({
	username: z.string(),
	password: passwordSchema
})
const refreshToken = z.object({
	refresh_token: z.string()
})

export type UserRegistration = z.infer<typeof register>
export type Login = z.infer<typeof login>
export { register, login, refreshToken }
