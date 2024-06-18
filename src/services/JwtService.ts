import jwt, { JwtPayload } from 'jsonwebtoken'
import { ENV } from '../utils/constants'
import UserRepository from '../repositories/UserRepository'
import User from '../models/User'
import { ServicesResponse } from '../types/responseType'
import RedisService from './RedisService'

const { JWT, REDIS } = ENV
const jwtAccessTokenExp = JWT.ACCESS_EXPIRED_IN
const jwtAccessTokenSecret = JWT.SECRET
const jwtrefreshTokenEpx = JWT.REFRESH_EXPIRED_IN
const jwtrefreshTokenSecret = JWT.SECRET_REFRESH

export default class JwtService {
	private userRepository: UserRepository
	private redisService: RedisService

	constructor() {
		this.userRepository = new UserRepository(User)
		this.redisService = new RedisService()
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

	async generateJWTToken(userId: string): Promise<
		ServicesResponse<{
			access_token: string
			refresh_token: string
		}>
	> {
		const accessToken = await this.generateToken({
			id: userId,
			type: 'access'
		})
		const refreshToken = await this.generateToken({
			id: userId,
			type: 'refresh'
		})

		await this.redisService.storeSetsMember(
			`${REDIS.NAME}:token_${userId}`,
			accessToken
		)
		await this.redisService.storeSetsMember(
			`${REDIS.NAME}:token_${userId}`,
			refreshToken
		)

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
		const refreshTokenExist = await this.redisService.checkSetsMember(
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

		if (decoded.exp && decoded.exp < Math.ceil(Date.now() / 1000)) {
			return {
				status: 401,
				data: {
					message: 'Refresh token sudah kadaluarsa'
				}
			}
		}

		const user = await this.userRepository.findById(decoded.id)

		if (!user) {
			return { status: 404, data: { message: 'Data tidak ditemukan' } }
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

	async makeTokenExpires(token: string, userId: string): Promise<void> {
		await this.redisService.storeSetsMember(`${REDIS.NAME}:blacklist`, token)
		await this.redisService.deleteObject(`${REDIS.NAME}:token_${userId}`)
	}

	async isTokenBlacklisted(token: string): Promise<boolean> {
		const result = await this.redisService.checkSetsMember(
			`${REDIS.NAME}:blacklist`,
			token
		)

		return result === 1
	}
}
