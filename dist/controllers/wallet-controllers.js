"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferFunds = exports.getWallet = exports.verifyUserReference = exports.chargeUserSavedCard = exports.userWalletFundingInitialization = exports.createUserWallet = void 0;
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const user_1 = require("../nobox/record-structures/user");
const payout_1 = require("../nobox/record-structures/payout");
const wallet_1 = require("../nobox/record-structures/wallet");
const utils_1 = require("../lib/utils");
const transaction_1 = require("../nobox/record-structures/transaction");
const wallet_2 = require("../data/wallet");
const password_utils_1 = require("../lib/password-utils");
(0, dotenv_1.config)();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is required");
}
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const paystackHeaders = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
};
const createUserWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const type = req.query.type;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    const isDriver = type === "driver";
    const filter = isDriver ? wallet_1.WalletType.DRIVER : wallet_1.WalletType.USER;
    try {
        const walletExists = yield (0, wallet_2.findWalletByUserId)(userId, filter);
        if (walletExists) {
            return next((0, http_errors_1.default)(400, "You already have an active wallet."));
        }
        const wallet = yield (0, wallet_2.createWallet)(userId, filter);
        res.status(201).json({
            status: "success",
            message: "Wallet created successfully",
            wallet
        });
    }
    catch (error) {
        console.error(`Unable to create wallet for ${isDriver ? "driver" : "user"} wallet: ${error}: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.createUserWallet = createUserWallet;
const userWalletFundingInitialization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.userId;
    const { amount } = req.body;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    const validAmount = Number(amount);
    if (!(0, utils_1.isValidNumber)(amount)) {
        return next((0, http_errors_1.default)(400, "Make sure 'amount' is a number greater than or equal to 1."));
    }
    if ((0, utils_1.hasDecimal)(validAmount)) {
        return next((0, http_errors_1.default)(400, "Invalid amount: Please enter a whole number without decimals."));
    }
    try {
        const wallet = yield (0, wallet_2.findWalletByUserId)(userId);
        if (!wallet) {
            return next((0, http_errors_1.default)(400, "No wallet found for this user"));
        }
        if (wallet.status === wallet_1.WalletStatus.SUSPENDED) {
            return next((0, http_errors_1.default)(400, "Your wallet is currently suspended. Please contact support for assistance"));
        }
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        const { email } = user;
        if (!email) {
            return next((0, http_errors_1.default)(400, "You do not have an email associated with your account."));
        }
        const transaction = yield transaction_1.TransactionModel.insertOne({
            userId,
            amount: validAmount,
            currency: "₦",
            type: transaction_1.TransactionType.WALLET_FUNDING,
            status: transaction_1.TransactionStatus.PENDING,
            reference: `txn_${Date.now()}_${userId}`,
        });
        if (!transaction) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        const response = yield axios_1.default.post(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            email,
            amount: amount * 100,
            currency: "NGN",
            reference: transaction.reference,
        }, {
            headers: paystackHeaders,
        });
        if (!((_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.status)) {
            return next((0, http_errors_1.default)(400, "Failed to initialize payment."));
        }
        res.status(200).json({
            status: "success",
            message: "Payment link created",
            authorization_url: response.data.data.authorization_url,
            reference: response.data.data.reference,
        });
    }
    catch (error) {
        console.error(`Unable to initiate paystack transaction: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.userWalletFundingInitialization = userWalletFundingInitialization;
const chargeUserSavedCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { amount } = req.body;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    const validAmount = Number(amount);
    if (!(0, utils_1.isValidNumber)(amount)) {
        return next((0, http_errors_1.default)(400, "Make sure 'amount' is a number greater than or equal to 1."));
    }
    if ((0, utils_1.hasDecimal)(validAmount)) {
        return next((0, http_errors_1.default)(400, "Invalid amount: Please enter a whole number without decimals."));
    }
    try {
        const wallet = yield (0, wallet_2.findWalletByUserId)(userId);
        if (!wallet) {
            return next((0, http_errors_1.default)(400, "No wallet found for this user"));
        }
        if (wallet.status === wallet_1.WalletStatus.SUSPENDED) {
            return next((0, http_errors_1.default)(400, "Your wallet is currently suspended. Please contact support for assistance"));
        }
        const { authorizationCode } = wallet;
        if (!authorizationCode) {
            return next((0, http_errors_1.default)(400, "No Authorization code found for this wallet"));
        }
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)(404, "User not found."));
        }
        const { email } = user;
        const transaction = yield transaction_1.TransactionModel.insertOne({
            userId,
            amount: validAmount,
            currency: "₦",
            type: transaction_1.TransactionType.WALLET_FUNDING,
            status: transaction_1.TransactionStatus.PENDING,
            reference: `txn_${Date.now()}_${userId}`,
        });
        if (!transaction) {
            return next((0, http_errors_1.default)(500, variables_1.unknown_error));
        }
        // Charge user using saved card
        const paystackResponse = yield axios_1.default.post(`${PAYSTACK_BASE_URL}/transaction/charge_authorization`, {
            email,
            amount: amount * 100,
            currency: "NGN",
            reference: transaction.reference,
            authorization_code: authorizationCode,
        }, { headers: paystackHeaders });
        if (paystackResponse.data.data.status === "success") {
            const updatedTransaction = yield transaction_1.TransactionModel.updateOneById(transaction.id, {
                status: transaction_1.TransactionStatus.SUCCESS
            });
            if (!updatedTransaction) {
                return next((0, http_errors_1.default)(500, variables_1.unknown_error));
            }
            const updatedWallet = yield (0, wallet_2.addToUserWalletBalance)(wallet, transaction);
            res.status(200).json({ success: true, message: "Wallet funded successfully using saved card", wallet: updatedWallet });
            return;
        }
        else {
            const updatedTransaction = yield transaction_1.TransactionModel.updateOneById(transaction.id, {
                status: transaction_1.TransactionStatus.FAILED
            });
            if (!updatedTransaction) {
                return next((0, http_errors_1.default)(500, variables_1.unknown_error));
            }
            return next((0, http_errors_1.default)(400, "Transaction failed"));
        }
    }
    catch (error) {
        console.error("Error charging saved card:", error);
        return next((0, http_errors_1.default)(400, variables_1.server_error));
    }
});
exports.chargeUserSavedCard = chargeUserSavedCard;
const verifyUserReference = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const reference = req.params.reference;
    try {
        const response = yield axios_1.default.get(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            headers: paystackHeaders,
        });
        const transaction = yield transaction_1.TransactionModel.findOne({ reference });
        if (!transaction) {
            return next((0, http_errors_1.default)("Transaction not found."));
        }
        ;
        if (transaction.status === transaction_1.TransactionStatus.SUCCESS) {
            return next((0, http_errors_1.default)(400, "This transaction has already been verified."));
        }
        if (response.data.data.status === "success") {
            // const { authorization } = response.data.data;
            // const email = customer.email;
            const wallet = yield (0, wallet_2.findWalletByUserId)(transaction.userId);
            if (!wallet) {
                return next((0, http_errors_1.default)(404, "No wallet found for this user"));
            }
            if (wallet.status === wallet_1.WalletStatus.SUSPENDED) {
                return next((0, http_errors_1.default)(400, "Your wallet is currently suspended. Please contact support for assistance"));
            }
            const updatedTransaction = yield transaction_1.TransactionModel.updateOneById(transaction.id, {
                status: transaction_1.TransactionStatus.SUCCESS
            });
            if (!updatedTransaction) {
                return next((0, http_errors_1.default)(500, variables_1.unknown_error));
            }
            // const updatedWallet = await addToUserWalletBalance(wallet, transaction, authorization?.authorization_code);
            res.status(200).json({
                success: true, message: "Transaction verified successfully. Wallet will be updated via webhook."
            });
            return;
        }
        else {
            const updatedTransaction = yield transaction_1.TransactionModel.updateOneById(transaction.id, {
                status: transaction_1.TransactionStatus.FAILED
            });
            if (!updatedTransaction) {
                return next((0, http_errors_1.default)(500, variables_1.unknown_error));
            }
            return next((0, http_errors_1.default)(400, "Transaction verification failed"));
        }
    }
    catch (error) {
        console.error(`Unable to verify paystack reference: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.verifyUserReference = verifyUserReference;
const getWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const type = req.query.type;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    const isDriver = type === "driver";
    const filter = isDriver ? wallet_1.WalletType.DRIVER : wallet_1.WalletType.USER;
    try {
        const wallet = yield (0, wallet_2.findWalletByUserId)(userId, filter);
        if (!wallet) {
            return next((0, http_errors_1.default)(404, `No wallet found for this ${isDriver ? "driver" : "user"}. Please try creating one.`));
        }
        res.json({
            status: "success",
            message: "Wallet retrieved successfully",
            wallet
        });
    }
    catch (error) {
        console.error(`Unable to get ${isDriver ? "driver" : "user"} wallet: ${error}`);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.getWallet = getWallet;
const createTransferRecipient = (bank_name, account_number) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const response = yield axios_1.default.get(`${PAYSTACK_BASE_URL}/bank`, {
            headers: paystackHeaders,
        });
        if (!((_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.status)) {
            throw new Error("Failed to fetch banks from Paystack");
        }
        const banks = response.data.data;
        // console.log({banks})
        const bank = banks.find((b) => b.name.toLowerCase() === bank_name.toLowerCase());
        if (!bank)
            throw new Error("Invalid bank name provided");
        const bank_code = bank.code;
        // Create the recipient
        const recipientResponse = yield axios_1.default.post(`${PAYSTACK_BASE_URL}/transferrecipient`, {
            type: "nuban",
            name: "Recipient Name", // Change as needed
            account_number,
            bank_code,
            currency: "NGN",
        }, {
            headers: paystackHeaders,
        });
        if (!((_c = recipientResponse === null || recipientResponse === void 0 ? void 0 : recipientResponse.data) === null || _c === void 0 ? void 0 : _c.status)) {
            throw new Error("Failed to create transfer recipient");
        }
        return recipientResponse.data.data.recipient_code;
    }
    catch (error) {
        throw error;
    }
});
const initiateTransfer = (recipient_code, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transferResponse = yield axios_1.default.post(`${PAYSTACK_BASE_URL}/transfer`, {
            source: "balance",
            amount: amount * 100,
            recipient: recipient_code,
            reason: "Wallet withdrawal",
        }, {
            headers: paystackHeaders,
        });
        if (!transferResponse.data.status) {
            // throw new Error("Failed to initiate transfer");
            return undefined;
        }
        // const balance = wallet.balance - amount;
        // const lastTransactionAt = new Date().toISOString();
        return transferResponse.data.data;
    }
    catch (error) {
        console.error(`Unable to inititate transfer: ${error}`);
        return undefined;
        // throw error;
    }
});
const transferFunds = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const userId = req.userId;
    if (!userId) {
        return next((0, http_errors_1.default)(401, variables_1.unauthorized_error));
    }
    try {
        const { bank_name, account_number, amount, password } = req.body;
        if (!password) {
            return next((0, http_errors_1.default)(401, "Password is required"));
        }
        const user = yield user_1.UserModel.findOne({ id: userId });
        if (!user) {
            return next((0, http_errors_1.default)("User not found."));
        }
        if (!user.password) {
            return next((0, http_errors_1.default)(400, "Password not found for this user"));
        }
        const isPasswordCorrect = yield (0, password_utils_1.validatePassword)(password, user.password);
        if (!isPasswordCorrect) {
            return next((0, http_errors_1.default)(400, "Password is incorrect"));
        }
        if (!bank_name || !account_number || !amount) {
            return next(new Error("Bank name, account number, and amount are required"));
        }
        const validAmount = Number(amount);
        if (!(0, utils_1.isValidNumber)(amount)) {
            return next((0, http_errors_1.default)(400, "Make sure 'amount' is a number greater than or equal to 1."));
        }
        if ((0, utils_1.hasDecimal)(validAmount)) {
            return next((0, http_errors_1.default)(400, "Invalid amount: Please enter a whole number without decimals."));
        }
        const wallet = yield (0, wallet_2.findWalletByUserId)(userId, wallet_1.WalletType.DRIVER);
        if (!wallet) {
            return next((0, http_errors_1.default)(404, "No wallet found for this user"));
        }
        if (wallet.balance < amount) {
            return next((0, http_errors_1.default)(400, "Insufficient funds in your wallet to complete this transfer"));
        }
        let recipient_code;
        if ((wallet === null || wallet === void 0 ? void 0 : wallet.recipientCode) && ((_d = wallet === null || wallet === void 0 ? void 0 : wallet.prevBankName) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === bank_name.toLowerCase()) {
            recipient_code = wallet.recipientCode;
        }
        else {
            recipient_code = yield createTransferRecipient(bank_name, account_number);
        }
        const transferData = yield initiateTransfer(recipient_code, validAmount);
        const updatedWallet = yield wallet_1.WalletModel.updateOneById(wallet.id, {
            recipientCode: recipient_code,
            prevBankName: bank_name.toLowerCase()
        });
        if (!updatedWallet) {
            throw new Error("Unable to update wallet");
        }
        // console.log({transferData})
        if (transferData) {
            const reference = transferData === null || transferData === void 0 ? void 0 : transferData.reference;
            const userName = `${user.firstName} ${user.lastName}`;
            const payout = yield payout_1.PayoutModel.insertOne({
                userId: wallet.userId,
                requesterId: wallet.userId,
                amount: validAmount,
                userName,
                type: payout_1.PayoutType.WITHDRAWAL,
                status: payout_1.PayoutStatus.PENDING,
                reference,
                adminViewable: true
            });
            if (!payout) {
                throw new Error(variables_1.unknown_error);
            }
        }
        res.status(200).json({
            success: true,
            message: "Transfer initiated successfully",
            data: transferData,
        });
    }
    catch (error) {
        console.error("Error processing transfer:", error);
        return next((0, http_errors_1.default)(500, variables_1.server_error));
    }
});
exports.transferFunds = transferFunds;
