import { Model } from 'mongoose'
import { UserInterface } from '../models/User'
import { UserLists } from '../schemas/userSchema'
import { UserRegistration } from '../schemas/authSchema'

export type QueryType = Partial<UserLists>
export type SortOrder = 1 | -1
export type SortOptions<T> = {
	[P in keyof T]?: SortOrder
}
export default class UserRepository {
	private userModel: Model<UserInterface>

	constructor(userModel: Model<UserInterface>) {
		this.userModel = userModel
	}

	async registerUser(
		payload: UserRegistration & {
			registrationNumber: string
			userId: string
			fullName: string
		}
	): Promise<UserInterface> {
		const validPayload = {
			userName: payload.username,
			password: payload.password,
			emailAddress: payload.email,
			accountNumber: payload.account_number,
			registrationNumber: payload.registrationNumber,
			userId: payload.userId,
			fullName: payload.fullName
		}

		return await this.userModel.create(validPayload)
	}

	async findAll(query: QueryType): Promise<UserInterface[]> {
		const whereClause: Record<string, string | number> = {}

		if (query.search?.key && query.search?.value) {
			whereClause[`${query.search.key}`] = query.search.value
		}

		const offset = query.offset || 0
		const limit = query.limit || 10
		const orderBy = (query.order?.key as keyof UserInterface) || 'createdAt'
		const orderDir = query.order?.value || 'desc'
		const sort = {
			[orderBy]: orderDir === 'asc' ? 1 : -1
		} as SortOptions<UserInterface>

		return await this.userModel
			.find(whereClause)
			.skip(offset as number)
			.limit(limit as number)
			.sort(sort)
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async findByAccountNumber(
		accountNumber: string
	): Promise<UserInterface | null> {
		return await this.userModel
			.findOne({ accountNumber })
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async findByRegistrationNumber(
		registrationNumber: string
	): Promise<UserInterface | null> {
		return await this.userModel
			.findOne({ registrationNumber })
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async findByUsername(userName: string): Promise<UserInterface | null> {
		return await this.userModel
			.findOne({ userName })
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async findByEmail(email: string): Promise<UserInterface | null> {
		return await this.userModel
			.findOne({ emailAddress: email })
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async findById(userId: string): Promise<UserInterface | null> {
		return await this.userModel
			.findOne({ userId })
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async update(
		whereClause: Record<string, string>,
		toBeUpdated: Partial<UserInterface>
	): Promise<UserInterface | null> {
		return await this.userModel
			.findOneAndUpdate(whereClause, toBeUpdated)
			.lean()
			.exec()
	}

	async delete(id: string): Promise<{ deletedCount?: number }> {
		return await this.userModel.deleteOne({ userId: id }).exec()
	}
}
