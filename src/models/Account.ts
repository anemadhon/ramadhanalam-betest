import mongoose, { Schema, model, Document } from 'mongoose'

export interface AccountInterface extends Document {
	accountId: string
	userName: string
	password: string
	userId: string
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
			required: true
		},
		password: {
			type: String,
			required: true
		},
		lastLoginDateTime: {
			type: Date,
			default: Date.now
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'users',
			required: true
		}
	},
	{ timestamps: true }
)

export default model<AccountInterface>('accounts', accountSchema)
