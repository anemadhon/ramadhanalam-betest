import Redis from 'ioredis'
import { ENV } from '../../utils/constants'

const { REDIS } = ENV
const redisClient = async () => {
	const REDIS_PORT = REDIS.PORT ? parseInt(REDIS.PORT) : 6379
	const redis = new Redis({
		port: REDIS_PORT,
		host: REDIS.HOST,
		db: 0,
		maxRetriesPerRequest: 10,
		reconnectOnError: (err) => {
			const targetToReconnect = [
				'ECONNREFUSED',
				'ECONNRESET',
				'ETIMEDOUT',
				'CLUSTERDOWN',
				'BUSY',
				'READONLY'
			]

			return targetToReconnect.includes(err.message)
		},
		retryStrategy: (times) => {
			const delay = Math.pow(2, times) * 1000

			return delay
		}
	})

	return redis
}

export default redisClient
