import { init } from '@paralleldrive/cuid2'
import { QueryTypeAccount } from '../repositories/AccountRepository'
import { ServicesResponse } from '../types/responseType'
import { Login } from '../schemas/authSchema'
import AccountRepository from '../repositories/AccountRepository'
import Account, { AccountInterface } from '../models/Account'

export default class AccountService {
	private accountRepository: AccountRepository

	constructor() {
		this.accountRepository = new AccountRepository(Account)
	}

	async getData(
		query: QueryTypeAccount
	): Promise<ServicesResponse<AccountInterface[]>> {
		return { status: 200, data: await this.accountRepository.findAll(query) }
	}

	async logAccount(payload: Login & { userId: string }): Promise<void> {
		const account = await this.accountRepository.findByUserId(payload.userId)

		if (account?.userId) {
			await this.accountRepository.update(
				{ accountId: account.accountId },
				{ $set: { lastLoginDateTime: Date.now() } }
			)
		} else {
			const cuidAccountId = init({ length: 12 })
			const accountId = cuidAccountId()

			await this.accountRepository.create({
				...payload,
				accountId
			})
		}
	}
}
