import { Request, Response, NextFunction } from "express";
import { UserModel, UserStatus } from "../nobox/record-structures/user";
import createError from "http-errors";
import { unauthorized_error, server_error } from "../lib/variables";

export const verifyUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }

    try {
        const user = await UserModel.findOne({ id: userId });
        if (!user) {

            return next(createError(404, "User not found"))
        }
        if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.DEACTIVATED) {
            return next(createError(403, "Account suspended or deactivated."))
        }
        const protectedRoutes = [
            "/verify-face",
            "/kyc/submit"
        ]
        if (protectedRoutes.includes(req.path) && !user.isKycVerified) {
            next(createError(403, "You must complete identity verification to continue."))
        }
        next()
    } catch (error) {
        console.error(`Unable to verify user status: ${error}`);
        return next(createError(500, server_error))
    }
}