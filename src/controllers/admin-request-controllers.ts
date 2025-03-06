import { Request, Response, NextFunction } from "express";
import { unknown_error, unauthorized_error, server_error } from "../lib/variables";
import { deleteAdminRequestById, findAdminRequestById } from "../data/admin-request";
import createError from "http-errors";
import { AdminRole } from "../nobox/record-structures/admin";
import { paginationOptions, userHandler, getUserPageInfo } from "../lib/utils";
import { AdminRequestModel } from "../nobox/record-structures/admin-request";
import { createAdmin, validateUniqueAdminIdentifiers } from "../data/admin";
import { approvalEmailTemplate, rejectionEmailTemplate } from "../lib/html-templates";
import { sendEmail } from "../data/mail";

export const getAdminRequests = async (req: Request, res: Response, next: NextFunction) => {
    const {page} = req.query as {
        page?: string
    }
    const currentPage = Math.max(1, Number(page) || 1);
    try {
        const options = paginationOptions()
        const requests = await AdminRequestModel.find({ adminViewable: true }, options);
        if(!requests){
            return next(createError(500, unknown_error))
        }
        const pageSize = 15;
        
        const data = getUserPageInfo(requests, pageSize, currentPage, "requests");
        res.json({ status: "success", message: "Admin requests found successfully", data});
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

        const admin = await createAdmin({ ...cleanedAdmin, role: AdminRole.ADMIN, adminViewable: true });
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