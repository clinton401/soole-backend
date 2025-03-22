import { Request, Response, NextFunction } from "express";
import { UserModel, UserStatus, User } from "../nobox/record-structures/user";
import { server_error, unknown_error } from "../lib/variables"
import { adminPaginationOptions, getPageInfo } from "../lib/utils"
import createError from "http-errors"
export const getAllUsersForAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { filter, page } = req.query as {
        filter?: string;
        page?: string
    }
    const validFilters = ['active', 'inactive', 'deactivated', "suspended"];
    const selectedFilter = filter && validFilters.includes(filter.toLowerCase()) ? filter.toLowerCase() : null;



    const filterVariable = selectedFilter?.toUpperCase() as UserStatus || null;
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;

    try {
        const options = adminPaginationOptions(currentPage, pageSize);
        let users: User[] = [];
        if(filterVariable ){
            users = await UserModel.find({status: filterVariable}, options);
        } else {
            users = await UserModel.find({adminViewable: true}, options);
        }
        if (!users) {
            return next(createError(500, unknown_error));
        }
        const validUsers = users.filter(user => {
            const { password, isNumberVerified, email, status } = user
            if (!password || !isNumberVerified || !email || !status) return false;
            return true;
        })
        const { totalLength: totalUsers, totalPages, nextPage, filteredData, prevPage } = getPageInfo(validUsers, pageSize, currentPage)

        res.json({
            status: "success",
            message: "Users found successfully",
            data: {
                users: filteredData,
                totalUsers,
                totalPages,
                currentPage,
                nextPage,
                prevPage
            }
        })
    } catch (error) {
        console.error(`Unable to get all users for admin: ${error}`);
        return next(createError(500, server_error))
    }
}

export const suspendUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;


    try {

        const user = await UserModel.findOne({ id: userId });
        if (!user) {
            return next(createError(404, "User not found."))
        }
        if (user.status === UserStatus.DEACTIVATED) {
            return next(createError(403, "Cannot suspend a deactivated account."))
        }
        if (user.status === UserStatus.SUSPENDED) {
            return next(createError(403, "This account is already suspended."))
        }
        const updatedUser = await UserModel.updateOneById(user.id, {

            status: UserStatus.SUSPENDED
        });
        if (!updatedUser) {
            return next(createError(500, unknown_error))
        }

        res.json({
            status: "success",
            message: "Account suspended successsfully",
            user: updatedUser
        })
    } catch (error) {
        console.error(`Unable to suspend user: ${error}`);
        return next(createError(500, server_error))
    }
}


export const reactivateUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    try {
        const user = await UserModel.findOne({ id: userId });
        if (!user) {
            return next(createError(404, "User not found."))
        }
        if (user.status === UserStatus.ACTIVE) {
            return next(createError(403, "This account is already active."))
        }

        const updatedUser = await UserModel.updateOneById(user.id, {

            status: UserStatus.ACTIVE
        });
        if (!updatedUser) {
            return next(createError(500, unknown_error))
        }
        res.json({
            status: "success",
            message: "Account successfully reactivated.",
            user: updatedUser
        })
    } catch (error) {
        console.error(`Unable to reactivate user: ${error}`);
        return next(createError(500, server_error));
    }
}
export const searchForUser = async (req: Request, res: Response, next: NextFunction) => {
    const { query, page, filter } = req.query as {
        query?: string;
        page?: string,
        filter: string
    };
    if (!query || query.length < 1) {
        return next(createError(400, "Search query is required and must be at least 1 character long."))
    }

    const validFilters = ['active', 'inactive', 'deactivated', "suspended"];
    const selectedFilter = filter && validFilters.includes(filter.toLowerCase()) ? filter.toLowerCase() : null;



    const filterVariable = selectedFilter?.toUpperCase() as UserStatus || null;
    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = 15;
    const options = adminPaginationOptions(currentPage, pageSize);

    try {
        const users = await UserModel.find({adminViewable: true}, options);
        if (!users) {
            return next(createError(500, unknown_error))
        }

        // console.log({filterVariable, users})    
        const validUsers = users.filter(user => {
            const { firstName, lastName, email, username, status, isNumberVerified } = user;


            if (!firstName || !lastName || !email || !username || !isNumberVerified) {
                return false;
            }




            const matchesStatus = filterVariable && status !== filterVariable ? false : true;


            const matchesQuery = [firstName, lastName, email, username]
                .some(field => field.toLowerCase().includes(query.toLowerCase()));
            return matchesStatus && matchesQuery;
        });

        res.json({
            status: "success",
            message: "Users found successfully",
            data: {
                users: validUsers.slice(0, pageSize)
            }
        })


    } catch (error) {
        console.error(`Unable to search for user by admin: ${error}`);
        return next(createError(500, server_error))
    }
}