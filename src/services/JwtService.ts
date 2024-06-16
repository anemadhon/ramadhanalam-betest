import jwt, { JwtPayload } from 'jsonwebtoken'
import Redis from 'ioredis'
import { ENV } from '../utils/constants'
import UserRepository from '../repositories/UserRepository'
import User from '../models/User'
import { ServicesResponse } from '../types/responseType'

const { JWT, REDIS } = ENV
const jwtAccessTokenExp = JWT.ACCESS_EXPIRED_IN
const jwtAccessTokenSecret = JWT.SECRET
const jwtrefreshTokenEpx = JWT.REFRESH_EXPIRED_IN
const jwtrefreshTokenSecret = JWT.SECRET_REFRESH

export default class JwtService {
	private userRepository: UserRepository
	private redis: Redis

	constructor() {
		this.userRepository = new UserRepository(User)
		this.redis = new Redis()
	}

	private async generateToken(data: {
		id: string
		type: 'access' | 'refresh'
	}): Promise<string> {
		const { id, type = 'access' } = data
		const secret =
			type === 'access' ? jwtAccessTokenSecret : jwtrefreshTokenSecret
		const expiredIn = {
			expiresIn: type === 'access' ? jwtAccessTokenExp : jwtrefreshTokenEpx
		}

		return jwt.sign({ id }, secret, expiredIn)
	}

	async generateJWTToken(username: string): Promise<
		ServicesResponse<
			| {
					access_token: string
					refresh_token: string
			  }
			| { message: string }
		>
	> {
		const user = await this.userRepository.findByUsername(username)

		if (!user) {
			return { status: 404, data: { message: 'username tidak ditemukan' } }
		}

		const accessToken = await this.generateToken({
			id: user.userId,
			type: 'access'
		})
		const refreshToken = await this.generateToken({
			id: user.userId,
			type: 'refresh'
		})

		await this.redis.sadd(`${REDIS.NAME}:token_${user.userId}`, accessToken)
		await this.redis.sadd(`${REDIS.NAME}:token_${user.userId}`, refreshToken)

		return {
			status: 200,
			data: {
				access_token: accessToken,
				refresh_token: refreshToken
			}
		}
	}

	async regenerateAccessToken(
		refreshToken: string,
		userId: string
	): Promise<ServicesResponse<{ access_token: string } | { message: string }>> {
		const refreshTokenExist = await this.redis.sismember(
			`${REDIS.NAME}:token_${userId}`,
			refreshToken
		)

		if (!refreshTokenExist) {
			return {
				status: 401,
				data: {
					message: 'Refresh token tidak valid'
				}
			}
		}

		const decoded = jwt.verify(
			refreshToken,
			jwtrefreshTokenSecret
		) as JwtPayload

		console.log(decoded.exp, Math.ceil(Date.now() / 1000))
		if (decoded.exp && decoded.exp < Math.ceil(Date.now() / 1000)) {
			return {
				status: 401,
				data: {
					message: 'Refresh token telah kadaluarsa'
				}
			}
		}

		const user = await this.userRepository.findById(decoded.id)

		if (!user) {
			return { status: 404, data: { message: 'username tidak ditemukan' } }
		}

		const accessToken = await this.generateToken({
			id: user.userId,
			type: 'access'
		})

		return {
			status: 200,
			data: {
				access_token: accessToken
			}
		}
	}

	async makeTokenExpires(
		token: string,
		userId: string
	): Promise<ServicesResponse<{ message: string }>> {
		await this.redis.sadd(`${REDIS.NAME}:blacklist`, token)
		await this.redis.del(`${REDIS.NAME}:token_${userId}`)

		return {
			status: 204,
			data: {
				message: 'token berhasil dinonaktifkan'
			}
		}
	}

	async isTokenBlacklisted(token: string): Promise<boolean> {
		const result = await this.redis.sismember(`${REDIS.NAME}:blacklist`, token)

		return result === 1
	}
}
