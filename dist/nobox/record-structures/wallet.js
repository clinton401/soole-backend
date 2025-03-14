"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModel = exports.WalletStructure = exports.WalletType = exports.WalletStatus = void 0;
const config_1 = require("../config");
var WalletStatus;
(function (WalletStatus) {
    WalletStatus["ACTIVE"] = "ACTIVE";
    WalletStatus["SUSPENDED"] = "SUSPENDED";
})(WalletStatus || (exports.WalletStatus = WalletStatus = {}));
var WalletType;
(function (WalletType) {
    WalletType["USER"] = "USER";
    WalletType["DRIVER"] = "DRIVER";
})(WalletType || (exports.WalletType = WalletType = {}));
exports.WalletStructure = {
    space: "Wallet",
    description: "A Record Space for User Wallets",
    structure: {
        userId: {
            description: "ID of the User who owns the Wallet",
            required: true,
            type: String,
        },
        balance: {
            description: "Current balance of the Wallet",
            required: true,
            type: Number,
        },
        currency: {
            description: "Currency type of the Wallet (e.g., USD, EUR)",
            required: true,
            type: String,
        },
        status: {
            description: "Status of the Wallet (ACTIVE or SUSPENDED)",
            required: true,
            type: String,
        },
        totalDeposits: {
            description: "Total amount deposited into the Wallet",
            required: true,
            type: Number,
        },
        type: {
            description: "Type of the Wallet",
            required: true,
            type: String,
        },
        totalWithdrawals: {
            description: "Total amount withdrawn from the Wallet",
            required: true,
            type: Number,
        },
        isDefaultPaymentMethod: {
            description: "Whether this Wallet is the default payment method",
            required: true,
            type: Boolean,
        },
        lastTransactionAt: {
            description: "Timestamp of the last transaction made",
            required: false,
            type: String,
        },
        authorizationCode: {
            description: "Authorization code from paystack",
            required: false,
            type: String,
        },
        recipientCode: {
            description: "recipient code from paystack",
            required: false,
            type: String,
        },
        prevBankName: {
            description: "last bank name user for transfers",
            required: false,
            type: String,
        },
        prevAccountHolderName: {
            description: "last account holder name  for transfers",
            required: false,
            type: String,
        },
        prevAccountNo: {
            description: "last account number  for transfers",
            required: false,
            type: String,
        },
    },
};
exports.WalletModel = (0, config_1.createRowSchema)(exports.WalletStructure);
