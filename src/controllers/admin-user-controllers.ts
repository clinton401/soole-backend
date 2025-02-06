import {Request, Response, NextFunction} from "express";
import {UserModel, UserStatus} from "../nobox/record-structures/user";
import {server_error, unknown_error} from "../lib/variables"
import {adminPaginationOptions, getPageInfo} from "../lib/utils"
import createError from "http-errors"
export const getAllUsersForAdmin = async(req: Request, res: Response, next: NextFunction) => {
const {filter, page} = req.query as {
    filter?: string;
    page?: string
}
const validFilters = ['active', 'inactive', 'deactivated', "suspended"];
const selectedFilter = filter && validFilters.includes( filter.toLowerCase()) ? filter.toLowerCase() : 'active';



const status = selectedFilter.toUpperCase() as UserStatus;
const currentPage = Math.max(1, Number(page) || 1);
const pageSize = 15;

try{
    const options = adminPaginationOptions(currentPage, pageSize);
    const users = await UserModel.find({status}, options);
if(!users) {
    return next(createError(500, unknown_error));
}
const {totalLength: totalUsers, totalPages, nextPage }  = getPageInfo(users, pageSize, currentPage)
        
        res.json({
            status: "success",
            message: "Users found successfully",
            data: {
                users,
                totalUsers,
                totalPages,
                currentPage,
                nextPage
            }
        })
}catch(error) {
    console.error(`Unable to get all users for admin: ${error}`);
    return next(createError(500, server_error))
}
}

export const suspendUser = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;


    try{

        const user = await UserModel.findOne({id: userId});
        if(!user) {
            return next(createError(404, "User not found."))
        }
        if(user.status === UserStatus.DEACTIVATED) {
            return next(createError(403, "Cannot suspend a deactivated account."))
        }
        if(user.status === UserStatus.SUSPENDED) {
            return next(createError(403, "This account is already suspended."))
        }
const updatedUser = await UserModel.updateOneById(user.id, {

    status: UserStatus.SUSPENDED
});
if(!updatedUser) {
    return next(createError(500, unknown_error))
}

res.json({
    status: "success",
    message: "Account suspended successsfully",
    user: updatedUser
})
    }catch(error){
        console.error(`Unable to suspend user: ${error}`);
        return next(createError(500, server_error))
    }
}


export const reactivateUser = async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    try{
const user = await UserModel.findOne({id: userId});
if(!user) {
    return next(createError(404, "User not found."))
}
if(user.status === UserStatus.ACTIVE) {
    return next(createError(403, "This account is already active." ))
}

const updatedUser = await UserModel.updateOneById(user.id, {

status: UserStatus.ACTIVE
});
if(!updatedUser) {
return next(createError(500, unknown_error))
}
res.json({
    status: "success",
    message: "Account successfully reactivated.",
    user: updatedUser
})
    }catch(error){
        console.error(`Unable to reactivate user: ${error}`);
        return next(createError(500, server_error));
    }
}