import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import Interview from "../models/Interview";

const router = Router();

router.get("/", requireAuth, async (req: AuthedRequest, res) => {
	const userId = req.userId!;
	const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
	return res.json(interviews);
});

router.get("/latest", requireAuth, async (req: AuthedRequest, res) => {
	const userId = req.userId!;
	const interviews = await Interview.find({ finalized: true, userId: { $ne: userId } })
		.sort({ createdAt: -1 })
		.limit(20);
	return res.json(interviews);
});

export default router;
