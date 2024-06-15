import mongoose from 'mongoose'
import { ENV } from '../utils/constants'

const { APP, MONGO } = ENV
const mongoConnection = async (mongoUri = MONGO.URI) => {
	const maximumRetryingCount = parseInt(MONGO.MAX_RETRY)
	const expMongoInMS = parseInt(MONGO.EXP_IN_MS)
	let retriesCount = 1

	while (retriesCount <= maximumRetryingCount) {
		try {
			await mongoose.connect(mongoUri, {
				serverSelectionTimeoutMS: expMongoInMS
			})
			console.log(`services ${APP.NAME} connected to mongo db`)
			return
		} catch (error) {
			console.error(
				`mongo db connection error (attempt ${retriesCount}/${maximumRetryingCount})`
			)
			retriesCount++
			await new Promise((resolve) => setTimeout(resolve, expMongoInMS))
		}
	}

	console.error(
		'failed to connect to mongo db after maximum retries, exiting process.'
	)
	process.exit(1)
}

export default mongoConnection
