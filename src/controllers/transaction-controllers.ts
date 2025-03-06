import { Request, Response, NextFunction } from "express";
import { TransactionModel, TransactionType, TransactionStatus } from "../nobox/record-structures/transaction";
import createError from "http-errors"
import { unauthorized_error, server_error, unknown_error } from "../lib/variables";
import {paginationOptions, getUserPageInfo} from "../lib/utils"


export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    const {page} = req.query as {
        page?: string
    }
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    const currentPage = Math.max(1, Number(page) || 1);
    try {
 const options = paginationOptions()

        const transactions = await TransactionModel.find({ userId }, options);
        if(!transactions){
            return next(createError(500, unknown_error))
        }
        const pageSize = 15;
        const data = getUserPageInfo(transactions, pageSize, currentPage, "transactions");
        res.json({
            status: "success",
            message: "Transactions retreived successfully",
            data
        })
    } catch (error) {
        console.error(`Unable to get user's transactions: ${error}`);
        return next(createError(500, server_error))
    }
}