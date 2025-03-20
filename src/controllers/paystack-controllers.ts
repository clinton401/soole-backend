import { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import axios from "axios";
import createError from "http-errors"
import { unauthorized_error, server_error, unknown_error } from "../lib/variables";
import { UserModel } from "../nobox/record-structures/user";
import { PayoutModel, PayoutStatus, PayoutType } from "../nobox/record-structures/payout";
import { WalletModel, WalletStatus, WalletType, Wallet } from "../nobox/record-structures/wallet";
import { isValidNumber, hasDecimal } from "../lib/utils"
import { TransactionModel, TransactionType, TransactionStatus } from "../nobox/record-structures/transaction";
import { addToUserWalletBalance, findWalletByUserId, deductFromWallet } from "../data/wallet";
import { validatePassword } from "../lib/password-utils";
import crypto from "crypto";
import { io } from "..";
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


export const paystackWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {


        // Verify webhook signature
        const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest("hex");
        if (hash !== req.headers["x-paystack-signature"]) {
            return next(createError(401, "Unauthorized webhook request."));
        }

        const event = req.body;
        // console.log("Paystack webhook received:", event);

        if (event.event === "charge.success") {
            const reference = event.data.reference;


            const transaction = await TransactionModel.findOne({ reference });
            if (!transaction) {
                return next(createError(404, "Transaction not found."));
            }

            if (transaction.status === TransactionStatus.SUCCESS) {
                res.status(200).json({ success: true, message: "Transaction already processed." });
                return;
            }



            const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
                status: TransactionStatus.SUCCESS,
            });

            if (!updatedTransaction) {
                return next(createError(500, "Failed to update transaction status."));
            }

            io.emit('transaction:update', updatedTransaction)
            const wallet = await findWalletByUserId(transaction.userId);
            if (!wallet) {
                return next(createError(404, "No wallet found for this user."));
            }

            if (wallet.status === WalletStatus.SUSPENDED) {
                return next(createError(400, "Wallet is suspended. Please contact support."));
            }



            const updatedWallet = await addToUserWalletBalance(wallet, transaction, event.data.authorization?.authorization_code);
            // io.emit("wallet:funded", updatedWallet);
            // io.emit("transaction:success", updatedTransaction);

            res.status(200).json({
                success: true,
                message: "Wallet funded successfully via webhook.",
                wallet: updatedWallet,
            });
            return;
        }
        if (event.event === "charge.failed") {
            const reference = event.data.reference;

            const transaction = await TransactionModel.findOne({ reference });
            if (!transaction) {
                return next(createError(404, "Transaction not found."));
            }

            if (transaction.status === TransactionStatus.FAILED) {
                res.status(200).json({ success: true, message: "Transaction already marked as failed." });
                return;
            }

            // Update transaction status to FAILED
            const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
                status: TransactionStatus.FAILED,
            });

            if (!updatedTransaction) {
                return next(createError(500, "Failed to update transaction status."));
            }

            // Emit WebSocket event for UI updates
            io.emit("transaction:update", updatedTransaction);

            res.status(200).json({
                success: true,
                message: "Transaction marked as failed.",
                transaction: updatedTransaction,
            });
            return;
        }

        if (event.event === "transfer.success") {
            const transferReference = event.data.reference;
            const payout = await PayoutModel.findOne({ reference: transferReference });

            if (!payout) {
                return next(createError(404, "Transfer record not found."));
            }

            if (payout.status === PayoutStatus.SUCCESSFUL) {
                res.status(200).json({ success: true, message: "Transfer already processed." });
                return;
            }

            const updatedPayout = await PayoutModel.updateOneById(payout.id, { status: PayoutStatus.SUCCESSFUL });
            if (updatedPayout) {
                io.emit("payout:update", updatedPayout)
            }

            const wallet = await findWalletByUserId(payout.userId);
            if (!wallet) {
                return next(createError(404, "No wallet found for this user."));
            }

            if (wallet.status === WalletStatus.SUSPENDED) {
                return next(createError(400, "Wallet is suspended. Please contact support."));
            }
            if (wallet.balance < payout.amount) {
                return next(createError(400, "Insufficient funds in your wallet to complete this transfer"));

            }
            await deductFromWallet(wallet.id, payout.amount, wallet.balance);

            res.status(200).json({ success: true, message: "Transfer successfully processed." });
            return;
        }
        if (event.event === "transfer.failed") {
            // console.log("Fund transfer failed:", event.data);

            const transferReference = event.data.reference;
            const payout = await PayoutModel.findOne({ reference: transferReference });

            if (!payout) {
                return next(createError(404, "Transfer record not found."));
            }

            const updatedPayout = await PayoutModel.updateOneById(payout.id, { status: PayoutStatus.FAILED });
            if (updatedPayout) {
                io.emit("payout:update", updatedPayout)
            }



            res.status(200).json({ success: true, message: "Transfer marked as failed, and user refunded." });
            return;
        }




        res.status(200).json({ success: true, message: "Event received, but not processed." });

    } catch (error) {
        console.error("Paystack Webhook Error:", error);
        return next(createError(500, "An error occurred while processing the webhook."));
    }
};

export const getBanks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
            headers: paystackHeaders,
        })
        const banks = response?.data?.data;
        if (!banks) {
            return next(createError(500, unknown_error))
        };
        const filteredBanks = banks.filter((bank: any) => bank?.supports_transfer === true && bank?.is_deleted == false && bank?.active == true);
        const reducedArray = filteredBanks.map((bank: any) => {
            return {
                name: bank?.name,
                id: bank?.id,
                code: bank?.code
            }
        })
        res.json(
            {
                status: "success",
                banks: reducedArray
            }
        );
    } catch (error) {
        console.error(`Unable to get paystack banks: ${error}`);
        return next(createError(500, server_error))
    }
}


