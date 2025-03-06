import { Request, Response, NextFunction } from "express"
import { PayoutModel } from "../nobox/record-structures/payout";
import { paginationOptions, getUserPageInfo } from "../lib/utils";
import createError from "http-errors";
import { server_error, unauthorized_error, unknown_error } from "../lib/variables";


export const getDriverPayouts = async (req: Request, res: Response, next: NextFunction) => {
    const {page} = req.query as {
        page?: string
    }
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    const currentPage = Math.max(1, Number(page) || 1);
    try {
        const options = paginationOptions();
        const payouts = await PayoutModel.find({
            userId
        }, options);
        if(!payouts) {
            return next(createError(500, unknown_error))
        }
        const pageSize = 15;
        const data = getUserPageInfo(payouts, pageSize, currentPage, "payouts");
        res.json({
            status: "success",
            message: "Payouts received successfully",
            data
        })
    } catch (error) {
        console.error(`Unable to get driver's payouts: ${error}`);
        return next(createError(500, server_error))
    }
}