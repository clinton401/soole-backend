import {Request, Response, NextFunction} from "express";
import {UserModel, UserStatus} from "../nobox/record-structures/user";
import {server_error, unknown_error} from "../lib/variables"
import {adminPaginationOptions} from "../lib/utils"
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

}catch(error) {
    console.error(`Unable to get all users for admin: ${error}`);
    return createError(500, server_error)
}
}