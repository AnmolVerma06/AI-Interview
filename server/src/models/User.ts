import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
	name: string;
	email: string;
	passwordHash: string;
	createdAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String, required: true },
	},
	{ timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
