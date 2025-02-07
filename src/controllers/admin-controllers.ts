import {AdminModel, AdminRole} from "../nobox/record-structures/admin";
import {Request, Response, NextFunction} from "express";
import createError from "http-errors";
import {unauthorized_error, unknown_error, server_error} from "../lib/variables";
import { AddNewAdminSchema, UpdateAdminProfileSchema } from "../schemas";
import {config} from "dotenv";
import {userHandler, zodErrorHandler} from "../lib/utils";
import {validateUniqueAdminIdentifiers, createAdmin, findAdminById} from "../data/admin";
import {hashPassword, validatePassword} from "../lib/password-utils";
import {ZodError} from "zod"
config()


export const makeSuperAdmin = async(req: Request, res: Response, next: NextFunction) => {
const userId = req.userId;
const id = req.params.id
if(!userId) {
    return next(createError(4011, unauthorized_error))
};

if(userId === id) {
    return next(createError("You can not make yourself a super admin"))
}
try{
    const [superAdmin, admin] = await Promise.all([
        findAdminById(userId),
        findAdminById(id),

    ])

    if(!superAdmin){
        return next(createError(404, "User not found."))
    }
    if(!admin){
        return next(createError(404, "Admin not found."))
    }

    if(superAdmin.role !== AdminRole.SUPER_ADMIN) {
        return next(createError(403, "You need super admin privileges to perform this action."))
    }
    if(admin.role === AdminRole.SUPER_ADMIN){
        return next(createError(400, "The user is already a super admin."))
    }
const updatedAdmin = await AdminModel.updateOneById(id, {
    role: AdminRole.SUPER_ADMIN
})
if(!updatedAdmin) {
    return next(createError(500, unknown_error))
}
res.json({
    status: "success",
    message: "User made a super admin successfully",
    user: updatedAdmin
})
}catch(error){
    console.error(`Unable to make admin a super admin: ${error}`);
    return next(createError(500, server_error))
}
}


export const removeFromSuperAdmin = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
const id = req.params.id
if(!userId) {
    return next(createError(401, unauthorized_error))
};
if(userId === id) {
    return next(createError("You can not remove yourself as a super admin"))
}
try{
    const [superAdmin, admin] = await Promise.all([
        findAdminById(userId),
        findAdminById(id),

    ])
    
        if(!superAdmin){
            return next(createError(404, "User not found."))
        }
        if(!admin){
            return next(createError(404, "Admin not found."))
        }
    
        if(superAdmin.role !== AdminRole.SUPER_ADMIN) {
            return next(createError(403, "You need super admin privileges to perform this action."))
        }
        if(admin.role === AdminRole.ADMIN){
            return next(createError(400, "The user is not a super admin"))
        }
    const updatedAdmin = await AdminModel.updateOneById(id, {
        role: AdminRole.ADMIN
    })
    if(!updatedAdmin) {
        return next(createError(500, unknown_error))
    }
    res.json({
        status: "success",
        message: "User removed as super admin successfully",
        user: updatedAdmin
    })
} catch(error) {
    console.error(`Unable to remove user from super admin: ${error}`);
    return next(createError(500, server_error))
}
}

export const addNewAdmin = async(req: Request, res: Response, next: NextFunction) => {
    const values = req.body;

    try{
        const validatedData = AddNewAdminSchema.parse(values);
        const password = process.env.NEW_ADMIN_PASSWORD;
        if(!password) {
            return next(createError(400, "New admin password is required in the environment variable"))
        }
        const { personalEmail, phone, username , workEmail} = validatedData;
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
        const admin = await createAdmin({...data, role: AdminRole.ADMIN});
         res.status(201).json({ status: "success", message: "New admin added successfully", admin: userHandler(admin) });
    }catch(error) {
        console.error(`Unable to add new admin: ${error}`);
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



export const updateAdminProfile = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const values = req.body
    if(!userId) {
        return next(createError(401, unauthorized_error))
    }
    try{
const validatedData =  UpdateAdminProfileSchema.parse(values);

if (!validatedData || Object.keys(validatedData).length < 1) return next(createError(400, "At least one field must be provided."));
const admin = await  findAdminById(userId);
if(!admin) {
    return next(createError(404, "User not found"))
}

const uniqueError = await validateUniqueAdminIdentifiers(validatedData?.personalEmail, validatedData?.phone, validatedData?.username);

if (uniqueError) {
    return next(createError(400, uniqueError));
}

const fieldsToUpdate = Object.fromEntries(
    Object.entries(validatedData).filter(([key, value]) => value !== undefined)
);
const validFields = {
    ...fieldsToUpdate,
    ...(validatedData.personalEmail ? { personalEmail: validatedData.personalEmail.toLowerCase() } : {}),
    ...(validatedData.username ? { username: validatedData.username.toLowerCase() } : {}),

}
const updatedUser = await AdminModel.updateOneById(userId, validFields);
        if (!updatedUser) return next(createError(500, unknown_error));
        res.status(200).json({
            status: "success",
            message: "Updated user details successfully",
            user: userHandler(updatedUser)
        })
    } catch(error) {
        console.error(`Unable to update admin profile: ${error}`);
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


export const resetAdminPassword = async(req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId;

    if (!userId) return next(createError(401, unauthorized_error));

    if (!oldPassword || !newPassword || !confirmPassword) return next(createError(400, "All fields are required."));

    if (oldPassword.length < 6 || newPassword.length < 6 || confirmPassword.length < 6) return next(createError(400, "All fields must be at least 6 characters long."));

    if (newPassword !== confirmPassword) return next(createError(400, "New password and confirm password do not match."))
    try {

        const admin = await findAdminById(userId);
        if (!admin) return next(createError(404, "User not found."));
     
        const isOldPasswordCorrect = await validatePassword(oldPassword,
            admin.password);
        if (!isOldPasswordCorrect) return next(createError(400, "The old password you entered is incorrect."))
        const isPasswordTheSameAsLastOne = await validatePassword(
            newPassword,
            admin.password
        );
        if (isPasswordTheSameAsLastOne) return next(createError(400, "New password cannot be the same as the current one"));
        const hashedPassword = await hashPassword(newPassword)
        await AdminModel.updateOneById(admin.id, { password: hashedPassword });
        res.status(200).json({
            status: "success",
            message: "Password changed successfully",

        })

    } catch (error) {
        console.error(`Unable to  reset admin password: ${error}`)
        return next(createError(500, server_error))
    }
}


export const getAdminDetails = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if(!userId) {
        return next(createError(401, unauthorized_error));
    }

    try{
        const admin = await findAdminById(userId);
        if(!admin){
            return next(createError(404, "User not found."))
        }
        res.json({
            status: "success",
            message: "Admin details retrieved successfully",
            user: userHandler(admin)
        })

    }catch(error){
        console.error(`Unable to get admin details: ${error}`);
        return next(createError(500, server_error))
    }
}