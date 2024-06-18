import { Request, Response } from 'express'
import { ENV } from '../utils/constants'
import AuthService from '../services/AuthService'
import JwtService from '../services/JwtService'
import { ResponseApi } from './UserController'
import { UserInterface } from '../models/User'
import { Login, UserRegistration } from '../schemas/authSchema'
import {
	ApiResponse,
	ApiResponseError,
	StatusCode
} from '../types/responseType'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

const { STATUSCODE } = ENV

export type SuccessResponse<TType> = ApiResponse<TType>
export type ErrorResponse<TType> = ApiResponseError<TType>
export default class AuthController {
	private authService: AuthService
	private jwtService: JwtService

	constructor() {
		this.authService = new AuthService()
		this.jwtService = new JwtService()
	}

	async register(
		req: Request,
		res: Response
	): Promise<
		ResponseApi<
			Pick<UserInterface, 'userId' | 'registrationNumber'> | { message: string }
		>
	> {
		try {
			const payload: UserRegistration = req.body
			const registered = await this.authService.registration(payload)
			const responses: SuccessResponse<
				| Pick<UserInterface, 'userId' | 'registrationNumber'>
				| { message: string }
			> = {
				status: `${registered.status}`,
				message: STATUSCODE[`${registered.status}` as StatusCode].text,
				data: registered.data
			}

			return res.status(200).json(responses)
		} catch (error) {
			console.error('err exports.register trycatch', { error })
			const responses: ErrorResponse<{ message: string }> = {
				status: '500',
				message: 'SERVER ERROR',
				error: {
					message: error instanceof Error ? error.message : 'SERVER ERROR'
				}
			}

			return res.status(500).json(responses)
		}
	}

	async login(
		req: Request,
		res: Response
	): Promise<
		ResponseApi<
			| {
					user: UserInterface
					token: { access_token: string; refresh_token: string }
			  }
			| { message: string }
		>
	> {
		try {
			const payload: Login = req.body
			const userLogin = await this.authService.login(payload)

			return res.status(userLogin.status).json({
				status: `${userLogin.status}`,
				message: STATUSCODE[`${userLogin.status}` as StatusCode].text,
				data: userLogin?.data
			})
		} catch (error) {
			console.error('err exports.login trycatch', { error })
			const responses: ErrorResponse<{ message: string }> = {
				status: '500',
				message: 'SERVER ERROR',
				error: {
					message: error instanceof Error ? error.message : 'SERVER ERROR'
				}
			}

			return res.status(500).json(responses)
		}
	}

	async logout(
		req: Request,
		res: Response
	): Promise<ResponseApi<{ message: string }>> {
		try {
			await this.jwtService.makeTokenExpires(
				(req.headers['authorization'] as string).slice(7),
				req.body.user_id
			)

			return res.status(204).json({
				status: '204',
				message: 'NO CONTENT'
			})
		} catch (error) {
			console.error('err exports.logout trycatch', { error })
			const responses: ErrorResponse<{ message: string }> = {
				status: '500',
				message: 'SERVER ERROR',
				error: {
					message: error instanceof Error ? error.message : 'SERVER ERROR'
				}
			}

			return res.status(500).json(responses)
		}
	}

	async refreshToken(
		req: Request,
		res: Response
	): Promise<ResponseApi<{ access_token: string } | { message: string }>> {
		try {
			const token: string = req.body.refresh_token
			const id: string = req.body.user_id
			const newToken = await this.jwtService.regenerateAccessToken(token, id)

			return res.status(newToken.status).json({
				status: `${newToken.status}`,
				message: STATUSCODE[`${newToken.status}` as StatusCode].text,
				data: newToken?.data
			})
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				return res.status(401).json({
					status: '401',
					message: STATUSCODE['401'].text,
					error: {
						message: 'Refresh Token sudah kadaluarsa'
					}
				})
			}
			if (error instanceof JsonWebTokenError) {
				return res.status(401).json({
					status: '401',
					message: STATUSCODE['401'].text,
					error: {
						message: 'Refresh Token tidak valid'
					}
				})
			}
			console.error('err exports.refreshToken trycatch', { error })
			const responses: ErrorResponse<{ message: string }> = {
				status: '500',
				message: 'SERVER ERROR',
				error: {
					message: error instanceof Error ? error.message : 'SERVER ERROR'
				}
			}

			return res.status(500).json(responses)
		}
	}
}
