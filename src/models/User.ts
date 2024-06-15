import { Schema, model, Document } from 'mongoose'

export interface UserInterface extends Document {
	userId: string
	fullName: string
	userName: string
	password: string
	emailAddress: string
	registrationNumber: string
	accountNumber: string
	createdAt: Date
	updatedAt: Date
}

const userSchema: Schema = new Schema(
	{
		userId: {
			type: String,
			unique: true,
			required: true
		},
		fullName: {
			type: String,
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
		emailAddress: {
			type: String,
			unique: true,
			required: true
		},
		registrationNumber: {
			type: String,
			unique: true,
			required: true
		},
		accountNumber: {
			type: String,
			unique: true,
			required: true
		}
	},
	{ timestamps: true }
)

export default model<UserInterface>('users', userSchema)
