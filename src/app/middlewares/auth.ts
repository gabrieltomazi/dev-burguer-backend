import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import authConfig from "../../config/auth";

type AuthenticatedRequest = Request & {
  userId?: string;
  userName?: string;
  userIsAdmin?: boolean;
};

interface TokenPayload {
  id: string;
  name: string;
  admin: boolean;
  iat: number;
  exp: number;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const token = authToken.split(" ")[1];

  try {
    const decoded = jwt.verify(token, authConfig.secret) as TokenPayload;

    req.userId = decoded.id;
    req.userName = decoded.name;
    req.userIsAdmin = decoded.admin;

    return next();
  } catch {
    return res.status(401).json({ error: "Token is invalid" });
  }
};

export default authMiddleware;
