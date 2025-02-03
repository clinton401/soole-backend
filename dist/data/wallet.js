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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWallet = exports.deductFromWallet = exports.addToWallet = exports.findWalletByUserId = exports.addToUserWalletBalance = void 0;
const wallet_1 = require("../nobox/record-structures/wallet");
const variables_1 = require("../lib/variables");
const addToUserWalletBalance = (wallet, transaction, authorizationCode) => __awaiter(void 0, void 0, void 0, function* () {
    const balance = wallet.balance + transaction.amount;
    const totalDeposits = wallet.totalDeposits + transaction.amount;
    const lastTransactionAt = new Date().toISOString();
    try {
        const data = Object.assign({ balance: parseFloat(balance.toFixed(2)), totalDeposits: parseFloat(totalDeposits.toFixed(2)), lastTransactionAt }, (authorizationCode ? { authorizationCode } : {}));
        const updatedWallet = yield wallet_1.WalletModel.updateOneById(wallet.id, data);
        if (!updatedWallet) {
            throw new Error(variables_1.unknown_error);
        }
        return updatedWallet;
    }
    catch (error) {
        throw error;
    }
});
exports.addToUserWalletBalance = addToUserWalletBalance;
const findWalletByUserId = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, type = wallet_1.WalletType.USER) {
    try {
        const wallet = yield wallet_1.WalletModel.findOne({ userId, type, status: wallet_1.WalletStatus.ACTIVE });
        return wallet;
    }
    catch (error) {
        throw error;
    }
});
exports.findWalletByUserId = findWalletByUserId;
const addToWallet = (walletId, rideCost, prevBalance) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balance = prevBalance + rideCost;
        const lastTransactionAt = new Date().toISOString();
        const updatedWallet = yield wallet_1.WalletModel.updateOneById(walletId, {
            balance,
            lastTransactionAt,
        });
        if (!updatedWallet) {
            throw new Error(variables_1.unknown_error);
        }
        return updatedWallet;
    }
    catch (error) {
        throw error;
    }
});
exports.addToWallet = addToWallet;
const deductFromWallet = (walletId, amount, prevBalance) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const balance = prevBalance - amount;
        const lastTransactionAt = new Date().toISOString();
        const updatedWallet = yield wallet_1.WalletModel.updateOneById(walletId, {
            balance,
            lastTransactionAt
        });
        if (!updatedWallet) {
            throw new Error(variables_1.unknown_error);
        }
        return updatedWallet;
    }
    catch (error) {
        throw error;
    }
});
exports.deductFromWallet = deductFromWallet;
const createWallet = (userId, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const total = 0.00;
        const wallet = yield wallet_1.WalletModel.insertOne({
            userId,
            balance: total,
            currency: "₦",
            status: wallet_1.WalletStatus.ACTIVE,
            totalDeposits: total,
            totalWithdrawals: total,
            isDefaultPaymentMethod: true,
            type
        });
        if (!wallet) {
            throw new Error(variables_1.unknown_error);
        }
        return wallet;
    }
    catch (error) {
        throw error;
    }
});
exports.createWallet = createWallet;
