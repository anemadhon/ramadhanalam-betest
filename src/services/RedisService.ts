import Redis from 'ioredis'
import { ENV } from '../utils/constants'

const { REDIS } = ENV

export default class RedisService {
	private redis: Redis

	constructor() {
		this.redis = new Redis()
	}

	async storeObject(key: string, obj: string): Promise<void> {
		await this.redis.set(key, obj)
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
		await this.redis.set(key, newData)
	}

	async deleteObject(key: string): Promise<void> {
		await this.redis.del(key)
	}

	async storeSetsMember(key: string, data: string): Promise<void> {
		await this.redis.sadd(key, data)
	}

	async checkSetsMember(key: string, data: string): Promise<number> {
		return await this.redis.sismember(key, data)
	}

	async getSetsMember(key: string): Promise<string[]> {
		return await this.redis.smembers(key)
	}
}
