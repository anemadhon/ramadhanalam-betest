import { init } from '@paralleldrive/cuid2'
import bcrypt from 'bcrypt'
import User, { UserInterface } from '../models/User'
import RedisService from './RedisService'
import UserRepository from '../repositories/UserRepository'
import { UserRegistration } from '../schemas/authSchema'
import { ServicesResponse } from '../types/responseType'

export default class AuthService {
	private userRepository: UserRepository
	private redis

	constructor() {
		this.userRepository = new UserRepository(User)
		this.redis = new RedisService()
	}

	async registration(
		payload: UserRegistration
	): Promise<
		ServicesResponse<
			Pick<UserInterface, 'userId' | 'registrationNumber'> | { message: string }
		>
	> {
		const userByUsername = await this.userRepository.findByUsername(
			payload.username
		)

		if (userByUsername?.userId) {
			return {
				status: 400,
				data: {
					message: `Data (username: ${payload.username}) sudah terdaftar`
				}
			}
		}

		const userByEmail = await this.userRepository.findByEmail(payload.email)

		if (userByEmail?.userId) {
			return {
				status: 400,
				data: {
					message: `Data (email: ${payload.email}) sudah terdaftar`
				}
			}
		}

		const userByAccountNumber = await this.userRepository.findByAccountNumber(
			payload.account_number
		)

		if (userByAccountNumber?.userId) {
			return {
				status: 400,
				data: {
					message: `Data (nomor akun: ${payload.account_number}) sudah terdaftar`
				}
			}
		}

		const cuidUserId = init({ length: 12 })
		const userId = cuidUserId()
		const cuidRegistrationNumber = init({ length: 11 })
		const registrationNumber = cuidRegistrationNumber()
		const salt = await bcrypt.genSalt(10)
		const passwordEncrypted = await bcrypt.hash(payload.password, salt)
		const fullName = payload.last_name
			? `${payload.first_name} ${payload.last_name}`
			: payload.first_name
		const createdUser = await this.userRepository.registerUser({
			...payload,
			password: passwordEncrypted,
			registrationNumber,
			userId,
			fullName
		})

		await this.redis.storeObject(
			createdUser.userId,
			JSON.stringify(createdUser)
		)
		await this.redis.storeObject(
			createdUser.accountNumber,
			JSON.stringify(createdUser)
		)
		await this.redis.storeObject(
			createdUser.registrationNumber,
			JSON.stringify(createdUser)
		)

		return {
			status: 200,
			data: {
				userId: createdUser.userId,
				registrationNumber: createdUser.registrationNumber
			}
		}
	}

	async checkUsername(username: string) {
		const checkingData = await this.userRepository.findByUsername(username)

		if (!checkingData) {
			return {
				status: 404,
				data: {
					message: `Data (username: ${username}) tidak ditemukan`
				}
			}
		}

		return {
			status: 200,
			data: checkingData
		}
	}
}
