import { init } from '@paralleldrive/cuid2'
import bcrypt from 'bcrypt'
import User, { UserInterface } from '../models/User'
import RedisService from './RedisService'
import UserRepository from '../repositories/UserRepository'
import { Login, UserRegistration } from '../schemas/authSchema'
import { ServicesResponse } from '../types/responseType'
import { ENV } from '../utils/constants'
import JwtService from './JwtService'
import AccountService from './AccountService'

const { REDIS } = ENV

export default class AuthService {
	private userRepository: UserRepository
	private redisService: RedisService
	private jwtService: JwtService
	private accountService: AccountService

	constructor() {
		this.userRepository = new UserRepository(User)
		this.redisService = new RedisService()
		this.jwtService = new JwtService()
		this.accountService = new AccountService()
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

		await this.redisService.storeObject(
			`${REDIS.NAME}:object_${createdUser.userId}`,
			JSON.stringify(createdUser)
		)
		await this.redisService.storeObject(
			`${REDIS.NAME}:${createdUser.accountNumber}`,
			JSON.stringify(createdUser)
		)
		await this.redisService.storeObject(
			`${REDIS.NAME}:${createdUser.registrationNumber}`,
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

	async login(payload: Login): Promise<
		ServicesResponse<
			| {
					user: UserInterface
					token: { access_token: string; refresh_token: string }
			  }
			| { message: string }
		>
	> {
		const user = await this.userRepository.findByUsername(payload.username)

		if (!user?.userId) {
			return {
				status: 404,
				data: {
					message: `Data (username: ${payload.username}) tidak ditemukan`
				}
			}
		}

		const passwordMatched = await bcrypt.compare(
			payload.password,
			user.password
		)

		if (!passwordMatched) {
			return {
				status: 400,
				data: {
					message: `Silakan masukan username & password yang benar`
				}
			}
		}

		const token = await this.jwtService.generateJWTToken(user.userId)

		await this.accountService.logAccount({
			...payload,
			userId: user.userId
		})

		return {
			status: 200,
			data: {
				user,
				token: token.data as {
					access_token: string
					refresh_token: string
				}
			}
		}
	}
}
