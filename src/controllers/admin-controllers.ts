import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { server_error, unauthorized_error, admin_not_found } from "../lib/variables";
import { AdminModel, Admin } from "../nobox/record-structures/admin";
import { RegisterAdminSchema } from "../schemas/index";
import { zodErrorHandler, userHandler } from "../lib/utils";
import { ZodError } from "zod";
import {validateUniqueAdminIdentifiers, createAdmin, findAdmin, checkAdminExists} from "../data/admin";
import {hashPassword, validatePassword} from "../lib/password-utils";
import { generateAccessToken } from "../middlewares/access-tokens";
export const register = async (req: Request, res: Response, next: NextFunction) => {
    const values = req.body;

    try {
        const validatedData = RegisterAdminSchema.parse(values);
        
        const { personalEmail, phone, password, username , workEmail} = validatedData;
        const uniqueError = await validateUniqueAdminIdentifiers(personalEmail.toLowerCase(), phone, username.toLowerCase());

        if (uniqueError) {
            return next(createError(400, uniqueError));
        }

        const hashedPassword = await hashPassword(password);
        const data = {
            ...validatedData,
            password: hashedPassword,
            personalEmail: personalEmail.toLowerCase(),
            workEmail: workEmail.toLowerCase(),
            username: username.toLowerCase(),
        }
        const admin = await createAdmin(data);
         res.status(201).json({ status: "success", message: "User created successfully!. Verification code sent to your messages", admin: userHandler(admin) });
    } catch (error) {
        console.error(`Unable to register admin: ${error}`);
        if (error instanceof ZodError) {
            const errors = zodErrorHandler(error);
            res.status(400).json({
                success: false,
                error: errors,
            });
            return;
        }
        return next(createError(500, server_error))
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { contactInfo, password } = req.body;
    if (!password || !contactInfo) {
        return next(createError(400, "Incomplete credentials"));
    }
    try{
        const admin = await checkAdminExists(contactInfo);
        if (!admin) {
            return next(createError(404, admin_not_found))
        }
        const isPasswordValid = await validatePassword(password, admin.password);
        if (!isPasswordValid) {
            return next(createError(401, "Invalid credentials. Check password and try again"))
        }
     const access_token = generateAccessToken(admin.id);
         res.status(200).json({ status: "success", message: "Login successful.", admin: userHandler(admin), access_token })
    }catch(error) {
        console.error(`Unable to login admin: ${error}`);
        return next(createError(500, server_error));
    }
}