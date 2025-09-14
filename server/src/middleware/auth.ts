import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = "dev-secret"; // change for production

export interface AuthedRequest extends Request {
	userId?: string;
}

export function signToken(userId: string) {
	return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
	const token = req.cookies?.session;
	if (!token) return res.status(401).json({ message: "Unauthorized" });
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as { uid: string };
		req.userId = decoded.uid;
		return next();
	} catch (e) {
		return res.status(401).json({ message: "Unauthorized" });
	}
}
