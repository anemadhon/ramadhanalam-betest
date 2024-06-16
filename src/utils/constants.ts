import 'dotenv/config'
import { StatusCodeMap } from '../types/responseType'

const APP = {
	NAME: process.env.APP_NAME!,
	PORT: process.env.APP_PORT!
}
const STATUSCODE: StatusCodeMap = {
	'200': { text: 'OK' },
	'201': { text: 'CREATED' },
	'400': { text: 'BAD REQUEST' },
	'401': { text: 'UNAUTHORIZE' },
	'404': { text: 'NOT FOUND' },
	'500': { text: 'SERVER ERROR' }
}
const MONGO_HOST = process.env.MONGO_HOST!
const MONGO_PORT = process.env.MONGO_PORT!
const MONGO = {
	HOST: MONGO_HOST,
	PORT: MONGO_PORT,
	NAME: process.env.MONGO_NAME!,
	NAME_TEST: process.env.MONGO_TEST_NAME!,
	EXP_IN_MS: process.env.MONGO_EXP_IN_MS!,
	MAX_RETRY: process.env.MONGO_MAX_RETRY || '3',
	URI: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${process.env.MONGO_NAME}`,
	URI_TEST: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${process.env.MONGO_TEST_NAME}`
}
const REDIS = {
	NAME: process.env.REDIS_NAME!,
	HOST: process.env.REDIS_HOST!,
	PORT: process.env.REDIS_PORT!,
	MAX_ATTEMPT: process.env.REDIS_MAX_ATTEMPT || '1'
}
const JWT = {
	ACCESS_EXPIRED_IN: process.env.JWT_EXPIRED_IN || '2m',
	SECRET: process.env.JWT_SECRET_TOKEN!,
	REFRESH_EXPIRED_IN: process.env.JWT_REFRESH_EXPIRED_IN || '24h',
	SECRET_REFRESH: process.env.JWT_SECRET_TOKEN_REFRESH!
}
const ENV = {
	APP,
	STATUSCODE,
	MONGO,
	REDIS,
	JWT
} as const

export { ENV }
