import { Request, Response } from 'express'
import { ENV } from '../utils/constants'
import UserService from '../services/UserService'
import {
	ApiResponse,
	ApiResponseError,
	StatusCode
} from '../types/responseType'
import { UserInterface } from '../models/User'
import { UserUpdate } from '../schemas/userSchema'
import { QueryType } from '../repositories/UserRepository'

const { STATUSCODE } = ENV

export type SuccessResponse<TType> = ApiResponse<TType>
export type ErrorResponse<TType> = ApiResponseError<TType>
export type ResponseApi<TType> = Response<
	SuccessResponse<TType> | ErrorResponse<{ message: string }>
>
export default class UserController {
	private userService: UserService

	constructor() {
		this.userService = new UserService()
	}

	async read(
		req: Request,
		res: Response
	): Promise<ResponseApi<UserInterface[] | Record<string, string>[]>> {
		try {
			const query: QueryType = {
				offset: req.body.offset || 0,
				limit: req.body.limit || 10,
				search: {
					key: req.body.search.key,
					value: req.body.search.value
				},
				order: {
					key: req.body.order.key || 'createdAt',
					value: req.body.order.value || 'desc'
				}
			}
			const users = await this.userService.getData(query)
			const responses: SuccessResponse<
				UserInterface[] | Record<string, string>[]
			> = {
				status: `${users.status}`,
				message: STATUSCODE[`${users.status}` as StatusCode].text,
				data: users.data
			}

			return res.status(200).json(responses)
		} catch (error) {
			console.error('err exports.read trycatch', { error })
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

	async readByAccountNumber(
		req: Request,
		res: Response
	): Promise<ResponseApi<UserInterface | Record<string, string>>> {
		try {
			const user = await this.userService.getDataByAccountNumber(
				req.params.account_number as string
			)
			const responses: SuccessResponse<UserInterface | Record<string, string>> =
				{
					status: `${user.status}`,
					message: STATUSCODE[`${user.status}` as StatusCode].text,
					data: user.data
				}

			return res.status(user.status).json(responses)
		} catch (error) {
			console.error('err exports.readByAccountNumber trycatch', { error })
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

	async readByRegistrationNumber(
		req: Request,
		res: Response
	): Promise<ResponseApi<UserInterface | Record<string, string>>> {
		try {
			const user = await this.userService.getDataByRegistrationNumber(
				req.params.registration_number as string
			)
			const responses: SuccessResponse<UserInterface | Record<string, string>> =
				{
					status: `${user.status}`,
					message: STATUSCODE[`${user.status}` as StatusCode].text,
					data: user.data
				}

			return res.status(user.status).json(responses)
		} catch (error) {
			console.error('err exports.readByRegistrationNumber trycatch', { error })
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

	async updateUser(
		req: Request,
		res: Response
	): Promise<ResponseApi<UserInterface>> {
		try {
			const payload: UserUpdate = req.body
			const updatedUser = await this.userService.updateData(payload)
			const responses: SuccessResponse<UserInterface> = {
				status: `${updatedUser.status}`,
				message: STATUSCODE[`${updatedUser.status}` as StatusCode].text,
				data: updatedUser.data
			}

			return res.status(updatedUser.status).json(responses)
		} catch (error) {
			console.error('err exports.update trycatch', { error })
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

	async deleteUser(
		req: Request,
		res: Response
	): Promise<ResponseApi<{ deletedCount?: number }>> {
		try {
			const deletedUser = await this.userService.deleteData(req.body.id)
			const responses: SuccessResponse<{ deletedCount?: number }> = {
				status: `${deletedUser.status}`,
				message: STATUSCODE[`${deletedUser.status}` as StatusCode].text,
				data: deletedUser.data
			}

			return res.status(deletedUser.status).json(responses)
		} catch (error) {
			console.error('err exports.deleteUser trycatch', { error })
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
