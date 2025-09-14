import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryScore {
	name: string;
	score: number;
	comment: string;
}

export interface IFeedback extends Document {
	interviewId: string;
	userId: string;
	totalScore: number;
	categoryScores: ICategoryScore[];
	strengths: string[];
	areasForImprovement: string[];
	finalAssessment: string;
	createdAt: string;
}

const FeedbackSchema = new Schema<IFeedback>(
	{
		interviewId: { type: String, required: true, index: true },
		userId: { type: String, required: true, index: true },
		totalScore: { type: Number, required: true },
		categoryScores: [
			{
				name: String,
				score: Number,
				comment: String,
			},
		],
		strengths: { type: [String], default: [] },
		areasForImprovement: { type: [String], default: [] },
		finalAssessment: { type: String, default: "" },
		createdAt: { type: String, required: true },
	},
	{ timestamps: false }
);

export default mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
