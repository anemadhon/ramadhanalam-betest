import { Schema, model, Document } from 'mongoose'

export interface AccountInterface extends Document {
	accountId: string
	userName: string
	password: string
	userId: Schema.Types.ObjectId
	lastLoginDateTime: Date
	createdAt: Date
	updatedAt: Date
}

const accountSchema = new Schema(
	{
		accountId: {
			type: String,
			unique: true,
			required: true
		},
		userName: {
			type: String,
			unique: true,
			required: true
		},
		password: {
			type: String,
			unique: true,
			required: true
		},
		lastLoginDateTime: {
			type: Date,
			default: Date.now
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			unique: true,
			required: true
		}
	},
	{ timestamps: true }
)

export default model<AccountInterface>('account', accountSchema)
