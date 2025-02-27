import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { server_error, unauthorized_error, admin_not_found } from "../lib/variables";
import { AdminModel, Admin, AdminRole } from "../nobox/record-structures/admin";
import { RegisterAdminSchema } from "../schemas/index";
import { zodErrorHandler, userHandler } from "../lib/utils";
import { ZodError } from "zod";
import { validateUniqueAdminIdentifiers, createAdmin, findAdmin, checkAdminExists } from "../data/admin";
import { hashPassword, validatePassword } from "../lib/password-utils";
import { generateAccessToken } from "../middlewares/access-tokens";
import { createAdminRequest, hasPendingAdminRequest } from "../data/admin-request";
export const register = async (req: Request, res: Response, next: NextFunction) => {
    const values = req.body;

    try {
        const validatedData = RegisterAdminSchema.parse(values);

        const { personalEmail, phone, password, name, workEmail } = validatedData;
        const hasPending = await hasPendingAdminRequest(personalEmail.toLowerCase(), phone);
        if (hasPending) {
            return next(createError(400, "You already have a pending request."))
        }
        const uniqueError = await validateUniqueAdminIdentifiers(personalEmail.toLowerCase(), phone);

        if (uniqueError) {
            return next(createError(400, uniqueError));
        }

        const hashedPassword = await hashPassword(password);
        const data = {
            ...validatedData,
            password: hashedPassword,
            personalEmail: personalEmail.toLowerCase(),
            workEmail: workEmail.toLowerCase(),
            name: name.toLowerCase(),
            adminViewable: true
        }
        await createAdminRequest({ ...data });
        res.status(201).json({ status: "success", message: "Admin request submitted! You'll receive an email once it's reviewed." });
    } catch (error) {
        console.error(`Unable to send admin request: ${error}`);
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
    try {
        const admin = await checkAdminExists(contactInfo);
        if (!admin) {
            return next(createError(404, admin_not_found))
        }
        const isPasswordValid = await validatePassword(password, admin.password);
        if (!isPasswordValid) {
            return next(createError(401, "Invalid credentials. Check password and try again"))
        }
        const access_token = generateAccessToken(admin.id);
        res.status(200).json({ status: "success", message: "Login successful.", user: userHandler(admin), access_token })
    } catch (error) {
        console.error(`Unable to login admin: ${error}`);
        return next(createError(500, server_error));
    }
}