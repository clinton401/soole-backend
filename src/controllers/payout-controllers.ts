import { Request, Response, NextFunction } from "express"
import { PayoutModel } from "../nobox/record-structures/payout";
import { paginationOptions } from "../lib/utils";
import createError from "http-errors";
import { server_error, unauthorized_error } from "../lib/variables";


export const getDriverPayouts = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    try {
        const options = paginationOptions();
        const payouts = await PayoutModel.find({
            userId
        }, options);
        res.json({
            status: "success",
            message: "Payouts received successfully",
            payouts
        })
    } catch (error) {
        console.error(`Unable to get driver's payouts: ${error}`);
        return next(createError(500, server_error))
    }
}