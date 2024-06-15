import Redis from 'ioredis'
import { UserInterface } from '../models/User'
import { ENV } from '../utils/constants'

const { REDIS } = ENV

export default class RedisService {
	private redis: Redis

	constructor() {
		this.redis = new Redis()
	}

	async storeObject(key: string, obj: UserInterface): Promise<void> {
		const newKey =
			key.length === 12 ? `${REDIS.NAME}:object_${key}` : `${REDIS.NAME}:${key}`

		await this.redis.hmset(newKey, obj)
	}

	async getObject(key: string): Promise<Record<string, string> | null> {
		return await this.redis.hgetall(key)
	}

	async getArrayOfObjects(): Promise<Record<string, string>[]> {
		const arrayOfObjects: Record<string, string>[] = []
		const keys = await this.redis.keys(`${REDIS.NAME}:object_*`)

		for (const key of keys) {
			const obj = await this.redis.hgetall(key)

			arrayOfObjects.push(obj)
		}

		return arrayOfObjects
	}

	async updateObject(key: string, newData: UserInterface): Promise<void> {
		const newKey = `${REDIS.NAME}:object_${key}`

		await this.redis.hmset(newKey, newData)
	}

	async deleteObject(key: string): Promise<void> {
		const newKey = `${REDIS.NAME}:object_${key}`

		await this.redis.del(newKey)
	}
}
