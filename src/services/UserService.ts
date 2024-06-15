import User, { UserInterface } from '../models/User'
import UserRepository, { QueryType } from '../repositories/UserRepository'
import { UserUpdate } from '../schemas/userSchema'
import RedisService from '../services/RedisService'
import { ServicesResponse } from '../types/responseType'
import { ENV } from '../utils/constants'

const { REDIS } = ENV

export default class UserService {
	private userRepository: UserRepository
	private redis

	constructor() {
		this.userRepository = new UserRepository(User)
		this.redis = new RedisService()
	}

	async getData(
		query: QueryType
	): Promise<ServicesResponse<UserInterface[] | Record<string, string>[]>> {
		const usersArrayOfObj = await this.redis.getArrayOfObjects()

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
		const redisObj = await this.redis.getObject(accountNumber)

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
		const redisObj = await this.redis.getObject(registrationNumber)

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
			await this.redis.updateObject(
				`${REDIS.NAME}:object_${updated.userId}`,
				JSON.stringify(updated)
			)
			await this.redis.updateObject(
				`${REDIS.NAME}:${updated.accountNumber}`,
				JSON.stringify(updated)
			)
			await this.redis.updateObject(
				`${REDIS.NAME}:${updated.registrationNumber}`,
				JSON.stringify(updated)
			)
		}

		return {
			status: updated ? 200 : 404,
			data: updated
		}
	}

	async deleteData(
		id: string
	): Promise<ServicesResponse<{ deletedCount?: number }>> {
		const user = await this.userRepository.findById(id)
		const deleted = await this.userRepository.delete(id)

		if (deleted && user) {
			await this.redis.deleteObject(`${REDIS.NAME}:object_${id}`)
			await this.redis.deleteObject(`${REDIS.NAME}:${user.accountNumber}`)
			await this.redis.deleteObject(`${REDIS.NAME}:${user.registrationNumber}`)
		}

		return {
			status: deleted ? 200 : 404,
			data: deleted
		}
	}
}
