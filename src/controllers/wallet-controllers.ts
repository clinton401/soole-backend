import { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import axios from "axios";
import createError from "http-errors"
import { unauthorized_error, server_error, unknown_error } from "../lib/variables";
import { UserModel } from "../nobox/record-structures/user";
import { PayoutModel, PayoutStatus, PayoutType } from "../nobox/record-structures/payout";
import { WalletModel, WalletStatus, WalletType } from "../nobox/record-structures/wallet";
import { isValidNumber, hasDecimal } from "../lib/utils"
import { TransactionModel, TransactionType, TransactionStatus } from "../nobox/record-structures/transaction";
import { addToUserWalletBalance, findWalletByUserId, createWallet } from "../data/wallet";
import { validatePassword } from "../lib/password-utils";
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

export const createUserWallet = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const type = req.query.type;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    const isDriver = type === "driver";
    const filter = isDriver ? WalletType.DRIVER : WalletType.USER
    try {
        const walletExists = await findWalletByUserId(userId, filter);
        if (walletExists) {
            return next(createError(400, "You already have an active wallet."))
        }
        const wallet = await createWallet(userId, filter);

        res.status(201).json({
            status: "success",
            message: "Wallet created successfully",
            wallet
        })
    } catch (error) {
        console.error(`Unable to create wallet for ${isDriver ? "driver" : "user"} wallet: ${error}: ${error}`);
        return next(createError(500, server_error))
    }
}
export const userWalletFundingInitialization = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { amount } = req.body;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    const validAmount = Number(amount)
    if (!isValidNumber(amount)) {
        return next(createError(400, "Make sure 'amount' is a number greater than or equal to 1."))
    }
    if (hasDecimal(validAmount)) {
        return next(createError(400, "Invalid amount: Please enter a whole number without decimals."))
    }

    try {
        const wallet = await findWalletByUserId(userId);
        if (!wallet) {
            return next(createError(400, "No wallet found for this user"))
        }
        if (wallet.status === WalletStatus.SUSPENDED) {
            return next(createError(400, "Your wallet is currently suspended. Please contact support for assistance"))

        }
        const user = await UserModel.findOne({ id: userId });
        if (!user) {
            return next(createError(404, "User not found."));

        }
        const { email } = user;

        if (!email) {
            return next(createError(400, "You do not have an email associated with your account."))
        }
        const transaction = await TransactionModel.insertOne({
            userId,
            amount: validAmount,
            currency: "₦",
            type: TransactionType.WALLET_FUNDING,
            status: TransactionStatus.PENDING,
            reference: `txn_${Date.now()}_${userId}`,
        });
        if (!transaction) {
            return next(createError(500, unknown_error));
        }

        console.log({transaction})

        io.emit('transaction', {...transaction, createdAt: new Date().toISOString()})


        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            {
                email,
                amount: amount * 100,
                currency: "NGN",
                reference: transaction.reference,
            },
            {
                headers: paystackHeaders,
            }
        );
        if (!response?.data?.status) {
            return next(createError(400, "Failed to initialize payment."))
        }
        res.status(200).json({
            status: "success",
            message: "Payment link created",
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference,
        });

    } catch (error) {
        console.error(`Unable to initiate paystack transaction: ${error}`);

        return next(createError(500, server_error))
    }
}

export const chargeUserSavedCard = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const { amount } = req.body;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    const validAmount = Number(amount)
    if (!isValidNumber(amount)) {
        return next(createError(400, "Make sure 'amount' is a number greater than or equal to 1."))
    }
    if (hasDecimal(validAmount)) {
        return next(createError(400, "Invalid amount: Please enter a whole number without decimals."))
    }
    try {
        const wallet = await findWalletByUserId(userId);
        if (!wallet) {
            return next(createError(400, "No wallet found for this user"))
        }
        if (wallet.status === WalletStatus.SUSPENDED) {
            return next(createError(400, "Your wallet is currently suspended. Please contact support for assistance"))

        }
        const { authorizationCode } = wallet
        if (!authorizationCode) {
            return next(createError(400, "No Authorization code found for this wallet"))
        }
        const user = await UserModel.findOne({ id: userId });
        if (!user) {
            return next(createError(404, "User not found."));

        }
        const { email } = user;
        const transaction = await TransactionModel.insertOne({
            userId,
            amount: validAmount,
            currency: "₦",
            type: TransactionType.WALLET_FUNDING,
            status: TransactionStatus.PENDING,
            reference: `txn_${Date.now()}_${userId}`,
        });
        if (!transaction) {
            return next(createError(500, unknown_error));
        }


        io.emit('transaction', {...transaction, createdAt: new Date().toISOString()})


        // Charge user using saved card
        const paystackResponse = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/charge_authorization`,
            {
                email,
                amount: amount * 100,
                currency: "NGN",
                reference: transaction.reference,
                authorization_code: authorizationCode,
            },
            { headers: paystackHeaders }
        );

        if (paystackResponse.data.data.status === "success") {

            const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
                status: TransactionStatus.SUCCESS
            });
            if (!updatedTransaction) {
                return next(createError(500, unknown_error));

            }
            io.emit('transaction:update', updatedTransaction)

            const updatedWallet = await addToUserWalletBalance(wallet, transaction);


            res.status(200).json({ success: true, message: "Wallet funded successfully using saved card", wallet: updatedWallet });
            return;
        } else {
            const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
                status: TransactionStatus.FAILED
            });
            if (!updatedTransaction) {
                return next(createError(500, unknown_error));

            }
            io.emit('transaction:update', updatedTransaction)
            return next(createError(400, "Transaction failed"));
        }
    } catch (error) {
        console.error("Error charging saved card:", error);
        return next(createError(400, server_error));
    }
}

export const verifyUserReference = async (req: Request, res: Response, next: NextFunction) => {
    const reference = req.params.reference;

    try {

        const response = await axios.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            headers: paystackHeaders,
        });
        const transaction = await TransactionModel.findOne({ reference });
        if (!transaction) {
            return next(createError("Transaction not found."))
        };
        if (transaction.status === TransactionStatus.SUCCESS) {
            return next(createError(400, "This transaction has already been verified."))
        }
        if (response.data.data.status === "success") {
            // const { authorization } = response.data.data;
            // const email = customer.email;


            const wallet = await findWalletByUserId(transaction.userId);
            if (!wallet) {
                return next(createError(404, "No wallet found for this user"))
            }
            if (wallet.status === WalletStatus.SUSPENDED) {
                return next(createError(400, "Your wallet is currently suspended. Please contact support for assistance"))

            }
            const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
                status: TransactionStatus.SUCCESS
            });
            if (!updatedTransaction) {
                return next(createError(500, unknown_error));

            }
            io.emit('transaction:update', updatedTransaction)
            await addToUserWalletBalance(wallet, transaction, wallet?.authorizationCode);
            res.status(200).json({
                success: true, message: "Transaction verified successfully. Wallet has been"
            });
            return
        } else {
            const updatedTransaction = await TransactionModel.updateOneById(transaction.id, {
                status: TransactionStatus.FAILED
            });
            if (!updatedTransaction) {
                return next(createError(500, unknown_error));

            }
            io.emit('transaction:update', updatedTransaction)
            return next(createError(400, "Transaction verification failed"))
        }


    } catch (error) {
        console.error(`Unable to verify paystack reference: ${error}`);
        return next(createError(500, server_error))
    }
}

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const type = req.query.type;
    if (!userId) {
        return next(createError(401, unauthorized_error))
    }
    const isDriver = type === "driver";
    const filter = isDriver ? WalletType.DRIVER : WalletType.USER
    try {
        const wallet = await findWalletByUserId(userId, filter);
        if (!wallet) {
            return next(createError(404, `No wallet found for this ${isDriver ? "driver" : "user"}. Please try creating one.`));

        }
        res.json({
            status: "success",
            message: "Wallet retrieved successfully",
            wallet
        })

    } catch (error) {
        console.error(`Unable to get ${isDriver ? "driver" : "user"} wallet: ${error}`);
        return next(createError(500, server_error))
    }
}

const createTransferRecipient = async (bank_name: string, account_number: string) => {
    try {

        const response = await axios.get(`${PAYSTACK_BASE_URL}/bank`, {
            headers: paystackHeaders,
        });

        if (!response?.data?.status) {
            throw new Error("Failed to fetch banks from Paystack");
        }
        const banks = response.data.data;

        // console.log({banks})

        const bank = banks.find((b: any) => b.name.toLowerCase() === bank_name.toLowerCase());
        if (!bank) throw new Error("Invalid bank name provided");

        const bank_code = bank.code;

        // Create the recipient
        const recipientResponse = await axios.post(`${PAYSTACK_BASE_URL}/transferrecipient`, {
            type: "nuban",
            name: "Recipient Name", // Change as needed
            account_number,
            bank_code,
            currency: "NGN",
        }, {
            headers: paystackHeaders,
        });
        if (!recipientResponse?.data?.status) {
            throw new Error("Failed to create transfer recipient");
        }
        return recipientResponse.data.data.recipient_code;

    } catch (error) {
        throw error;
    }
};



const initiateTransfer = async (recipient_code: string, amount: number) => {
    try {

        const transferResponse = await axios.post(`${PAYSTACK_BASE_URL}/transfer`, {
            source: "balance",
            amount: amount * 100,
            recipient: recipient_code,
            reason: "Wallet withdrawal",
        }, {
            headers: paystackHeaders,
        });

        if (!transferResponse.data.status) {
            // throw new Error("Failed to initiate transfer");
            return undefined
        }
        // const balance = wallet.balance - amount;

        // const lastTransactionAt = new Date().toISOString();

        return transferResponse.data.data;

    } catch (error) {
        console.error(`Unable to inititate transfer: ${error}`);
        return undefined
        // throw error;
    }
};



export const transferFunds = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return next(createError(401, unauthorized_error));
    }
    try {
        const { bank_name, account_number, amount, password, account_name } = req.body;
        if (!password) {
            return next(createError(401, "Password is required"))
        }
        const user = await UserModel.findOne({ id: userId });
        if (!user) {
            return next(createError("User not found."))
        }
        if (!user.password) {
            return next(createError(400, "Password not found for this user"))
        }

        const isPasswordCorrect = await validatePassword(password, user.password);

        if (!isPasswordCorrect) {
            return next(createError(400, "Password is incorrect"))
        }

        if (!bank_name || !account_number || !amount || !account_name) {
            return next(new Error("Bank name, account number, account name, and amount are required"));
        }
        const validAmount = Number(amount)
        if (!isValidNumber(amount)) {
            return next(createError(400, "Make sure 'amount' is a number greater than or equal to 1."))
        }
        if (hasDecimal(validAmount)) {
            return next(createError(400, "Invalid amount: Please enter a whole number without decimals."))
        }

        const wallet = await findWalletByUserId(userId, WalletType.DRIVER);
        if (!wallet) {
            return next(createError(404, "No wallet found for this user"))
        }
        if (wallet.balance < amount) {
            return next(createError(400, "Insufficient funds in your wallet to complete this transfer"));

        }

        let recipient_code;
        if (wallet?.recipientCode && wallet?.prevBankName?.toLowerCase() === bank_name.toLowerCase()) {
            recipient_code = wallet.recipientCode
        } else {
            recipient_code = await createTransferRecipient(bank_name, account_number);
            const updatedWallet = await WalletModel.updateOneById(wallet.id, {
                recipientCode: recipient_code,
                prevBankName: bank_name.toLowerCase(),
                prevAccountNo: String(account_number),
                prevAccountHolderName: account_name


            });
            if (updatedWallet) {
                io.emit("wallet:update", updatedWallet)
            }
            // if (!updatedWallet) {
            //     throw new Error("Unable to update wallet")
            // }
        }


        const transferData = await initiateTransfer(recipient_code, validAmount);


        // console.log({transferData})

        if (transferData) {
            const reference = transferData?.reference;
            const userName = `${user.firstName} ${user.lastName}`
            const payout = await PayoutModel.insertOne({
                userId: wallet.userId,
                requesterId: wallet.userId,
                amount: validAmount,
                userName,
                type: PayoutType.WITHDRAWAL,
                status: PayoutStatus.PENDING,
                reference,
                adminViewable: true
            })
            if (!payout) {
                throw new Error(unknown_error)
            }
            io.emit("payout", payout)
        } else {
            return next(createError(500, "Unable to transfer funds"))
        }


        res.status(200).json({
            success: true,
            message: "Transfer initiated successfully",
            data: transferData,
        });

    } catch (error) {
        console.error("Error processing transfer:", error);
        return next(createError(500, server_error));
    }
};