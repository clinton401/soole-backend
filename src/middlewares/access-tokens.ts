import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { server_error } from "../lib/variables";

export const generateAccessToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;
  if (!secret || !expiresIn) {
    throw new Error("JWT secret and expire time are required");
  }
  return jwt.sign({ id }, secret, { expiresIn });
};
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createError(401, "Access denied. No token provided."));
  }
  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("No JWT Secret provided");
    return next(createError(500, server_error));
  }
  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
    };

    req.userId = decoded.id;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return next(createError(401, "Token has expired. Please log in again."));
    }
    return next(createError(401, "Access denied. Invalid token"));
  }
};

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("No JWT Secret provided");
      return next(createError(500, server_error));
    }
    try {
      const decoded = jwt.verify(token, secret) as {
        id: string;
      };

      req.userId = decoded.id;
      return next(createError(400, "You are already logged in."));
    } catch (error) {
      next();
    }
  } else {
    next();
  }
};
