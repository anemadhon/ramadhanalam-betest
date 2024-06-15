import Redis from 'ioredis'
import { UserInterface } from '../models/User'
import { ENV } from '../utils/constants'

const { REDIS } = ENV

export default class RedisService {
	private redis: Redis

	constructor() {
		this.redis = new Redis()
	}

	async storeObject(key: string, obj: string): Promise<void> {
		const newKey =
			key.length === 12 ? `${REDIS.NAME}:object_${key}` : `${REDIS.NAME}:${key}`

		await this.redis.set(newKey, obj)
	}

	async getObject(key: string): Promise<Record<string, string> | null> {
		const obj = await this.redis.get(key)

		if (!obj) {
			return null
		}

		return JSON.parse(obj)
	}

	async getArrayOfObjects(): Promise<Record<string, string>[]> {
		const arrayOfObjects: Record<string, string>[] = []
		const keys = await this.redis.keys(`${REDIS.NAME}:object_*`)

		for (const key of keys) {
			const obj = await this.redis.get(key)

			if (obj) {
				arrayOfObjects.push(JSON.parse(obj))
			}
		}

		return arrayOfObjects
	}

	async updateObject(key: string, newData: string): Promise<void> {
		const newKey = `${REDIS.NAME}:object_${key}`

		await this.redis.set(newKey, newData)
	}

	async deleteObject(key: string): Promise<void> {
		const newKey = `${REDIS.NAME}:object_${key}`

		await this.redis.del(newKey)
	}
}
