import { Router } from "express";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import User from "../models/User";
import { signToken, requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(cookieParser());

router.post("/sign-up", async (req, res) => {
	try {
		const { name, email, password } = req.body as { name: string; email: string; password: string };
		if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

		const exists = await User.findOne({ email });
		if (exists) return res.status(409).json({ message: "Email already in use" });

		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, passwordHash });
		return res.status(201).json({ id: user.id, name: user.name, email: user.email });
	} catch (e) {
		return res.status(500).json({ message: "Failed to create account" });
	}
});

router.post("/sign-in", async (req, res) => {
	try {
		const { email, password } = req.body as { email: string; password: string };
		if (!email || !password) return res.status(400).json({ message: "Missing fields" });

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });

		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ message: "Invalid credentials" });

		const token = signToken(user.id);
		res.cookie("session", token, { httpOnly: true, sameSite: "lax", secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
		return res.json({ id: user.id, name: user.name, email: user.email });
	} catch (e) {
		return res.status(500).json({ message: "Failed to sign in" });
	}
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
	const user = await User.findById(req.userId);
	if (!user) return res.status(404).json({});
	return res.json({ id: user.id, name: user.name, email: user.email });
});

router.post("/me", requireAuth, async (req: AuthedRequest, res) => {
	const user = await User.findById(req.userId);
	if (!user) return res.status(404).json({});
	return res.json({ id: user.id, name: user.name, email: user.email });
});

router.post("/sign-out", (_, res) => {
  try {
    // Clear the session cookie
    res.clearCookie("session", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Sign out error:", error);
    return res.status(500).json({ success: false, message: "Failed to sign out" });
  }
});

export default router;
