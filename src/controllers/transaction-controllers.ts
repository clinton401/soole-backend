import { Request, Response, NextFunction } from "express";
import { TransactionModel, TransactionType, TransactionStatus } from "../nobox/record-structures/transaction";
import createError from "http-errors"
import { unauthorized_error, server_error, unknown_error } from "../lib/variables";
import {paginationOptions} from "../lib/utils"


export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    try {
 

        const transactions = await TransactionModel.find({ userId }, paginationOptions());
        res.json({
            status: "success",
            message: "Transactions retreived successfully",
            transactions
        })
    } catch (error) {
        console.error(`Unable to get user's transactions: ${error}`);
        return next(createError(500, server_error))
    }
}