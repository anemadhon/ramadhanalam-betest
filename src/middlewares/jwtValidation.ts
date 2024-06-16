import jwt, {
	JsonWebTokenError,
	JwtPayload,
	TokenExpiredError
} from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { ENV } from '../utils/constants'
import JwtService from '../services/JwtService'

export interface CustomRequest extends Request {
	token: string | JwtPayload
}

const { JWT, STATUSCODE } = ENV
const jwtAccessTokenSecret = JWT.SECRET
const jwtService = new JwtService()
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
	const headerToken = req.headers['authorization']

	if (!headerToken?.startsWith('Bearer ')) {
		return res.status(403).json({
			status: '403',
			message: STATUSCODE['403'].text,
			error: { message: 'token tidak ditemukan' }
		})
	}

	const token = headerToken.slice(7)

	if (!token) {
		return res.status(403).json({
			status: '403',
			message: STATUSCODE['403'].text,
			error: { message: 'token tidak valid' }
		})
	}

	const tokenIsBlackListed = await jwtService.isTokenBlacklisted(token)

	if (tokenIsBlackListed) {
		return res.status(403).json({
			status: '403',
			message: STATUSCODE['403'].text,
			error: { message: 'token sudah tidak dapat digunakan' }
		})
	}

	try {
		const decoded = jwt.verify(token, jwtAccessTokenSecret) as JwtPayload

		;(req as CustomRequest).token = decoded.id
		next()
	} catch (err) {
		if (err instanceof TokenExpiredError) {
			return res.status(401).json({
				status: '401',
				message: STATUSCODE['401'].text,
				error: {
					message: 'Token sudah kadaluarsa'
				}
			})
		}
		if (err instanceof JsonWebTokenError) {
			return res.status(401).json({
				status: '401',
				message: STATUSCODE['401'].text,
				error: {
					message: 'Token tidak valid'
				}
			})
		}

		console.error('err decoded', { err })
		return res.status(500).json({
			status: '500',
			message: STATUSCODE['500'].text
		})
	}
}

export default verifyToken
