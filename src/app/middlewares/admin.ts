import type { NextFunction, Request, Response } from "express";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const { userIsAdmin: isUserAdmin } = req as Request & { userIsAdmin?: boolean };

	if (!isUserAdmin) {
		return res.status(401).json({ error: "Acesso restrito para administradores" });
	}

	return next();
};

export default adminMiddleware;
