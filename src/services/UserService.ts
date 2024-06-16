import Account from '../models/Account'
import User, { UserInterface } from '../models/User'
import AccountRepository from '../repositories/AccountRepository'
import UserRepository, { QueryType } from '../repositories/UserRepository'
import { UserUpdate } from '../schemas/userSchema'
import RedisService from '../services/RedisService'
import { ServicesResponse } from '../types/responseType'
import { ENV } from '../utils/constants'

const { REDIS } = ENV

export default class UserService {
	private userRepository: UserRepository
	private accountRepository: AccountRepository
	private redisService: RedisService

	constructor() {
		this.userRepository = new UserRepository(User)
		this.accountRepository = new AccountRepository(Account)
		this.redisService = new RedisService()
	}

	async getData(
		query: QueryType
	): Promise<ServicesResponse<UserInterface[] | Record<string, string>[]>> {
		const usersArrayOfObj = await this.redisService.getArrayOfObjects()

		if (usersArrayOfObj.length) {
			return {
				status: 200,
				data: usersArrayOfObj
			}
		}

		return { status: 200, data: await this.userRepository.findAll(query) }
	}

	async getDataByAccountNumber(
		accountNumber: string
	): Promise<ServicesResponse<UserInterface | Record<string, string>>> {
		const redisObj = await this.redisService.getObject(
			`${REDIS.NAME}:${accountNumber}`
		)

		if (redisObj?.userId) {
			return {
				status: 200,
				data: redisObj
			}
		}

		const user = await this.userRepository.findByAccountNumber(accountNumber)

		return {
			status: user ? 200 : 404,
			data: user
		}
	}

	async getDataByRegistrationNumber(
		registrationNumber: string
	): Promise<ServicesResponse<UserInterface | Record<string, string>>> {
		const redisObj = await this.redisService.getObject(
			`${REDIS.NAME}:${registrationNumber}`
		)

		if (redisObj?.userId) {
			return {
				status: 200,
				data: redisObj
			}
		}

		const user = await this.userRepository.findByRegistrationNumber(
			registrationNumber
		)

		return {
			status: user ? 200 : 404,
			data: user
		}
	}

	async updateData(
		payload: UserUpdate
	): Promise<ServicesResponse<UserInterface>> {
		const fullName = payload.last_name
			? `${payload.first_name} ${payload.last_name}`
			: payload.first_name
		const validPayload = {
			fullName: fullName,
			emailAddress: payload.email
		}
		const updated = await this.userRepository.update(
			{ userId: payload.user_id as string },
			validPayload
		)

		if (updated) {
			await this.redisService.updateObject(
				`${REDIS.NAME}:object_${updated.userId}`,
				JSON.stringify(updated)
			)
			await this.redisService.updateObject(
				`${REDIS.NAME}:${updated.accountNumber}`,
				JSON.stringify(updated)
			)
			await this.redisService.updateObject(
				`${REDIS.NAME}:${updated.registrationNumber}`,
				JSON.stringify(updated)
			)
		}

		return {
			status: updated ? 200 : 404,
			data: updated
		}
	}

	async deleteData(id: string): Promise<ServicesResponse<{ message: string }>> {
		const user = await this.userRepository.findById(id)

		if (!user) {
			return {
				status: 404,
				data: {
					message: 'User tidak ditemukan'
				}
			}
		}

		const deleted = await this.userRepository.delete(user.userId)

		if (!deleted.deletedCount) {
			return {
				status: 500,
				data: {
					message: 'Gagal hapus data'
				}
			}
		}

		await this.accountRepository.delete(user.userId)
		await this.redisService.deleteObject(`${REDIS.NAME}:object_${user.userId}`)
		await this.redisService.deleteObject(`${REDIS.NAME}:${user.accountNumber}`)
		await this.redisService.deleteObject(
			`${REDIS.NAME}:${user.registrationNumber}`
		)
		await this.redisService.deleteObject(`${REDIS.NAME}:token_${user.userId}`)

		return {
			status: 200,
			data: {
				message: 'Berhasil hapus data'
			}
		}
	}
}
