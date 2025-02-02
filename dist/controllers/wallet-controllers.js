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
exports.getWallet = exports.verifyUserReference = exports.chargeUserSavedCard = exports.userWalletFundingInitialization = exports.createUserWallet = void 0;
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
const http_errors_1 = __importDefault(require("http-errors"));
const variables_1 = require("../lib/variables");
const user_1 = require("../nobox/record-structures/user");
const wallet_1 = require("../nobox/record-structures/wallet");
const utils_1 = require("../lib/utils");
const transaction_1 = require("../nobox/record-structures/transaction");
const wallet_2 = require("../data/wallet");
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
    console.log((0, utils_1.hasDecimal)(validAmount));
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
            const { authorization } = response.data.data;
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
            const updatedWallet = yield (0, wallet_2.addToUserWalletBalance)(wallet, transaction, authorization === null || authorization === void 0 ? void 0 : authorization.authorization_code);
            res.status(200).json({
                success: true, message: "Wallet funded successfully", wallet: updatedWallet
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
// export const createDriverWallet = async (req: Request, res: Response, next: NextFunction) => {
//     const userId = req.userId;
//     if (!userId) {
//         return next(createError(401, unauthorized_error))
//     }
//     try {
//         const walletExists = await findWalletByUserId(userId, WalletType.DRIVER);
//         if (walletExists) {
//             return next(createError(400, "You already have an active wallet."))
//         }
//         const wallet = await createWallet(userId, WalletType.DRIVER);
//         res.status(201).json({
//             status: "success",
//             message: "Wallet created successfully",
//             wallet
//         })
//     } catch (error) {
//         console.error(`Unable to create driver wallet: ${error}`);
//         return next(createError(500, server_error))
//     }
// }
