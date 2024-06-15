import redisClient from './client'
import { ENV } from '../../utils/constants'

const { APP, REDIS } = ENV

const redisConnection = async () => {
	let attemptCount = 0
	const redis = await redisClient()

	redis.on('connect', () =>
		console.log(`services ${APP.NAME} connected to redis`)
	)
	redis.on('close', () =>
		console.log(`connection to redis closed on services ${APP.NAME}`)
	)
	redis.on('end', () =>
		console.log(`connection to redis ended on services ${APP.NAME}`)
	)
	redis.on('error', (err) => {
		console.error(
			`connection to redis encountered an error on services ${APP.NAME}`
		)
		console.error(err)
	})
	redis.on('reconnecting', (times: number) => {
		const attemptedAt = Math.log(times / 1000) / Math.log(2)
		attemptCount = attemptedAt

		if (attemptCount > parseInt(REDIS.MAX_ATTEMPT)) {
			console.error(
				`redis stopped after ${parseInt(REDIS.MAX_ATTEMPT)} try on services ${
					APP.NAME
				}`
			)
			redis.disconnect()
			process.exit(1)
		}

		console.error(
			`connection to redis failed on attempt #${attemptedAt} on services ${APP.NAME}`
		)
		console.error(`reconnecting to redis after ${times} ms`)
	})

	return redis
}

export default redisConnection
