import dayjs from 'dayjs'
import { FilterQuery, Model } from 'mongoose'
import { AccountInterface } from '../models/Account'
import { AccountList } from '../schemas/accountSchema'
import { Login } from '../schemas/authSchema'

export type QueryTypeAccount = Partial<AccountList>
export type SortOrder = 1 | -1
export type SortOptions<T> = {
	[P in keyof T]?: SortOrder
}
export default class AccountRepository {
	private accountModel: Model<AccountInterface>

	constructor(accountModel: Model<AccountInterface>) {
		this.accountModel = accountModel
	}

	async create(
		payload: Login & { accountId: string; userId: string }
	): Promise<AccountInterface> {
		const validPayload = {
			userName: payload.username,
			password: payload.password,
			accountId: payload.accountId,
			userId: payload.userId
		}

		return await this.accountModel.create(validPayload)
	}

	async findAll(query: QueryTypeAccount): Promise<AccountInterface[]> {
		const currentDatetime = dayjs()
		const threeDaysBefore = currentDatetime.subtract(3, 'day')
		const whereClause: FilterQuery<Partial<AccountInterface>> = {
			lastLoginDateTime: { $gte: threeDaysBefore.toDate() }
		}

		if (query.search?.key && query.search?.value) {
			whereClause[`${query.search.key}`] = query.search.value
		}

		const offset = query.offset || 0
		const limit = query.limit || 10
		const orderBy = (query.order?.key as keyof AccountInterface) || 'createdAt'
		const orderDir = query.order?.value || 'desc'
		const sort = {
			[orderBy]: orderDir === 'asc' ? 1 : -1
		} as SortOptions<AccountInterface>

		return await this.accountModel
			.find(whereClause)
			.populate('user')
			.skip(offset as number)
			.limit(limit as number)
			.sort(sort)
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async findByUserId(userId: string): Promise<AccountInterface | null> {
		return await this.accountModel
			.findOne({ userId })
			.select('-_id -__v')
			.lean()
			.exec()
	}

	async update(
		whereClause: FilterQuery<Partial<AccountInterface>>,
		toBeUpdated: FilterQuery<Partial<AccountInterface>>
	): Promise<AccountInterface | null> {
		return await this.accountModel
			.findOneAndUpdate(whereClause, toBeUpdated)
			.lean()
			.exec()
	}

	async delete(id: string): Promise<{ deletedCount?: number }> {
		return await this.accountModel.deleteOne({ userId: id }).exec()
	}
}
