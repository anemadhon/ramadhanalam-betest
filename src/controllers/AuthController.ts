import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { ENV } from '../utils/constants'
import AuthService from '../services/AuthService'
import JwtService from '../services/JwtService'
import AccountService from '../services/AccountService'
import { ResponseApi } from './UserController'
import { UserInterface } from '../models/User'
import { Login, UserRegistration } from '../schemas/authSchema'
import {
	ApiResponse,
	ApiResponseError,
	StatusCode
} from '../types/responseType'

const { STATUSCODE } = ENV

export type SuccessResponse<TType> = ApiResponse<TType>
export type ErrorResponse<TType> = ApiResponseError<TType>
export default class AuthController {
	private authService: AuthService
	private jwtService: JwtService
	private accountService: AccountService

	constructor() {
		this.authService = new AuthService()
		this.jwtService = new JwtService()
		this.accountService = new AccountService()
	}

	async register(
		req: Request,
		res: Response
	): Promise<ResponseApi<UserInterface>> {
		try {
			const payload: UserRegistration = req.body
			const registered = await this.authService.registration(payload)
			const responses: SuccessResponse<
				Pick<UserInterface, 'userId'> | { message: string }
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
					access_token: string
					refresh_token: string
			  }
			| { message: string }
		>
	> {
		try {
			const payload: Login = req.body
			const dataUser = await this.authService.checkUsername(payload.username)

			if (dataUser.status === 404) {
				return res.status(dataUser.status).json({
					status: `${dataUser.status}`,
					message: STATUSCODE[`${dataUser.status}` as StatusCode].text,
					data: dataUser?.data
				})
			}

			const passwordMatched = await bcrypt.compare(
				payload.password,
				(dataUser.data as UserInterface).password
			)

			if (!passwordMatched) {
				return res.status(400).json({
					status: '400',
					message: STATUSCODE['400'].text,
					data: { message: 'Silakan masukan username & password yang benar' }
				})
			}

			const token = await this.jwtService.generateJWTToken(payload.username)

			await this.accountService.logAccount({
				...payload,
				userId: (dataUser.data as UserInterface).userId
			})

			return res.status(token.status).json({
				status: `${token.status}`,
				message: STATUSCODE[`${token.status}` as StatusCode].text,
				data: token?.data
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
		const headerToken = req.headers['authorization']

		if (!headerToken?.startsWith('Bearer ')) {
			return res.status(403).json({
				status: '403',
				message: STATUSCODE[403].text
			})
		}

		const token = headerToken.slice(7)

		try {
			const endedToken = await this.jwtService.makeTokenExpires(token)

			return res.status(endedToken.status).json({
				status: `${endedToken.status}`,
				message: STATUSCODE[`${endedToken.status}` as StatusCode].text,
				data: endedToken?.data
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
			const newToken = await this.jwtService.regenerateAccessToken(token)

			return res.status(newToken.status).json({
				status: `${newToken.status}`,
				message: STATUSCODE[`${newToken.status}` as StatusCode].text,
				data: newToken?.data
			})
		} catch (error) {
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
