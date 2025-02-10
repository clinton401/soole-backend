import { Request, Response, NextFunction } from "express";
import { server_error, unauthorized_error } from "../lib/variables";
import createError from "http-errors";
import { AdminRequestModel } from "../nobox/record-structures/admin-request";
import { findAdminById } from "../data/admin";
import { AdminRole } from "../nobox/record-structures/admin";


export const checkSuperAdmin = async(req: Request, res: Response, next: NextFunction) => {

    const userId = req.userId;
    if(!userId) {
        return next(createError(401, unauthorized_error))
    }
    try{

        const admin = await findAdminById(userId);

        if(!admin){
            return next(createError(404, "Admin not found."))
        }

        if(admin.role !== AdminRole.SUPER_ADMIN) {
            return next(createError(403, "Access denied. Only super admins can perform this action."))
        }
        next()
    }catch(error) {
        console.error(`Unable to check if an admin is a super admin`);
        return next(createError(500, server_error));
    }
}