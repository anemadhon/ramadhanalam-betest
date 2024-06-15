import { Request, Response } from 'express'
import { ENV } from '../utils/constants'
import AccountService from '../services/AccountService'
import {
	ApiResponse,
	ApiResponseError,
	StatusCode
} from '../types/responseType'
import { AccountInterface } from '../models/Account'
import { QueryTypeAccount } from '../repositories/AccountRepository'

const { STATUSCODE } = ENV

export type SuccessResponse<TType> = ApiResponse<TType>
export type ErrorResponse<TType> = ApiResponseError<TType>
export type ResponseApi<TType> = Response<
	SuccessResponse<TType> | ErrorResponse<{ message: string }>
>
export default class AccountController {
	private accountService: AccountService

	constructor() {
		this.accountService = new AccountService()
	}

	async read(
		req: Request,
		res: Response
	): Promise<ResponseApi<AccountInterface[]>> {
		try {
			const query: QueryTypeAccount = {
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
			const users = await this.accountService.getData(query)
			const responses: SuccessResponse<AccountInterface[]> = {
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
}
