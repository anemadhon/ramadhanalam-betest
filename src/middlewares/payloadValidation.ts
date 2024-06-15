import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError, ZodIssue } from 'zod'
import { ENV } from '../utils/constants'
import { ApiResponseError } from '../types/responseType'

const { STATUSCODE } = ENV
const validatePayloadSchema =
	(schema: ZodSchema) =>
	(
		req: Request,
		res: Response,
		next: NextFunction
	): void | Response<ApiResponseError<ZodIssue[]>> => {
		try {
			schema.parse(req.body)
			next()
		} catch (error) {
			return res.status(400).json({
				status: 400,
				message: STATUSCODE[400].text,
				errors: (error as ZodError).errors
			})
		}
	}

const validateParamSchema =
	(schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body)
			next()
		} catch (error) {
			return res.status(400).json({
				status: 400,
				message: STATUSCODE[400].text,
				errors: (error as ZodError).errors
			})
		}
	}

export { validatePayloadSchema, validateParamSchema }
