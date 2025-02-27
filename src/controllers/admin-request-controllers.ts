import { Request, Response, NextFunction } from "express";
import { unknown_error, unauthorized_error, server_error } from "../lib/variables";
import { deleteAdminRequestById, findAdminRequestById } from "../data/admin-request";
import createError from "http-errors";
import { AdminRole } from "../nobox/record-structures/admin";
import { paginationOptions, userHandler } from "../lib/utils";
import { AdminRequestModel } from "../nobox/record-structures/admin-request";
import { createAdmin, validateUniqueAdminIdentifiers } from "../data/admin";
import { approvalEmailTemplate, rejectionEmailTemplate } from "../lib/html-templates";
import { sendEmail } from "../data/mail";

export const getAdminRequests = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const options = paginationOptions()
        const requests = await AdminRequestModel.find({ adminViewable: true }, options);
        res.json({ status: "success", message: "Admin requests found successfully", requests });
    } catch (error) {
        console.error(`Unable to get admin request: ${error}`);
        return next(createError(500, server_error))
    }
};



export const acceptAdminRequest = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
        const request = await findAdminRequestById(id);
        if (!request) {
            return next(createError(404, "Admin request not found."))
        }
        const { adminViewable, id: requestId, createdAt, updatedAt, ...cleanedAdmin } = request;
        const uniqueError = await validateUniqueAdminIdentifiers(cleanedAdmin.personalEmail, cleanedAdmin.phone);
        if (uniqueError) {

            const { template, text, subject } = rejectionEmailTemplate(cleanedAdmin.personalEmail, uniqueError);
            await sendEmail(cleanedAdmin.personalEmail, subject, text, template);
            await deleteAdminRequestById(id);
            return next(createError(400, uniqueError))
        }

        const admin = await createAdmin({ ...cleanedAdmin, role: AdminRole.ADMIN });
        const { template, text, subject } = approvalEmailTemplate(cleanedAdmin.personalEmail);
        await sendEmail(cleanedAdmin.personalEmail, subject, text, template);
        await deleteAdminRequestById(id)
        res.json({
            message: "Admin request approved successfully",
            status: "success",
            admin: userHandler(admin)
        })

    } catch (error) {
        console.error(`Unable to accept admin request: ${error}`);
        return next(createError(500, server_error))
    }
}

export const rejectAdminRequest = async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params
    try {
        const request = await findAdminRequestById(id);
        if (!request) {

            return next(createError(404, "Admin request not found."))
        };

        const { template, text, subject } = rejectionEmailTemplate(request.personalEmail);
        await sendEmail(request.personalEmail, subject, text, template);
        await deleteAdminRequestById(id);

        res.json({
            status: "success",
            message: "Admin request rejected successfully"
        })
    } catch (error) {
        console.error(`Unable to reject admin request: ${error}`);
        return next(createError(500, server_error))
    }
}