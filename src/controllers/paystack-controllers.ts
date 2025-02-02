import { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import axios from "axios";
import createError from "http-errors"
import { unauthorized_error, server_error, unknown_error } from "../lib/variables";
import { UserModel } from "../nobox/record-structures/user";
import { WalletModel } from "../nobox/record-structures/wallet";
import { isValidNumber } from "../lib/utils"
import { TransactionModel, TransactionType, TransactionStatus } from "../nobox/record-structures/transaction";
import { addToUserWalletBalance } from "../data/wallet";
config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is required")
}
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackHeaders = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
};


// export const verifyReference = async (req: Request, res: Response, next: NextFunction) => {
//     const reference = req.params.reference;

//     try {

//         const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
//             headers: paystackHeaders,
//         });
//         const transaction = await TransactionModel.findOne({ reference });
//         if (!transaction) {
//             return next(createError("Transaction not found."))
//         };
//         if (transaction.status === TransactionStatus.SUCCESS) {
//             return next(createError(400, "This transaction has already been verified."))
//         }
//         if (response.data.data.status === "success") {
//             const { authorization } = response.data.data;
//             // const email = customer.email;


//             const wallet = await WalletModel.findOne({ userId: transaction.userId });
//             if (!wallet) {
//                 return next(createError(404, "No wallet found for this user"))
//             }
//             const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
//                 status: TransactionStatus.SUCCESS
//             });
//             if (!updatedTransaction) {
//                 return next(createError(500, unknown_error));

//             }


//             const updatedWallet = await addToWalletBalance(wallet, transaction, authorization?.authorization_code);
//             res.status(200).json({
//                 success: true, message: "Wallet funded successfully", wallet: updatedWallet
//             });
//             return
//         } else {
//             const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
//                 status: TransactionStatus.FAILED
//             });
//             if (!updatedTransaction) {
//                 return next(createError(500, unknown_error));

//             }
//             return next(createError(400, "Transaction verification failed"))
//         }


//     } catch (error) {
//         console.error(`Unable to verify paystack reference: ${error}`);
//         return next(createError(500, server_error))
//     }
// }