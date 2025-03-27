import { AdminModel, AdminRole, Admin } from "../nobox/record-structures/admin";
import { PayoutModel, PayoutType, PayoutStatus } from "../nobox/record-structures/payout";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { unauthorized_error, unknown_error, server_error } from "../lib/variables";
import { AddNewAdminSchema, UpdateAdminProfileSchema } from "../schemas";
import { config } from "dotenv";
import { userHandler, zodErrorHandler, getDates, getUserPageInfo, adminPaginationOptions, isValidNumber, isValidImage } from "../lib/utils";
import { validateUniqueAdminIdentifiers, createAdmin, findAdminById } from "../data/admin";
import { hashPassword, validatePassword,  } from "../lib/password-utils";
import { ZodError } from "zod";
import { superAdminPromotionEmailTemplate, superAdminDemotionEmailTemplate, newAdminEmailTemplate } from "../lib/html-templates";
import { sendEmail } from "../data/mail";
import { UserModel } from "../nobox/record-structures/user";
import { getUserAnalytics, getUsersWeeklyGrowth } from "../data/user";
import { getRideAnalytics } from "../data/ride";
import { getPayoutYearlyOverview } from "../data/payout";
config()

export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const {page} = req.query as {
        page?: string
    }
    const currentPage = Math.max(1, Number(page) || 1);
    if (!userId) {
        return next(createError(401, unauthorized_error))
    };
    
    const pageSize = 15;
    const options = adminPaginationOptions(currentPage, pageSize);
    try {
        const admins = await AdminModel.find({}, options);
        if (!admins) {
            return next(createError(500, unknown_error))
        }
        const adminsWithoutPassword = admins.map(admin => {
            return userHandler(admin)
        })
        const filteredAdmins = adminsWithoutPassword.filter(admin => admin.id !== userId);
        const data = getUserPageInfo(filteredAdmins, pageSize, currentPage, "admins");
        res.json({
            status: "success",
            message: "Admins found successfully",
            data
        })
    } catch (error) {
        console.error(`Unable to find all admins: ${error}`);
        return next(createError(500, server_error))
    }
}
export const makeSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const id = req.params.id
    if (!userId) {
        return next(createError(401, unauthorized_error))
    };

    if (userId === id) {
        return next(createError("You can not make yourself a super admin"))
    }
    try {
        const [superAdmin, admin] = await Promise.all([
            findAdminById(userId),
            findAdminById(id),

        ])

        if (!superAdmin) {
            return next(createError(404, "User not found."))
        }
        if (!admin) {
            return next(createError(404, "Admin not found."))
        }

        if (superAdmin.role !== AdminRole.SUPER_ADMIN) {
            return next(createError(403, "You need super admin privileges to perform this action."))
        }
        if (admin.role === AdminRole.SUPER_ADMIN) {
            return next(createError(400, "The user is already a super admin."))
        }
        const updatedAdmin = await AdminModel.updateOneById(id, {
            role: AdminRole.SUPER_ADMIN
        })
        if (!updatedAdmin) {
            return next(createError(500, unknown_error))
        }
        const { text, template, subject } = superAdminPromotionEmailTemplate(updatedAdmin.personalEmail);

        await sendEmail(updatedAdmin.personalEmail, subject, text, template)

        res.json({
            status: "success",
            message: "User made a super admin successfully",
            user: userHandler(updatedAdmin)
        })
    } catch (error) {
        console.error(`Unable to make admin a super admin: ${error}`);
        return next(createError(500, server_error))
    }
}


export const removeFromSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const id = req.params.id
    if (!userId) {
        return next(createError(401, unauthorized_error))
    };
    if (userId === id) {
        return next(createError("You can not remove yourself as a super admin"))
    }
    try {
        const [superAdmin, admin] = await Promise.all([
            findAdminById(userId),
            findAdminById(id),

        ])

        if (!superAdmin) {
            return next(createError(404, "User not found."))
        }
        if (!admin) {
            return next(createError(404, "Admin not found."))
        }

        if (superAdmin.role !== AdminRole.SUPER_ADMIN) {
            return next(createError(403, "You need super admin privileges to perform this action."))
        }
        if (admin.role === AdminRole.ADMIN) {
            return next(createError(400, "The user is not a super admin"))
        }
        const updatedAdmin = await AdminModel.updateOneById(id, {
            role: AdminRole.ADMIN
        })
        if (!updatedAdmin) {
            return next(createError(500, unknown_error))
        }

        const { text, template, subject } = superAdminDemotionEmailTemplate(updatedAdmin.personalEmail);

        await sendEmail(updatedAdmin.personalEmail, subject, text, template)
        res.json({
            status: "success",
            message: "User removed as super admin successfully",
            user: userHandler(updatedAdmin)
        })
    } catch (error) {
        console.error(`Unable to remove user from super admin: ${error}`);
        return next(createError(500, server_error))
    }
}

export const addNewAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const values = req.body;  
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    };

    try {
        const superAdmin = await  findAdminById(userId);
        if(!superAdmin){
            return next(createError(404, "User not found"))
        }

        if (superAdmin.role !== AdminRole.SUPER_ADMIN) {
            return next(createError(403, "You need super admin privileges to perform this action."))
        }

        const validatedData = AddNewAdminSchema.parse(values);

        const password = process.env.NEW_ADMIN_PASSWORD;
        if (!password) {
            return next(createError(400, "New admin password is required in the environment variable"))
        }
        const { personalEmail, phone, name, workEmail } = validatedData;
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
        }
        const admin = await createAdmin({ ...data, role: AdminRole.ADMIN, adminViewable: true });
        const { text, template, subject } = newAdminEmailTemplate(admin.personalEmail, password);

        await sendEmail(admin.personalEmail, subject, text, template)

        res.status(201).json({ status: "success", message: "New admin added successfully", admin: userHandler(admin) });
    } catch (error) {
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



export const updateAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const values = req.body
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    try {
        const validatedData = UpdateAdminProfileSchema.parse(values);

        if (!validatedData || Object.keys(validatedData).length < 1) return next(createError(400, "At least one field must be provided."));
        const admin = await findAdminById(userId);
        if (!admin) {
            return next(createError(404, "User not found"))
        }
        const { personalEmail, phone, name, avatarUrl } = validatedData
        if (personalEmail || phone ) {
            const uniqueError = await validateUniqueAdminIdentifiers(personalEmail, phone);

            if (uniqueError) {
                return next(createError(400, uniqueError));
            }
        }
        if (avatarUrl && !isValidImage(avatarUrl)) {
            return next(createError(400, "Inavlid avatar url image"))
        }

        const fieldsToUpdate = Object.fromEntries(
            Object.entries(validatedData).filter(([key, value]) => value !== undefined)
        );
        const validFields = {
            ...fieldsToUpdate,
            ...(personalEmail ? { personalEmail: personalEmail.toLowerCase() } : {}),
            ...(name ? { name: name.toLowerCase() } : {}),

        }
        const updatedUser = await AdminModel.updateOneById(userId, validFields);
        if (!updatedUser) return next(createError(500, unknown_error));
        res.status(200).json({
            status: "success",
            message: "Updated user details successfully",
            user: userHandler(updatedUser)
        })
    } catch (error) {
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


export const resetAdminPassword = async (req: Request, res: Response, next: NextFunction) => {
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

export const deleteAdminProfilePicture = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
        return next(createError(401, unauthorized_error));
    }
    try {
        const admin = await findAdminById(userId);
        if (!admin) {
            return next(createError(404, "User not found."))
        }
        if (!admin?.avatarUrl) {
            return next(createError(400, "You don't have a profile picture to delete."))
        }
        const updatedAdmin = await UserModel.updateOneById(userId, { avatarUrl: undefined });
        if (!updatedAdmin) {
            return next(createError(500, unknown_error));
        };
        res.json({
            status: "success",
            message: "Admin profile picture deleted successfully",
            user: userHandler(updatedAdmin)
        })

    } catch (error) {
        console.error(`Unable to delete admin profile picture: ${error}`);
        return next(createError(500, server_error))
    }
}
export const getAdminDetails = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    if (!userId) {
        return next(createError(401, unauthorized_error));
    }

    try {
        const admin = await findAdminById(userId);
        if (!admin) {
            return next(createError(404, "User not found."))
        }
        res.json({
            status: "success",
            message: "Admin details retrieved successfully",
            user: userHandler(admin)
        })

    } catch (error) {
        console.error(`Unable to get admin details: ${error}`);
        return next(createError(500, server_error))
    }
}

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    const { filter, year } = req.query as {
        filter?: string;
        year?: string
    }
    let weeksAgo = 0;
    const week = Number(filter);
    if (week && week >= 1) {
        weeksAgo = Math.floor(week);
    }
    let validYear = new Date().getFullYear();
    if (year && isValidNumber(year)) {
        validYear = Number(year);
    }
    const { yesterday, today } = getDates();

    try {
        const [usersGrowth, ridesGrowth, day_counts, month_counts] = await Promise.all([
            getUserAnalytics(yesterday, today),
            getRideAnalytics(yesterday, today),
            getUsersWeeklyGrowth(weeksAgo),
            getPayoutYearlyOverview(validYear)

        ]);
        const { totalRidesGrowth, activeRidesGrowth, completedRidesGrowth } = ridesGrowth;

        res.json({
            status: "success",
            message: "Analytics found successfully",
            data: {
                growth: {
                    users: usersGrowth,
                    total_rides: totalRidesGrowth,
                    active_rides: activeRidesGrowth,
                    completed_rides: completedRidesGrowth
                },
                day_counts,
                month_counts

            }
        })
    } catch (error) {
        console.error(`Unable to get analytics for admin: ${error}`);
        return next(createError(500, server_error))
    }
}

export const getUsersAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    const { filter } = req.query as {
        filter?: string;
    }
    let weeksAgo = 0;
    const week = Number(filter);
    if (week && week >= 1) {
        weeksAgo = Math.floor(week);
    }
    try {

        const dayCounts = await getUsersWeeklyGrowth(weeksAgo)
        res.json({ status: "success", message: "Users analytics found succesfully", data: dayCounts })
    } catch (error) {
        console.error(`Unable to get users anaylytics: ${error}`);
        return next(createError(500, server_error))
    }
}

export const getRevenueOverview = async (req: Request, res: Response, next: NextFunction) => {
    const { year } = req.query as {
        year?: string
    };
    let validYear = new Date().getFullYear();
    if (year && isValidNumber(year)) {
        validYear = Number(year);
    }
    try {

        const monthCounts = await getPayoutYearlyOverview(validYear)
        res.json({ status: "success", message: "Payout overview found succesfully", data: monthCounts })
    } catch (error) {
        console.error(`Unable to get revenue overview: ${error}`);
        return next(createError(500, server_error));
    }
}


