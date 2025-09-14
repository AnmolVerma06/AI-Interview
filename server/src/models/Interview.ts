import mongoose, { Schema, Document } from "mongoose";

export interface IInterview extends Document {
	userId: string;
	role: string;
	type: string;
	techstack: string[];
	level: string;
	questions: string[];
	finalized: boolean;
	createdAt: string;
}

const InterviewSchema = new Schema<IInterview>(
	{
		userId: { type: String, required: true, index: true },
		role: { type: String, required: true },
		type: { type: String, required: true },
		techstack: { type: [String], default: [] },
		level: { type: String, required: true },
		questions: { type: [String], default: [] },
		finalized: { type: Boolean, default: false },
		createdAt: { type: String, required: true },
	},
	{ timestamps: false }
);

export default mongoose.models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema);
