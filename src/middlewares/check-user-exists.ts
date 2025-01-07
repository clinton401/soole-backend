import { Request, Response, NextFunction } from "express"
import { server_error } from "../lib/variables";
import createError from "http-errors";
import { validatePhone, validateEmail } from "../lib/utils";
import { UserModel, User } from "../nobox/record-structures/user";
export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
    const { phone, email, password } = req.body;

    if (!password || (!phone && !email)) {
        return next(createError(400, "Incomplete credentials"));
    }
    if (phone && email) {
        return next(createError(400, "Please provide only one of phone or email, not both."))
    }

    try {
        let user: User & {
            id: string;
        } | null;
        if (phone) {
            if (!validatePhone(phone)) {
                return next(createError(400, "Phone not in correct format. Include country code."));

            }
            user = await UserModel.findOne({ phone });
            if (!user) {
                return next(createError(400, "User not found. Check phone number and try again."))
            }
        } else {
            if (!validateEmail(email)) {
                return next(createError(400, "Email not in correct format. Check the email address."));

            }
            user = await UserModel.findOne({ email })
            if (!user) {
                return next(createError(400, "User not found. Check email and try again."))
            }
        
        }
        req.user = user

    }

    catch (error) {
        console.error(`Error while checking if user exists: ${error}`)
        return next(createError(500, server_error));
    }

}